import { ReactElement } from "react";
import { Conversation, Message } from "../model/db";
import { shortAddress } from "../util/shortAddress";
import ReactTimeAgo from "react-time-ago";
import { MessageContent } from "./MessageCellView";
import { useParams } from "react-router-dom";

export default function ConversationCellView({
  conversation,
  latestMessage,
}: {
  conversation: Conversation;
  latestMessage: Message | undefined;
}): ReactElement {
  const { conversationTopic } = useParams();
  const active = conversation?.topic === conversationTopic;
  const isRoom = conversation.peerAddress === "";

  return (
    <div
      className={`${
        active
          ? "bg-[#836ef9] text-white shadow-chog ring-1 ring-[#836ef9]"
          : "bg-[#161228] hover:bg-[#1e183a] border border-[rgba(244,241,254,0.08)] text-[#f4f1fe]"
      } p-3 rounded-2xl transition duration-200 cursor-pointer`}
      data-testid="conversation-cell"
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
              isRoom
                ? "bg-[#836ef9]/20 text-[#836ef9]"
                : "bg-[#5ce68a]/20 text-[#5ce68a]"
            }`}
          >
            {isRoom ? "🐸" : "💬"}
          </span>
          <div className="overflow-hidden">
            <span className="text-xs font-bold truncate block tracking-tight">
              {isRoom
                ? conversation.title || "Chuglife Room"
                : shortAddress(conversation.peerAddress)}
            </span>
          </div>
        </div>

        <div
          className={`${
            active ? "text-white/80" : "text-[#f4f1fe]/40"
          } text-[9px] font-mono shrink-0`}
        >
          <ReactTimeAgo date={conversation.updatedAt} />
        </div>
      </div>

      <div
        className={`${
          active ? "text-white/90" : "text-[#f4f1fe]/60"
        } block text-xs text-ellipsis overflow-hidden whitespace-nowrap mt-2 pl-10.5`}
      >
        {latestMessage ? (
          <MessageContent message={latestMessage} />
        ) : (
          <span className="italic text-[11px] opacity-60">No messages yet</span>
        )}
      </div>
    </div>
  );
}
