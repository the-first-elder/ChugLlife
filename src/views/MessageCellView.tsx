import { ReactElement, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Message } from "../model/db";
import db from "../model/db";
import { rankFor } from "../model/rank";
import { ownsItem } from "../model/activity";
import RankBadge from "../components/RankBadge";
import ReactionsView from "./ReactionsView";
import { useReplies } from "../hooks/useReplies";
import { shortAddress } from "../util/shortAddress";
import { LucideCheck, LucideClock } from "lucide-react";

/** Shop cosmetics for a sender (badges & glow). */
function useCosmetics(address: string) {
  const activity = useLiveQuery(
    () => (address ? db.activity.get(address.toLowerCase()) : undefined),
    [address]
  );
  return {
    Crown: ownsItem(activity, "founder-badge"),
    Neon: ownsItem(activity, "neon-name"),
    Aura: ownsItem(activity, "theme-cyber"),
  };
}

export function Content({ message }: { message: Message }): ReactElement {
  const type = (message.contentType as { typeId?: string }).typeId;

  if (type === "text" && typeof message.content === "string") {
    return <span className="whitespace-pre-wrap break-words">{message.content}</span>;
  }

  if (type === "reply") {
    const reply = message.content as {
      content?: string;
      contentTypeId?: string;
    };
    return (
      <span className="flex flex-col">
        <span
          className={`text-[10px] border-l-2 pl-1.5 mb-1 ${
            message.sentByMe
              ? "text-white/70 border-white/30"
              : "text-[#f4f1fe]/60 border-[#836ef9]/50"
          }`}
        >
          ↩ replying to a message
        </span>
        <span className="whitespace-pre-wrap break-words">{reply?.content ?? ""}</span>
      </span>
    );
  }

  return (
    <span className="text-chog-ink/70 break-all">
      Unsupported message type: {type ?? "unknown"}
    </span>
  );
}

export function MessageContent({
  message,
}: {
  message: Message;
}): ReactElement {
  return <Content message={message} />;
}

export function SenderRank({ address, topic }: { address: string; topic?: string }) {
  const activity = useLiveQuery(
    () => (address ? db.activity.get(address.toLowerCase()) : undefined),
    [address]
  );
  const room = useLiveQuery(
    () => (topic ? db.rooms.get(topic) : undefined),
    [topic]
  );
  const isPolice = useLiveQuery(
    () => (topic && address ? db.roomRoles.get(`${topic}-${address.toLowerCase()}`) : undefined),
    [topic, address]
  );

  const isOwner = room && room.owner.toLowerCase() === address.toLowerCase();
  const policeLicensed = ownsItem(activity, "police-license");

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      {isOwner && (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
          title="Room Creator & Admin"
        >
          👑 Admin
        </span>
      )}
      {!isOwner && (isPolice || policeLicensed) && (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/40 shadow-sm"
          title={isPolice ? "Chog Police Moderator" : "Chog Police License"}
        >
          👮 Police{policeLicensed && !isPolice ? " ✓" : ""}
        </span>
      )}
      {activity && (
        <RankBadge
          rank={rankFor(activity.chatPoints + activity.presencePoints)}
          size="sm"
        />
      )}
    </span>
  );
}

function StatusIndicator({ message }: { message: Message }) {
  if (message.sentByMe) {
    if (message.isSending) {
      return (
        <span className="inline-flex items-center gap-0.5 text-white/70" title="Sending…">
          <LucideClock size={9} className="animate-pulse" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-white/80" title="Sent">
        <LucideCheck size={11} />
      </span>
    );
  }
  return null;
}

export default function MessageCellView({
  message,
}: {
  message: Message;
}): ReactElement {
  const replies = useReplies(message);
  const [showActions, setShowActions] = useState(false);
  const time = new Date(message.sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mine = message.sentByMe;
  const { Crown, Neon, Aura } = useCosmetics(message.senderAddress);

  const bubbleClass = mine
    ? [
        "cl-bubble-in relative flex flex-col rounded-2xl rounded-br-md px-3.5 py-2.5 transition-transform duration-150 hover:-translate-y-px",
        "border border-white/10 bg-gradient-to-br from-[#836ef9] to-[#7058f5] text-white",
        "shadow-[0_6px_20px_-8px_rgba(131,110,249,0.7)]",
        Aura
          ? "!from-[#a78bfa] !to-[#ec4899] !shadow-[0_0_24px_-4px_rgba(236,72,153,0.55)]"
          : "",
      ].join(" ")
    : [
        "cl-bubble-in relative flex flex-col rounded-2xl rounded-bl-md px-3.5 py-2.5 transition-transform duration-150 hover:-translate-y-px",
        "border border-[rgba(244,241,254,0.12)] bg-[#0c0c12] text-[#f4f1fe]",
        "shadow-[0_4px_16px_-10px_rgba(0,0,0,0.9)]",
        Aura ? "!border-[#836ef9]/50 !shadow-[0_0_18px_-6px_rgba(131,110,249,0.5)]" : "",
      ].join(" ");

  return (
    <div
      className={`group flex flex-col ${mine ? "self-end items-end" : "self-start items-start"} max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={bubbleClass}>
        <div className="space-y-1.5 text-xs w-full">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[10px] font-bold flex items-center gap-1.5">
              <span
                className={
                  Neon
                    ? "font-extrabold text-[#c4b5fd] [text-shadow:0_0_8px_rgba(167,139,250,0.9),0_0_16px_rgba(131,110,249,0.6)]"
                    : mine
                      ? "text-white/90"
                      : "text-[#f4f1fe]/80 font-mono"
                }
              >
                {Crown && <span title="Founder">👑</span>}{" "}
                {mine ? "You" : shortAddress(message.senderAddress)}
              </span>
              {message.senderAddress && (
                <SenderRank
                  address={message.senderAddress}
                  topic={message.conversationTopic}
                />
              )}
            </span>
            <span
              className={`text-[9px] font-mono tabular-nums flex items-center gap-1 ${
                mine ? "text-white/65" : "text-[#f4f1fe]/50"
              }`}
            >
              {time}
              <StatusIndicator message={message} />
            </span>
          </div>

          <div className="text-sm font-normal break-words leading-relaxed">
            <MessageContent message={message} />
          </div>

          {replies.length > 0 && (
            <div className="py-1">
              {replies.slice(-1).map((r) => (
                <div
                  className={`flex flex-col text-xs rounded-xl rounded-tl-sm p-2 border-l-2 ${
                    mine
                      ? "bg-black/20 text-white/90 border-white/25"
                      : "bg-[#14141b] text-[#f4f1fe]/80 border-[#836ef9]/40"
                  }`}
                  key={r.xmtpID}
                >
                  <span className={`text-[9px] font-mono ${mine ? "text-white/70" : "text-[#f4f1fe]/55"}`}>
                    {shortAddress(r.senderAddress)}
                  </span>
                  <MessageContent message={r} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions surface — always in flow so reactions stay discoverable */}
        <div
          className={`mt-1 flex flex-row items-center gap-x-2 transition-opacity duration-150 ${
            showActions || replies.length > 0 ? "opacity-100" : "opacity-70"
          }`}
        >
          <ReactionsView message={message} />
        </div>
      </div>

      {mine && message.isSending && (
        <span className="mt-0.5 pr-1 font-mono text-[9px] text-[#f4f1fe]/35">
          sending…
        </span>
      )}
    </div>
  );
}
