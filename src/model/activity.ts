import db, { Activity } from "./db";

/** Point rates. Cheap enough that ranks feel alive, expensive enough that spamming is pointless. */
export const EARN_PER_MESSAGE = 5;
export const EARN_PER_ONLINE_MINUTE = 1;

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

/** Own message → MON. Rate-limited by turbo multiplier only. */
export async function creditMessage(key: string): Promise<void> {
  const activity = await getActivity(key);
  if (!activity) return;
  const mult = activity.turboUntil && activity.turboUntil > Date.now() ? 2 : 1;
  const gain = EARN_PER_MESSAGE * mult;
  await db.activity.update(activity.key, {
    points: activity.points + gain,
    chatPoints: activity.chatPoints + gain,
    messageCount: activity.messageCount + 1,
    purchasedAt: new Date(),
  });
}

/**
 * Called roughly once a minute while someone is signed in.
 * Dedupes bursts and stops after 45 idle minutes without a message.
 */
export async function heartbeat(key: string): Promise<void> {
  const activity = await getActivity(key);
  const now = Date.now();
  if (now - activity.lastPresenceAt < 60_000) return;
  const mult = activity.turboUntil && activity.turboUntil > now ? 2 : 1;
  const gain = EARN_PER_ONLINE_MINUTE * mult;
  await db.activity.update(activity.key, {
    points: activity.points + gain,
    presencePoints: activity.presencePoints + gain,
    onlineMinutes: activity.onlineMinutes + 1,
    lastPresenceAt: now,
    purchasedAt: new Date(),
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
