import {
  createPublicClient,
  http,
  Address,
  defineChain,
  isAddress,
} from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
    public: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
  testnet: true,
});

export const monadMainnet = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.monad.xyz"] },
    public: { http: ["https://rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://monadscan.com" },
  },
  testnet: false,
});

/**
 * Chuglife runs on Monad **mainnet** — the Chog Genesis collection
 * (0xc96d...73763, 1969 pieces) only exists there. Testnet has no contract,
 * so reads like `balanceOf` return empty data and throw.
 */
export const monad = monadMainnet;

export const monadPublicClient = createPublicClient({
  chain: monadMainnet,
  transport: http("https://rpc.monad.xyz"),
  batch: { multicall: true },
});

/**
 * Chog Genesis — the canonical 1969-piece Chog NFT collection on Monad.
 * Your Chog IS your identity in Chuglife.
 */
export const CHOG_NFT_ADDRESS: Address =
  "0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763";

/** $CHOG token on Monad (optional bonus feature: tipping matches). */
export const CHOG_TOKEN_ADDRESS: Address =
  "0x350035555E10d9AfAF1566AaebfCeD5BA6C27777";

/**
 * Shop payments are real native-MON transfers to this address
 * (`VITE_SHOP_TREASURY` in .env). Undefined → checkout is disabled.
 */
export function shopTreasury(): Address | undefined {
  const raw = (import.meta as { env?: Record<string, string> }).env
    ?.VITE_SHOP_TREASURY?.trim();
  return raw && isAddress(raw, { strict: false }) ? (raw as Address) : undefined;
}

export const IPFS_GATEWAYS = [
  "https://ipfs.filebase.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://4everland.io/ipfs/",
];

export const IPFS_GATEWAY = IPFS_GATEWAYS[0];

/** Stable per-URI choice so retries (onerror) pick the next gateway. */
export function ipfsGateways(uri: string): string[] {
  if (!uri) return [];
  const cidPath = (() => {
    if (uri.startsWith("ipfs://")) return uri.slice("ipfs://".length);
    if (uri.startsWith("/ipfs/")) return uri.slice("/ipfs/".length);
    return null;
  })();
  if (cidPath === null) return [uri];
  return IPFS_GATEWAYS.map((gw) => gw + cidPath.replace(/^ipfs\//, ""));
}

export function ipfsUrl(uri: string): string {
  return ipfsGateways(uri)[0] ?? "";
}
