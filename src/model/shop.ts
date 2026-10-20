import db from "./db";
import { Activity } from "./db";

export type ShopItemId =
  | "rooms-5"
  | "rooms-8"
  | "turbo"
  | "neon-name"
  | "police-license"
  | "founder-badge"
  | "theme-cyber"
  | "mega-reactions";

export interface ShopItem {
  id: ShopItemId;
  name: string;
  emoji: string;
  blurb: string;
  /** Price in native MON — paid straight from the buyer's wallet. */
  price: string;
  /** Price in earnable Chug Points — lets everyone (demo included) buy. */
  pointsPrice: number;
  kind: "capacity" | "powerup" | "cosmetic";
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "rooms-5",
    name: "Room Pack: 5 rooms",
    emoji: "🏘️",
    blurb: "Raise your room creation cap from 1 to 5. Keep the noise down, keep the vibes up.",
    price: "200",
    pointsPrice: 11000,
    kind: "capacity",
  },
  {
    id: "rooms-8",
    name: "Room Pack: 8 rooms",
    emoji: "🏙️",
    blurb: "Raise your room creation cap to 8. For true community landlords. Expand your network.",
    price: "900",
    pointsPrice: 11500,
    kind: "capacity",
  },
  {
    id: "turbo",
    name: "Turbo Vibes (1h)",
    emoji: "🚀",
    blurb: "Double your rank progress for one hour — climb the ladder twice as fast.",
    price: "200",
    pointsPrice: 10300,
    kind: "powerup",
  },
  {
    id: "neon-name",
    name: "Neon Name Glow",
    emoji: "🪛",
    blurb: "Your name glows radioactive chog violet in every room and chat bubble.",
    price: "300",
    pointsPrice: 10500,
    kind: "cosmetic",
  },
  {
    id: "police-license",
    name: "Chog Police Badge",
    emoji: "🛡️",
    blurb: "Honorary police shield displayed next to your handle across all public rooms.",
    price: "300",
    pointsPrice: 10400,
    kind: "powerup",
  },
  {
    id: "theme-cyber",
    name: "Cosmic Neon Theme",
    emoji: "🌌",
    blurb: "Unlock a radiant violet particle aura on your chat bubbles and profile card.",
    price: "500",
    pointsPrice: 10500,
    kind: "cosmetic",
  },
  {
    id: "mega-reactions",
    name: "Chog Reaction Pack",
    emoji: "🐸",
    blurb: "Exclusive frog reaction set: 🚀 💎 🔥 👑 🐸 with pop animations.",
    price: "300",
    pointsPrice: 10100,
    kind: "cosmetic",
  },
  {
    id: "founder-badge",
    name: "Founder Crown",
    emoji: "👑",
    blurb: "A sparkling crown next to your handle. Pure prestige status. Prove you were early.",
    price: "1500",
    pointsPrice: 12500,
    kind: "cosmetic",
  },
];

export function pointsPrice(item: ShopItem): number {
  return item.pointsPrice;
}

/** Flip the local (Dexie) switches for an item once its payment landed. */
export async function applyPurchase(
  activity: Activity,
  item: ShopItem
): Promise<Activity> {
  const now = Date.now();
  const patch: Partial<Activity> = {};
  const owned = new Set(activity.ownedItems ?? []);
  if (!owned.has(item.id)) {
    owned.add(item.id);
    patch.ownedItems = [...owned];
  }
  if (item.id === "rooms-5") {
    patch.roomSlots = Math.max(activity.roomSlots, 5);
  }
  if (item.id === "rooms-8") {
    patch.roomSlots = Math.max(activity.roomSlots, 8);
  }
  if (item.id === "turbo") {
    patch.turboUntil = now + 60 * 60_000;
  }
  if (Object.keys(patch).length === 0) return activity;
  await db.activity.update(activity.key, { ...patch, purchasedAt: new Date() });
  return { ...activity, ...patch } as Activity;
}

/**
 * Pay for an item with earned Chug Points. Runs as one Dexie transaction so
 * concurrent earners can't resurrect the spent points or lose an unlock.
 */
export async function buyWithPoints(
  address: string,
  item: ShopItem
): Promise<Activity> {
  const key = address.toLowerCase();
  let updated: Activity | undefined;
  await db.transaction("rw", db.activity, async () => {
    const row = await db.activity.get(key);
    if (!row) throw new Error("No activity — sign in first.");
    if (row.points < item.pointsPrice) {
      throw new Error(
        `Not enough Chug Points — this item costs ${item.pointsPrice.toLocaleString()} pts (you have ${row.points.toLocaleString()}).`
      );
    }
    const nextPoints = row.points - item.pointsPrice;
    await db.activity.update(key, { points: nextPoints, purchasedAt: new Date() });
    updated = await applyPurchase({ ...row, points: nextPoints }, item);
  });
  if (!updated) throw new Error("Purchase failed — try again.");
  return updated;
}
