import { Address } from "viem";
import { CHOG_NFT_ADDRESS, ipfsUrl } from "../util/monad";
import { getChog } from "./chog";

const ETHERSCAN_V2_BASE = "https://api.etherscan.io/v2/api";

function apiKey(): string {
  const key =
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: Record<string, string> }).env
        ?.VITE_ETHERSCAN_API_KEY) ||
    "";
  return key;
}

interface NftTransfer {
  tokenID: string;
  from: string;
  to: string;
  blockNumber: string;
}

/**
 * Builds a tokenId -> current owner map for the Chog Genesis collection from
 * transfer history (uses the free Etherscan V2 API with chainid=143).
 * Cached in localStorage so we only ever pay this cost once.
 */
export async function chogOwners(): Promise<Record<string, string>> {
  const cacheKey = "chogOwnersV2";
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as Record<string, string>;
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const key = apiKey();
  if (!key) {
    return demoOwners();
  }

  const owners: Record<string, string> = {};
  let page = 1;
  const offset = 1000;

  for (;;) {
    const url = `${ETHERSCAN_V2_BASE}?chainid=143&module=account&action=tokennfttx&contractaddress=${CHOG_NFT_ADDRESS}&page=${page}&offset=${offset}&sort=asc&apikey=${key}`;
    const res = await fetch(url);
    const body = (await res.json()) as {
      status: string;
      message?: string;
      result: NftTransfer[] | string;
    };

    if (body.status !== "1") {
      const message =
        typeof body.result === "string" ? body.result : body.message ?? "";
      // Unauthenticated users quietly get a bundled sample set instead.
      if (/invalid api key|missing/i.test(message)) {
        return demoOwners();
      }
      throw new Error(message || "Failed to fetch Chog transfer history");
    }

    const transfers = body.result as NftTransfer[];
    for (const t of transfers) {
      if (t.to !== "0x0000000000000000000000000000000000000000") {
        owners[t.tokenID] = t.to.toLowerCase();
      }
    }

    if (transfers.length < offset) break;
    page += 1;
    await new Promise((r) => setTimeout(r, 270));
  }

  localStorage.setItem(cacheKey, JSON.stringify(owners));
  return owners;
}

/**
 * Sample holder set used when no Etherscan API key is configured. Data is
 * generated from real on-chain tokenIds + IPFS metadata at build time.
 */
export async function demoOwners(): Promise<Record<string, string>> {
  const [{ demoChogs }] = await Promise.all([
    import("../data/demo-chogs.json"),
  ]);
  const owners: Record<string, string> = {};
  for (const chog of demoChogs) {
    const chogAny = chog as { tokenId: string; address: string };
    owners[chogAny.tokenId] = chogAny.address.toLowerCase();
  }
  return owners;
}

/** Bundled Chogs with real metadata, for demo mode / keyless usage. */
export async function demoChogList(): Promise<
  {
    tokenId: string;
    address: string;
    name: string;
    image: string;
    description: string;
    traits: { traitType: string; value: string }[];
  }[]
> {
  const [{ demoChogs }] = await Promise.all([
    import("../data/demo-chogs.json"),
  ]);
  type DemoChog = (typeof demoChogs)[number];
  const list = demoChogs as DemoChog[];
  return list.map((c) => ({ ...c, image: ipfsUrl(c.image) }));
}

export interface ChogHolder {
  address: string;
  tokenId: string;
}

/** Latest holders of the Chog collection, as (address, tokenId) pairs. */
export async function chogHolderList(): Promise<ChogHolder[]> {
  const owners = await chogOwners();
  return Object.entries(owners).map(([tokenId, address]) => ({
    address,
    tokenId,
  }));
}

/** Holder info enriched with the Chog's metadata. */
export async function chogHolderWithMetadata(
  holder: ChogHolder
): Promise<ChogHolder & { chog: Awaited<ReturnType<typeof getChog>> }> {
  const chog = await getChog(CHOG_NFT_ADDRESS, holder.tokenId);
  return { ...holder, chog };
}

/** Small helper for displaying an owner's token on MonadScan. */
export function chogScanUrl(tokenId: string): string {
  return `https://monadscan.com/nft/${CHOG_NFT_ADDRESS}/${tokenId}`;
}

export type { Address };
export { ipfsUrl };
