import { Address, erc721Abi } from "viem";
import { monadPublicClient, CHOG_NFT_ADDRESS, ipfsUrl } from "../util/monad";
import db, { ChogNft } from "./db";

export const CHOG_ADDRESS = CHOG_NFT_ADDRESS;

export { CHOG_TOKEN_ADDRESS } from "../util/monad";

export interface ChogTrait {
  traitType: string;
  value: string;
}

const CHOG_ABI = [
  ...erc721Abi,
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

const metadataCache = new Map<string, Promise<ChogNft>>();

function chogKey(contractAddress: string, tokenId: string) {
  return `${contractAddress.toLowerCase()}-${tokenId}`;
}

async function fetchMetadata(
  contractAddress: string,
  tokenId: string
): Promise<ChogNft> {
  const uri: string = await monadPublicClient.readContract({
    address: contractAddress as Address,
    abi: [...erc721Abi, {
      name: "tokenURI",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "tokenId", type: "uint256" }],
      outputs: [{ type: "string" }],
    }],
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });

  const response = await fetch(ipfsUrl(uri));
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata for #${tokenId}`);
  }
  const meta = await response.json();

  const traits: ChogTrait[] = (meta.attributes || []).map(
    (t: { trait_type: string; value: string }) => ({
      traitType: t.trait_type,
      value: t.value,
    })
  );

  return {
    key: chogKey(contractAddress, tokenId),
    contractAddress: contractAddress.toLowerCase(),
    tokenId,
    name: meta.name || `Chog #${tokenId}`,
    image: ipfsUrl(meta.image || ""),
    description: meta.description || "",
    traits,
    fetchedAt: new Date(),
  };
}

/** Fetch (and cache) the metadata for a single Chog token. */
export function getChog(contractAddress: string, tokenId: string): Promise<ChogNft> {
  const key = chogKey(contractAddress, tokenId);

  const cached = metadataCache.get(key);
  if (cached) return cached;

  const p = (async () => {
    const fromDb = await db.chogs.get(key);
    if (fromDb) return fromDb;

    const fetched = await fetchMetadata(contractAddress, tokenId);
    await db.chogs.put(fetched);
    return fetched;
  })().catch((e) => {
    metadataCache.delete(key);
    throw e;
  });

  metadataCache.set(key, p);
  return p;
}

/** All Chogs owned by an address (mind your RPC budget — balance + index loop). */
export async function getOwnedChogs(address?: string): Promise<ChogNft[]> {
  if (!address) return [];

  const balance: bigint = await monadPublicClient.readContract({
    address: CHOG_ADDRESS,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [address as Address],
  });

  if (balance === 0n) return [];

  const ids: string[] = [];
  for (let i = 0n; i < balance; i++) {
    const id: bigint = await monadPublicClient.readContract({
      address: CHOG_ADDRESS,
      abi: CHOG_ABI,
      functionName: "tokenOfOwnerByIndex",
      args: [address as Address, i],
    });
    ids.push(id.toString());
  }

  return Promise.all(ids.map((id) => getChog(CHOG_ADDRESS, id)));
}

const VIBE_WEIGHTS: Record<string, number> = {
  Eyes: 0.28,
  Mouth: 0.18,
  Skin: 0.15,
  Body: 0.15,
  Side: 0.08,
  Base: 0.06,
  Background: 0.05,
  Form: 0.03,
  Tier: 0.02,
};

const FALLBACK_WEIGHT = 0.05;

export interface VibeResult {
  score: number; // 0..100
  shared: ChogTrait[];
  headline: string;
}

export function vibeBetween(
  a: ChogNftTraits | ChogNft,
  b: ChogNftTraits | ChogNft
): VibeResult {
  const traitMap = (t: ChogNftTraits | ChogNft): Map<string, string> => {
    const m = new Map<string, string>();
    for (const tr of t.traits) {
      m.set(tr.traitType, tr.value);
    }
    return m;
  };

  const at = traitMap(a);
  const bt = traitMap(b);

  let total = 0;
  let matched = 0;
  const shared: ChogTrait[] = [];

  for (const [trait, weight] of Object.entries(VIBE_WEIGHTS)) {
    const av = at.get(trait);
    const bv = bt.get(trait);
    if (!av || !bv) continue;
    total += weight;
    if (av === bv) {
      matched += weight;
      shared.push({ traitType: trait, value: av });
    }
  }

  // Any remaining traits not in the weights table
  const weightedTraits = new Set(Object.keys(VIBE_WEIGHTS));
  for (const trait of at.keys()) {
    if (!weightedTraits.has(trait)) {
      const av = at.get(trait);
      const bv = bt.get(trait);
      if (!av || !bv) continue;
      total += FALLBACK_WEIGHT;
      if (av === bv) {
        matched += FALLBACK_WEIGHT;
        shared.push({ traitType: trait, value: av });
      }
    }
  }

  const score = total === 0 ? 0 : Math.round((matched / total) * 100);

  const headline =
    shared.length === 0
      ? "Chaotic opposites attract"
      : score >= 70
        ? "Twin Chogs — this is destiny"
        : score >= 40
          ? "Same Chog energy"
          : "Low-key vibe overlaps";

  return { score, shared, headline };
}

export interface ChogNftTraits {
  traits: ChogTrait[];
}
