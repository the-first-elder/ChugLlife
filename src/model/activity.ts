import db, { Activity } from "./db";

/** Point rates. Cheap enough that ranks feel alive, expensive enough that spamming is pointless. */
export const EARN_PER_MESSAGE = 25;
export const EARN_PER_ONLINE_MINUTE = 2;
/** One-time starter credit for demo identities so the Shop is testable. */
export const DEMO_STARTER_GRANT = 12500;

export async function getActivity(key: string): Promise<Activity> {
  const found = await db.activity.get(key);
  if (found) return found;
  const fresh: Activity = {
    key,
    points: 0,
    chatPoints: 0,
    presencePoints: 0,
    onlineMinutes: 0,
    messageCount: 0,
    lastPresenceAt: 0,
    roomSlots: 1,
    purchasedAt: new Date(),
  };
  await db.activity.put(fresh);
  return fresh;
}

export async function setActivityPoints(
  activity: Activity,
  points: number
): Promise<void> {
  await db.activity.update(activity.key, {
    points: Math.max(0, Math.round(points)),
    purchasedAt: new Date(),
  });
}

/**
 * Read-modify-write on the points ledger. Every mutation runs inside a Dexie
 * transaction so concurrent writers (heartbeat vs grant vs shop) can't clobber
 * each other with stale values.
 */
async function bumpPoints(
  key: string,
  fn: (row: Activity) => Partial<Activity>
): Promise<void> {
  const normalized = key.toLowerCase();
  await db.transaction(
    "rw",
    db.activity,
    async () => {
      const row = (await db.activity.get(normalized)) ?? (await getActivity(normalized));
      await db.activity.update(normalized, { ...fn(row), purchasedAt: new Date() });
    }
  );
}

/** Own message → MON. Rate-limited by turbo multiplier only. */
export async function creditMessage(key: string): Promise<void> {
  await bumpPoints(key.toLowerCase(), (row) => {
    const mult = row.turboUntil && row.turboUntil > Date.now() ? 2 : 1;
    const gain = EARN_PER_MESSAGE * mult;
    return {
      points: row.points + gain,
      chatPoints: row.chatPoints + gain,
      messageCount: row.messageCount + 1,
    };
  });
}

/**
 * Called roughly once a minute while someone is signed in.
 * Dedupes bursts and stops after 45 idle minutes without a message.
 */
export async function heartbeat(key: string): Promise<void> {
  await bumpPoints(key.toLowerCase(), (row) => {
    const now = Date.now();
    if (now - row.lastPresenceAt < 60_000) return {};
    const mult = row.turboUntil && row.turboUntil > now ? 2 : 1;
    const gain = EARN_PER_ONLINE_MINUTE * mult;
    return {
      points: row.points + gain,
      presencePoints: row.presencePoints + gain,
      onlineMinutes: row.onlineMinutes + 1,
      lastPresenceAt: now,
    };
  });
}

/** Ranks mix chat activity & presence; higher of the two wins the crown. */
export function rankPointsOf(a: Activity): {
  activityPoints: number;
  messages: number;
  onlineHours: number;
} {
  return {
    activityPoints: a.chatPoints + a.presencePoints,
    messages: a.messageCount,
    onlineHours: Math.round((a.onlineMinutes / 60) * 10) / 10,
  };
}

/** Demo identities start with a funded wallet of Chug Points. */
export async function applyDemoGrant(key: string): Promise<void> {
  await bumpPoints(key.toLowerCase(), (row) => {
    if (row.claimedGrant) return {};
    return {
      points: row.points + DEMO_STARTER_GRANT,
      claimedGrant: true,
    };
  });
}

/** Item ids this identity owns (for cosmetics & badges). */
export function ownedItemsOf(a: Activity | undefined): string[] {
  return a?.ownedItems ?? [];
}

export function ownsItem(a: Activity | undefined, itemId: string): boolean {
  return ownedItemsOf(a).includes(itemId);
}
