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
import { heartbeat } from "../model/activity";
import { clientAddress as clientAddressFor } from "../model/conversations";
import { hexToBytes } from "viem";
import { Wallet } from "ethers";

const DEMO_KEY_STORAGE = "_chugDemoPrivateKey";

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
  const [isDemo, setIsDemo] = useState<boolean>(
    () => !!localStorage.getItem(DEMO_KEY_STORAGE)
  );

  /** One in-flight XmtpClient.create per identity; StrictMode-safe. */
  const createLock = useRef(new Map<string, Promise<XmtpClient>>());

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const retryConnect = () => {
    if (address) {
      createLock.current.delete(`wallet-${address}`);
    }
    setError(undefined);
    setRetryCount((c) => c + 1);
  };

  /** Wallet path. */
  useEffect(() => {
    if (isDemo) return;
    if (!address || !walletClient) {
      setClient(null);
      setStatus("idle");
      return;
    }

    const identity = `wallet-${address}`;
    let pending = createLock.current.get(identity);
    if (!pending) {
      pending = (async () => {
        try {
          const signer = walletSigner(
            address,
            (msg: string) => {
              const account = walletClient.account ?? address;
              return walletClient.signMessage({
                account,
                message: msg,
              }) as Promise<`0x${string}`>;
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

    (async () => {
      setStatus("connecting");
      setError(undefined);
      try {
        const newClient = await pending;
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

    const ensureKey = () => {
      const existing = localStorage.getItem(DEMO_KEY_STORAGE) as `0x${string}` | null;
      if (existing) return existing;
      const generated = new Wallet(Wallet.createRandom().privateKey).privateKey as `0x${string}`;
      localStorage.setItem(DEMO_KEY_STORAGE, generated);
      return generated;
    };

    (async () => {
      setStatus("connecting");
      setError(undefined);
      const key = ensureKey();
      const lockId = `demo-${key}`;
      let pending = createLock.current.get(lockId);
      if (!pending) {
        pending = (async () => {
          try {
            const signer = createEOASigner(key);
            return await XmtpClient.create(signer, {
              env: xmtpEnv(),
              appVersion: "chuglife/1.0.0 (demo)",
            } as never);
          } catch (e) {
            createLock.current.delete(lockId);
            throw e;
          }
        })();
        createLock.current.set(lockId, pending);
      }
      try {
        const newClient = await pending;
        setClient(newClient);
        setStatus("ready");
      } catch (e) {
        console.error("XMTP demo client creation failed", e);
        setStatus("error");
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => undefined;
  }, [isDemo]);

  function startDemo(demoKey?: `0x${string}`) {
    if (demoKey) {
      localStorage.setItem(DEMO_KEY_STORAGE, demoKey);
      setClient(null);
    }
    setIsDemo(true);
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
      {/* Non-intrusive status toast when connecting / awaiting wallet signature */}
      {status === "connecting" && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#161228] border border-[#836ef9]/50 shadow-chog px-5 py-3 rounded-2xl flex items-center gap-3 text-sm text-[#f4f1fe] animate-pulse">
          <span className="w-3 h-3 rounded-full bg-[#836ef9] animate-ping" />
          <span>Summoning your XMTP identity… Check your wallet for signature request</span>
        </div>
      )}
      {children}
    </ClientContext.Provider>
  );
}
