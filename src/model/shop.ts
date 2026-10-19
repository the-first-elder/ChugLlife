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
  /** MON price */
  price: number;
  kind: "capacity" | "powerup" | "cosmetic";
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "rooms-5",
    name: "Room Pack: 5 rooms",
    emoji: "🏘️",
    blurb: "Raise your room creation cap from 1 to 5. Keep the noise down, keep the vibes up.",
    price: 1000,
    kind: "capacity",
  },
  {
    id: "rooms-8",
    name: "Room Pack: 8 rooms",
    emoji: "🏙️",
    blurb: "Raise your room creation cap to 8. For true community landlords. Expand your network.",
    price: 1500,
    kind: "capacity",
  },
  {
    id: "turbo",
    name: "Turbo Vibes (1h)",
    emoji: "🚀",
    blurb: "Double MON earnings for one hour: 10 MON per message and 2 MON per online minute.",
    price: 300,
    kind: "powerup",
  },
  {
    id: "neon-name",
    name: "Neon Name Glow",
    emoji: "🪛",
    blurb: "Your display name glows radioactive chog violet in every room and chat cell.",
    price: 500,
    kind: "cosmetic",
  },
  {
    id: "police-license",
    name: "Chog Police Badge",
    emoji: "🛡️",
    blurb: "Honorary police shield displayed next to your handle across all public rooms.",
    price: 400,
    kind: "powerup",
  },
  {
    id: "theme-cyber",
    name: "Cosmic Neon Theme",
    emoji: "🌌",
    blurb: "Unlock radiant violet particle aura on your chat bubbles and profile card.",
    price: 800,
    kind: "cosmetic",
  },
  {
    id: "mega-reactions",
    name: "Chog Reaction Pack",
    emoji: "🐸",
    blurb: "Exclusive frog reaction set: 🐸 🚀 💎 🔥 👑 with vibrating animations.",
    price: 450,
    kind: "cosmetic",
  },
  {
    id: "founder-badge",
    name: "Founder Wordmark",
    emoji: "👑",
    blurb: "A sparkling radiant crown next to your handle. Pure prestige status. Prove you were early.",
    price: 2500,
    kind: "cosmetic",
  },
];

const CREDITS: Partial<Record<(typeof SHOP_ITEMS)[number]["id"], number>> = {
  "rooms-5": 4,
  "rooms-8": 7,
};

export async function applyPurchase(
  activity: Activity,
  item: ShopItem
): Promise<Activity> {
  if (activity.points < item.price) {
    throw new Error(`Not enough MON — need ${item.price}, have ${activity.points}`);
  }
  const now = Date.now();
  const patch: Partial<Activity> = {
    points: activity.points - item.price,
    purchasedAt: new Date(),
  };
  if (item.id === "rooms-5") {
    patch.roomSlots = Math.max(activity.roomSlots, 5);
  }
  if (item.id === "rooms-8") {
    patch.roomSlots = Math.max(activity.roomSlots, 8);
  }
  if (item.id === "turbo") {
    patch.turboUntil = now + 60 * 60_000;
  }
  await db.activity.update(activity.key, patch);
  return { ...activity, ...patch } as Activity;
}

export const SHOP_CREDITS: typeof CREDITS = CREDITS;
