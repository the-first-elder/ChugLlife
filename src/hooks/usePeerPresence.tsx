import { useEffect, useState } from "react";

/**
 * Tracks whether a peer is "online": XMTP has no presence, so we treat a DM as
 * active if its latest message is recent and/or an incoming message just landed.
 * Returns online now + a relative label ("Active now", "5m ago", …).
 */
export function usePeerPresence(
  lastActivity?: Date | number | null,
  lastSenderAddress?: string,
  myAddress?: string
): { online: boolean; label: string } {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const ts =
    lastActivity instanceof Date
      ? lastActivity.getTime()
      : typeof lastActivity === "number"
      ? lastActivity
      : 0;

  if (!ts) return { online: false, label: "" };

  const ageMs = now - ts;
  const fromThem =
    !!lastSenderAddress &&
    !!myAddress &&
    lastSenderAddress.toLowerCase() !== myAddress.toLowerCase();

  // A fresh incoming message implies they were online seconds ago.
  const online = ageMs < 2 * 60_000 && (fromThem || ageMs < 60_000);

  const mins = Math.floor(ageMs / 60_000);
  const label =
    online
      ? "Active now"
      : mins < 60
      ? `Active ${mins}m ago`
      : mins < 60 * 24
      ? `Active ${Math.floor(mins / 60)}h ago`
      : `Active ${Math.floor(mins / (60 * 24))}d ago`;

  return { online, label };
}
