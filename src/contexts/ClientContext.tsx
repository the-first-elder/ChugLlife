import {
  Client as XmtpClient,
  IdentifierKind,
  Signer,
  createEOASigner,
} from "@xmtp/browser-sdk";
import {
  createContext,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAccount, useWalletClient } from "wagmi";
import { heartbeat, applyDemoGrant } from "../model/activity";
import { clientAddress as clientAddressFor } from "../model/conversations";
import { DEMO_KEY_STORAGE } from "../model/db";
import { hexToBytes } from "viem";
import { Wallet } from "ethers";
import { LucideX } from "lucide-react";

/**
 * XMTP stores its SQLite db in OPFS, which only allows one open connection per
 * origin. A second tab (or a second client left over from an identity switch)
 * traps the wasm module with "memory access out of bounds". A Web Lock makes
 * exactly one tab the messaging instance.
 */
const TAB_LOCK_NAME = "chuglife-xmtp";

class TabLockedError extends Error {
  constructor() {
    super(
      "Chuglife messaging is already running in another tab. Close the other tab and tap retry — secure chat only works in one tab at a time."
    );
    this.name = "TabLockedError";
  }
}

type ClientStatus = {
  client: XmtpClient | null;
  setClient: (client: XmtpClient | null) => void;
  status: "idle" | "connecting" | "ready" | "error";
  error?: string;
  isDemo: boolean;
  startDemo: (demoKey?: `0x${string}`) => void;
  stopDemo: () => void;
  retryConnect: () => void;
};

export const ClientContext = createContext<ClientStatus>({
  client: null,
  setClient: () => undefined,
  status: "idle",
  isDemo: false,
  startDemo: () => undefined,
  stopDemo: () => undefined,
  retryConnect: () => undefined,
});

/** Wrap a wagmi wallet client into an XMTP EOA signer. */
function walletSigner(
  address: `0x${string}`,
  signMessage: (message: string) => Promise<`0x${string}`>
): Signer {
  return {
    type: "EOA",
    getIdentifier: () =>
      Promise.resolve({
        identifier: address,
        identifierKind: IdentifierKind.Ethereum,
      }),
    signMessage: async (message: string): Promise<Uint8Array> => {
      const sig = await signMessage(message);
      return hexToBytes(sig.startsWith("0x") ? sig : `0x${sig}`);
    },
  };
}

function xmtpEnv(): "production" | "dev" {
  const env = (import.meta as { env?: Record<string, string> }).env
    ?.VITE_XMTP_ENV;
  return env === "dev" ? "dev" : "production";
}

/**
 * Holds the XMTP V3 client. Sources, in order of precedence:
 *  - demo mode (a persistent generated key stored in localStorage)
 *  - the connected wagmi wallet
 */
export default function ClientProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const [client, setClient] = useState<XmtpClient | null>(null);
  const [status, setStatus] = useState<ClientStatus["status"]>("idle");
  const [error, setError] = useState<string | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  const [awaitingSignature, setAwaitingSignature] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [isDemo, setIsDemo] = useState<boolean>(
    () => !!localStorage.getItem(DEMO_KEY_STORAGE)
  );

  /** One in-flight XmtpClient.create per identity; StrictMode-safe. */
  const createLock = useRef(new Map<string, Promise<XmtpClient>>());
  /** Already-created clients, so re-runs never re-request a signature. */
  const clientCache = useRef(new Map<string, XmtpClient>());
  /** Demo creates keyed by private key; StrictMode-safe. */
  const demoLock = useRef(new Map<string, Promise<XmtpClient>>());

  /** Exclusive messaging lock held while this tab owns the OPFS database. */
  const tabLockRelease = useRef<(() => void) | null>(null);
  const tabLockRequest = useRef<Promise<boolean> | null>(null);

  function acquireTabLock(): Promise<boolean> {
    if (tabLockRelease.current) return Promise.resolve(true);
    if (typeof navigator === "undefined" || !("locks" in navigator)) {
      return Promise.resolve(true);
    }
    if (!tabLockRequest.current) {
      const request = new Promise<boolean>((resolve) => {
        navigator.locks
          .request(TAB_LOCK_NAME, { ifAvailable: true }, async (lock) => {
            if (!lock) {
              resolve(false);
              return;
            }
            resolve(true);
            let handle: () => void = () => undefined;
            await new Promise<void>((release) => {
              handle = release;
              tabLockRelease.current = release;
            });
            if (tabLockRelease.current === handle) {
              tabLockRelease.current = null;
              tabLockRequest.current = null;
            }
          })
          .catch(() => resolve(true));
      });
      tabLockRequest.current = request;
      // Another tab owns messaging: allow a later retry to re-request.
      void request.then((ok) => {
        if (!ok && tabLockRequest.current === request) {
          tabLockRequest.current = null;
        }
      });
    }
    return tabLockRequest.current;
  }

  function releaseTabLock() {
    tabLockRelease.current?.();
    tabLockRelease.current = null;
    tabLockRequest.current = null;
  }

  /** The OPFS db fits one live client — never keep two identities open. */
  function closeOtherClients(keepIdentity?: string) {
    for (const [id, cached] of Array.from(clientCache.current.entries())) {
      if (keepIdentity && id === keepIdentity) continue;
      try {
        cached.close();
      } catch {
        // already torn down
      }
      clientCache.current.delete(id);
      createLock.current.delete(id);
      demoLock.current.delete(id);
    }
    const alive = new Set(clientCache.current.values());
    setClient((current) => (current && alive.has(current) ? current : null));
  }

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const retryConnect = () => {
    if (address) {
      createLock.current.delete(`wallet-${address}`);
      clientCache.current.delete(`wallet-${address}`);
    }
    if (isDemo) {
      const key = localStorage.getItem(DEMO_KEY_STORAGE);
      if (key) demoLock.current.delete(`demo-${key}`);
    }
    // A trapped wasm client can't heal itself — drop it and start clean.
    closeOtherClients();
    releaseTabLock();
    setError(undefined);
    setRetryCount((c) => c + 1);
  };

  /** Wallet path. */
  useEffect(() => {
    // A real wallet always wins over a lingering demo identity — otherwise
    // the stored demo key keeps forcing demo mode after connecting.
    if (address && walletClient && isDemo) {
      localStorage.removeItem(DEMO_KEY_STORAGE);
      closeOtherClients();
      releaseTabLock();
      setIsDemo(false);
      setClient(null);
      setStatus("idle");
      // Demo ran on DB-demo — reload so real mode opens the real database.
      window.setTimeout(() => window.location.reload(), 30);
      return;
    }
    if (isDemo) return;
    if (!address || !walletClient) {
      // Wallet gone: tear the session down and hand the OPFS lock back.
      closeOtherClients();
      releaseTabLock();
      setClient(null);
      setStatus("idle");
      return;
    }

    const identity = `wallet-${address}`;

    // Already connected this session — never re-trigger "connecting".
    const cached = clientCache.current.get(identity);
    if (cached) {
      setClient(cached);
      setStatus("ready");
      return;
    }

    (async () => {
      setStatus("connecting");
      setError(undefined);
      try {
        if (!(await acquireTabLock())) throw new TabLockedError();

        let pending = createLock.current.get(identity);
        if (!pending) {
          // Only one identity may hold the OPFS db at a time.
          closeOtherClients(identity);
          pending = (async () => {
            try {
              const signer = walletSigner(
                address,
                async (msg: string) => {
                  const account = walletClient.account ?? address;
                  setAwaitingSignature(true);
                  try {
                    return (await walletClient.signMessage({
                      account,
                      message: msg,
                    })) as `0x${string}`;
                  } finally {
                    setAwaitingSignature(false);
                  }
                }
              );
              return await XmtpClient.create(signer, {
                env: xmtpEnv(),
                appVersion: "chuglife/1.0.0",
              } as never);
            } catch (e) {
              createLock.current.delete(identity);
              throw e;
            }
          })();
          createLock.current.set(identity, pending);
        }

        const newClient = await pending;
        clientCache.current.set(identity, newClient);
        setClient(newClient);
        setStatus("ready");
      } catch (e) {
        console.error("XMTP client creation failed", e);
        createLock.current.delete(identity);
        setStatus("error");
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => undefined;
  }, [address, walletClient, isDemo, retryCount]);

  /** Demo path: persistent generated key, no wallet required. */
  useEffect(() => {
    if (!isDemo) return;

    const freshKey = () => {
      const generated = new Wallet(Wallet.createRandom().privateKey)
        .privateKey as `0x${string}`;
      localStorage.setItem(DEMO_KEY_STORAGE, generated);
      return generated;
    };

    async function createDemoClient(key: `0x${string}`): Promise<XmtpClient> {
      const signer = createEOASigner(key);
      return await XmtpClient.create(signer, {
        env: xmtpEnv(),
        appVersion: "chuglife/1.0.0 (demo)",
      } as never);
    }

    (async () => {
      setError(undefined);

      const storedKey = localStorage.getItem(
        DEMO_KEY_STORAGE
      ) as `0x${string}` | null;
      const key = storedKey ?? freshKey();

      const cacheId = `demo-${key}`;
      const cached = clientCache.current.get(cacheId);
      if (cached) {
        setClient(cached);
        setStatus("ready");
        return;
      }

      setStatus("connecting");

      try {
        if (!(await acquireTabLock())) throw new TabLockedError();

        let pending = demoLock.current.get(cacheId);
        if (!pending) {
          // Only one identity may hold the OPFS db at a time.
          closeOtherClients(cacheId);
          pending = createDemoClient(key);
          demoLock.current.set(cacheId, pending);
          pending.catch(() => demoLock.current.delete(cacheId));
        }

        const newClient = await pending;
        // The demo identity can be revoked mid-flight (wallet connected) —
        // never surface a demo client for a wallet session.
        if (localStorage.getItem(DEMO_KEY_STORAGE) !== key) return;
        clientCache.current.set(cacheId, newClient);
        setClient(newClient);
        setStatus("ready");
        void applyDemoGrant(clientAddressFor(newClient).toLowerCase());
      } catch (e) {
        // XMTP caps 10 installations per inbox. When demo keys from prior
        // runs burn their slots (e.g. a wiped local DB), rotate to a fresh
        // identity and retry once so the demo never bricks itself.
        const msg = e instanceof Error ? e.message : String(e);
        if (/already registered .* installations/i.test(msg)) {
          console.warn("Demo inbox out of installations — rotating demo key");
          indexedDB.deleteDatabase("DB-demo");
          try {
            const rotated = freshKey();
            const newClient = await createDemoClient(rotated);
            if (localStorage.getItem(DEMO_KEY_STORAGE) !== rotated) return;
            clientCache.current.set(`demo-${rotated}`, newClient);
            setClient(newClient);
            setStatus("ready");
          } catch (err) {
            console.error("XMTP demo client creation failed", err);
            setStatus("error");
            setError(err instanceof Error ? err.message : String(err));
          }
          return;
        }
        console.error("XMTP demo client creation failed", e);
        setStatus("error");
        setError(msg);
      }
    })();

    return () => undefined;
  }, [isDemo, retryCount]);

  /** Delay the toast so fast connections never flash it; time out zombie connects. */
  useEffect(() => {
    if (status !== "connecting") {
      setShowToast(false);
      setToastDismissed(false);
      setAwaitingSignature(false);
      return;
    }
    const showTimer = setTimeout(() => setShowToast(true), 700);
    const timeout = setTimeout(() => {
      setStatus("error");
      setError("Couldn't finish setting up your inbox. Tap retry to try again.");
    }, 60_000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(timeout);
    };
  }, [status]);

  function startDemo(demoKey?: `0x${string}`) {
    const switchingIdentity =
      !isDemo ||
      (!!demoKey && demoKey !== localStorage.getItem(DEMO_KEY_STORAGE));
    if (demoKey) {
      localStorage.setItem(DEMO_KEY_STORAGE, demoKey);
    }
    // A wallet client can't share the OPFS db with the demo identity.
    if (switchingIdentity) closeOtherClients();
    setClient(null);
    setIsDemo(true);
    // Demo runs on DB-demo — full reload so the local database re-opens in
    // demo mode and demo chats/points stay out of the real app.
    window.setTimeout(() => window.location.assign("/conversations"), 30);
  }

  useEffect(() => {
    const helpers = { startDemo, stopDemo };
    (window as unknown as { __chugMatch?: unknown }).__chugMatch = helpers;
    (window as unknown as { __chugLife?: unknown }).__chugLife = helpers;
  });

  useEffect(() => {
    if (!client) return;
    const key = clientAddressFor(client);
    const timer = setInterval(() => {
      void heartbeat(key);
    }, 60_000);
    void heartbeat(key);
    return () => clearInterval(timer);
  }, [client]);

  function stopDemo() {
    localStorage.removeItem(DEMO_KEY_STORAGE);
    setIsDemo(false);
    setClient(null);
    setStatus("idle");
    setAwaitingSignature(false);
    closeOtherClients();
    releaseTabLock();
    clientCache.current.clear();
    demoLock.current.clear();
    createLock.current.clear();
    // Back to the real database — reload so the wallet's demo-free state loads.
    window.setTimeout(() => window.location.assign("/login"), 30);
  }

  const value: ClientStatus = {
    client: status === "ready" ? client : null,
    setClient,
    status,
    error,
    isDemo,
    startDemo,
    stopDemo,
    retryConnect,
  };

  return (
    <ClientContext.Provider value={value}>
      {/* Non-intrusive status toast — delayed so fast connects never flash it */}
      {status === "connecting" && showToast && !toastDismissed && (
        <div
          className="fixed left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
          style={{ top: "calc(4.5rem + env(safe-area-inset-top))" }}
          role="status"
        >
          <div className="cl-fade-in flex items-center gap-3 rounded-2xl border border-[#836ef9]/40 bg-[#0c0c12]/95 px-4 py-3 text-[#f4f1fe] shadow-chog backdrop-blur-xl">
            <span
              aria-hidden
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#836ef9]/25 border-t-[#836ef9]"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold">
                {isDemo
                  ? "Waking up your Chog identity…"
                  : awaitingSignature
                  ? "Check your wallet"
                  : "Connecting your Chog identity…"}
              </div>
              <div className="truncate text-[10px] text-[#f4f1fe]/55">
                {isDemo
                  ? "Loading your demo inbox"
                  : awaitingSignature
                  ? "Sign the request to finish setup"
                  : "Setting up your secure inbox"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastDismissed(true)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-[#f4f1fe]/40 transition hover:bg-white/10 hover:text-white"
            >
              <LucideX size={14} />
            </button>
          </div>
        </div>
      )}
      {children}
    </ClientContext.Provider>
  );
}
