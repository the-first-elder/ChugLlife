import { ReactElement, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Conversation } from "../model/db";
import { getXMTPGroup, memberAddresses, clientAddress } from "../model/conversations";
import { rankFor } from "../model/rank";
import db from "../model/db";
import PeerAvatar from "./PeerAvatar";
import { shortAddress } from "../util/shortAddress";
import { useClient } from "../hooks/useClient";
import {
  LucideCrown,
  LucideShieldCheck,
  LucideUsers,
} from "lucide-react";

/** Starter rooms carry fake owner addresses (0x000…0001) — don't roster them. */
const PLACEHOLDER_OWNER = /^0x0{39}[0-9a-f]$/;

/**
 * Right-hand roster for a room: member count, NFT avatars, wallet addresses
 * and rank/role badges. Also usable for DMs (shows just the peer).
 */
export default function RoomMembersRail({
  conversation,
  isRoom,
}: {
  conversation: Conversation;
  isRoom: boolean;
}): ReactElement {
  const client = useClient();
  const me = client ? clientAddress(client) : "";
  const [addresses, setAddresses] = useState<(string | undefined)[]>([]);
  const [error, setError] = useState<string | undefined>();
  const room = useLiveQuery(
    () => db.rooms.get(conversation.topic),
    [conversation.topic]
  );

  useEffect(() => {
    if (!isRoom || !client) return;
    let cancelled = false;
    (async () => {
      let list: string[] = [];
      try {
        const group = await getXMTPGroup(client, conversation);
        list = (await memberAddresses(group))
          .map((m) => m.address)
          .filter((a): a is string => !!a);
      } catch {
        // Local/starter rooms have no XMTP group behind them — fall back to
        // the roster we know locally (me + the room owner) instead of erroring.
      }
      if (cancelled) return;

      const fallback: string[] = [];
      if (me) fallback.push(me);
      if (room?.owner && !PLACEHOLDER_OWNER.test(room.owner)) {
        fallback.push(room.owner);
      }
      const merged = [...new Set([...list, ...fallback])];

      setAddresses(merged);
      // We always have at least ourselves locally — never show a scary
      // "room not found on XMTP" banner for local/demo rooms.
      setError(undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [client, conversation, isRoom, me, room?.owner]);

  const rows: { address: string; isMe: boolean }[] = isRoom
    ? addresses
        .filter((a): a is string => !!a)
        .map((a) => ({ address: a, isMe: a === me }))
    : conversation.peerAddress
      ? [{ address: conversation.peerAddress, isMe: false }]
      : [];

  return (
    <aside
      data-testid="room-members-rail"
      className="hidden lg:flex w-60 shrink-0 flex-col gap-3 border-l border-[rgba(244,241,254,0.08)] bg-[#08080d]/70 px-3.5 py-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-1">
        <span className="cl-section-title flex items-center gap-1.5">
          <LucideUsers size={12} className="text-[#836ef9]" />
          {isRoom ? "Room roster" : "Peer"}
        </span>
        <span
          data-testid="member-count"
          className="rounded-full bg-[#836ef9]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#a99bfc] border border-[#836ef9]/30 tabular-nums"
        >
          {rows.length || "—"}
        </span>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-[10px] text-red-200/80">
          {error}
        </p>
      )}

      {!error && rows.length === 0 && (
        <p className="px-1 text-[10px] leading-relaxed text-[#f4f1fe]/45">
          No members synced yet — once the room syncs, roster shows here.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {rows.map(({ address, isMe }) => (
          <MemberRow
            key={address}
            address={address}
            isMe={isMe}
            topic={conversation.topic}
            isOwner={!!room && room.owner.toLowerCase() === address.toLowerCase()}
          />
        ))}
      </div>

      {room && (
        <p className="mt-auto px-1 pt-3 text-[10px] leading-relaxed text-[#f4f1fe]/40">
          🐸 Every member's chog & rank is on display — collect, chat, climb.
        </p>
      )}
    </aside>
  );
}

function MemberRow({
  address,
  isMe,
  topic,
  isOwner,
}: {
  address: string;
  isMe: boolean;
  topic: string;
  isOwner: boolean;
}): ReactElement {
  const activity = useLiveQuery(
    () => db.activity.get(address.toLowerCase()),
    [address]
  );
  const police = useLiveQuery(
    () => db.roomRoles.get(`${topic}-${address.toLowerCase()}`),
    [topic, address]
  );
  const rank = activity
    ? rankFor(activity.chatPoints + activity.presencePoints)
    : undefined;

  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[rgba(244,241,254,0.07)] bg-[#0c0c12] px-2.5 py-2">
      <PeerAvatar address={address} size={30} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-center gap-1 truncate font-mono text-[11px] font-bold text-[#f4f1fe]">
          {shortAddress(address)}
          {isMe && (
            <span className="rounded bg-[#5ce68a]/15 px-1 text-[8px] font-extrabold text-[#5ce68a]">
              YOU
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-[#f4f1fe]/50">
          {rank && (
            <span title={rank.name}>
              {rank.emoji} {rank.name}
            </span>
          )}
          {isOwner && (
            <span className="inline-flex items-center gap-0.5 font-bold text-[#f59e0b]">
              <LucideCrown size={9} /> owner
            </span>
          )}
          {police && (
            <span className="inline-flex items-center gap-0.5 font-bold text-[#14B8A6]">
              <LucideShieldCheck size={9} /> police
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
