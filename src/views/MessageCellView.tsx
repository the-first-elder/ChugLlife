import { ReactElement } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Message } from "../model/db";
import db from "../model/db";
import { rankFor } from "../model/rank";
import RankBadge from "../components/RankBadge";
import ReactionsView from "./ReactionsView";
import { useReplies } from "../hooks/useReplies";
import { shortAddress } from "../util/shortAddress";

export function Content({ message }: { message: Message }): ReactElement {
  const type = (message.contentType as { typeId?: string }).typeId;

  if (type === "text" && typeof message.content === "string") {
    return <span className="whitespace-pre-wrap">{message.content}</span>;
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
        <span className="whitespace-pre-wrap">{reply?.content ?? ""}</span>
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
      {!isOwner && isPolice && (
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/40 shadow-sm"
          title="Chog Police Moderator"
        >
          👮 Police
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

export default function MessageCellView({
  message,
}: {
  message: Message;
}): ReactElement {
  const replies = useReplies(message);
  const time = new Date(message.sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={
        message.sentByMe
          ? "self-end flex flex-col max-w-[85%] sm:max-w-lg px-3.5 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-br from-[#836ef9] to-[#7058f5] text-white shadow-chog"
          : "self-start flex flex-col max-w-[85%] sm:max-w-lg px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[#161228] border border-[rgba(244,241,254,0.12)] text-[#f4f1fe] shadow-sm"
      }
    >
      <div className="space-y-1.5 text-xs w-full">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[10px] font-bold flex items-center gap-1.5">
            <span className={message.sentByMe ? "text-white/90" : "text-[#f4f1fe]/80 font-mono"}>
              {message.sentByMe ? "You" : shortAddress(message.senderAddress)}
            </span>
            {message.senderAddress && (
              <SenderRank
                address={message.senderAddress}
                topic={message.conversationTopic}
              />
            )}
          </span>
          <span
            className={`text-[9px] font-mono tabular-nums ${
              message.sentByMe ? "text-white/65" : "text-[#f4f1fe]/50"
            }`}
          >
            {time}
            {message.isSending && " · sending…"}
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
                  message.sentByMe
                    ? "bg-black/20 text-white/90 border-white/25"
                    : "bg-[#1e183a] text-[#f4f1fe]/80 border-[#836ef9]/40"
                }`}
                key={r.xmtpID}
              >
                <span className={`text-[9px] font-mono ${message.sentByMe ? "text-white/70" : "text-[#f4f1fe]/55"}`}>
                  {shortAddress(r.senderAddress)}
                </span>
                <MessageContent message={r} />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-row items-center gap-x-3 pt-0.5">
          <ReactionsView message={message} />
        </div>
      </div>
    </div>
  );
}
