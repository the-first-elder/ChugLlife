import { ReactElement } from "react";
import { Conversation, Message } from "../model/db";
import { shortAddress } from "../util/shortAddress";
import ReactTimeAgo from "react-time-ago";
import { MessageContent } from "./MessageCellView";
import { useParams } from "react-router-dom";
import { LucideUsersRound, LucideChevronRight } from "lucide-react";

function avatarLabel(conversation: Conversation): string {
  const title = isRoom(conversation)
    ? conversation.title || "Room"
    : shortAddress(conversation.peerAddress);
  return (title.replace(/[^a-zA-Z0-9]/g, "")[0] || "C").toUpperCase();
}

function isRoom(conversation: Conversation): boolean {
  return conversation.peerAddress === "";
}

export default function ConversationCellView({
  conversation,
  latestMessage,
}: {
  conversation: Conversation;
  latestMessage: Message | undefined;
}): ReactElement {
  const { conversationTopic } = useParams();
  const active = conversation?.topic === conversationTopic;
  const room = isRoom(conversation);

  return (
    <div
      className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl transition cursor-pointer active:scale-[0.98] ${
        active
          ? "bg-[#836ef9]/15 ring-1 ring-[#836ef9]/60"
          : "bg-[#0c0c12]/70 hover:bg-[#14141b] ring-1 ring-transparent"
      }`}
      data-testid="conversation-cell"
    >
      {/* avatar */}
      <div className="relative shrink-0">
        <span
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-extrabold font-mono ${
            room
              ? "bg-gradient-to-tr from-[#836ef9]/30 to-[#a99bfc]/15 text-[#a99bfc] border border-[#836ef9]/35"
              : "bg-gradient-to-tr from-[#5ce68a]/25 to-[#836ef9]/15 text-[#5ce68a] border border-[#5ce68a]/30"
          }`}
        >
          {avatarLabel(conversation)}
        </span>
        <span
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#12101f] ${
            room ? "bg-[#836ef9]" : "bg-[#3a3358]"
          }`}
        >
          {room ? (
            <LucideUsersRound size={11} className="text-white" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ce68a]" />
          )}
        </span>
      </div>

      {/* content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`text-sm font-bold truncate ${
              active ? "text-[#f4f1fe]" : "text-[#f4f1fe]/90"
            }`}
          >
            {room
              ? conversation.title || "Chuglife Room"
              : shortAddress(conversation.peerAddress)}
          </span>
          <span
            className={`text-[11px] font-mono tabular-nums shrink-0 ${
              active ? "text-[#a99bfc]" : "text-[#f4f1fe]/45"
            }`}
          >
            <ReactTimeAgo date={conversation.updatedAt} />
          </span>
        </div>
        <p
          className={`text-[13px] leading-snug mt-0.5 truncate ${
            active ? "text-[#f4f1fe]/75" : "text-[#f4f1fe]/55"
          }`}
        >
          {latestMessage ? (
            <MessageContent message={latestMessage} />
          ) : (
            <span className="italic opacity-70">No messages yet</span>
          )}
        </p>
      </div>

      <LucideChevronRight
        size={16}
        className="shrink-0 text-[#f4f1fe]/25 group-hover:text-[#a99bfc] transition-colors"
      />
    </div>
  );
}
