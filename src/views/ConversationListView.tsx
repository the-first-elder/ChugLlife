import { ReactElement } from "react";
import { useConversations } from "../hooks/useMessagePipeline";
import { useClient, useClientStatus } from "../hooks/useClient";
import { Link } from "react-router-dom";
import { useLatestMessages } from "../hooks/useLatestMessages";
import ConversationCellView from "./ConversationCellView";
import { LucideMessageCirclePlus, LucideFlame, LucideUsers } from "lucide-react";

export default function ConversationListView(): ReactElement {
  const client = useClient();
  const { isDemo, stopDemo } = useClientStatus();
  const conversations = useConversations(client);
  const latestMessages = useLatestMessages(conversations);

  return (
    <div className="h-[calc(100vh-230px)] overflow-y-auto pr-1">
      <div className="flex items-center justify-between my-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#f4f1fe]/60 font-mono">
          Your Conversations ({conversations.length})
        </h2>
        <div className="flex items-center gap-2">
          {isDemo && (
            <button
              data-testid="stop-demo"
              onClick={stopDemo}
              className="bg-white/5 hover:bg-white/10 text-[#f4f1fe]/60 hover:text-white px-2.5 py-1 text-xs rounded-xl font-bold transition border border-white/5"
            >
              Exit demo
            </button>
          )}
          <Link
            data-testid="new-conversation"
            to="/match"
            className="inline-flex items-center gap-1.5 bg-[#836ef9] hover:bg-[#9d8dfc] text-white px-3 py-1.5 text-xs rounded-xl font-bold shadow-chog-sm transition"
          >
            <LucideMessageCirclePlus size={14} /> New chat
          </Link>
        </div>
      </div>

      {conversations.length === 0 && (
        <div className="bg-[#161228] border border-[rgba(244,241,254,0.08)] rounded-3xl p-8 text-center my-4">
          <span className="text-4xl block mb-2">🐸</span>
          <p className="font-bold text-base text-[#f4f1fe]">No chogmates yet</p>
          <p className="text-xs text-[#f4f1fe]/50 mt-1 max-w-sm mx-auto">
            Find matching Chog Genesis holders by trait, or jump into public chat rooms to start earning MON activity points!
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              to="/match"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#836ef9] text-white font-bold text-xs shadow-chog-sm hover:bg-[#9d8dfc] transition"
            >
              <LucideFlame size={14} /> Vibe Match
            </Link>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1e183a] text-[#f4f1fe] border border-white/10 font-bold text-xs hover:bg-[#251f47] transition"
            >
              <LucideUsers size={14} /> Public Rooms
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {conversations.map((conversation, i) => (
          <Link
            to={`/c/${conversation.topic}`}
            key={conversation.topic}
            className="block"
          >
            <ConversationCellView
              conversation={conversation}
              latestMessage={latestMessages[i]}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
