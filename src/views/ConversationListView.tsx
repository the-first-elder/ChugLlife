import { ReactElement } from "react";
import { useConversations } from "../hooks/useMessagePipeline";
import { useClient, useClientStatus } from "../hooks/useClient";
import { Link, useNavigate } from "react-router-dom";
import { useLatestMessages } from "../hooks/useLatestMessages";
import ConversationCellView from "./ConversationCellView";
import { LucideFlame, LucideUsers, LucideMessageSquarePlus, LucideLogOut } from "lucide-react";

export default function ConversationListView(): ReactElement {
  const client = useClient();
  const { isDemo, stopDemo } = useClientStatus();
  const toLogin = useNavigate();
  const conversations = useConversations(client);
  const latestMessages = useLatestMessages(conversations);

  return (
    <div className="overflow-y-auto pr-0.5">
      <div className="flex items-center justify-between gap-3 my-3">
        <h2 className="cl-section-title">
          Chats ({conversations.length})
        </h2>
        <div className="flex items-center gap-2">
          {isDemo && (
            <button
              data-testid="stop-demo"
              onClick={() => {
                stopDemo();
                toLogin("/login");
              }}
              className="cl-btn cl-btn-ghost cl-btn-sm px-2.5 text-[#f4f1fe]/60 hover:text-[#f4f1fe]"
            >
              <LucideLogOut size={13} />
            </button>
          )}
          <Link
            data-testid="new-conversation"
            to="/match"
            className="cl-btn cl-btn-primary cl-btn-sm"
          >
            <LucideMessageSquarePlus size={14} /> New chat
          </Link>
        </div>
      </div>

      {conversations.length === 0 && (
        <div className="cl-empty cl-fade-in my-4 relative overflow-hidden">
          <span className="absolute -top-10 -right-10 w-32 h-32 bg-[#836ef9]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="cl-float text-4xl mb-2">🐸</div>
          <p className="font-extrabold text-base text-[#f4f1fe]">
            No chogmates yet
          </p>
          <p className="text-xs text-[#f4f1fe]/55 mt-1 max-w-sm mx-auto leading-relaxed">
            Find matching Chog Genesis holders by trait, or jump into public
            chat rooms and climb the activity ranks!
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/match"
              className="cl-btn cl-btn-primary cl-btn-sm cl-pulse-ring"
            >
              <LucideFlame size={14} /> Vibe Match
            </Link>
            <Link
              to="/rooms"
              className="cl-btn cl-btn-ghost cl-btn-sm"
            >
              <LucideUsers size={14} /> Public Rooms
            </Link>
          </div>
          <p className="mt-4 text-[10px] font-mono text-[#f4f1fe]/35">
            chats sync over XMTP · end-to-end encrypted
          </p>
        </div>
      )}

      <div className="cl-stagger space-y-2 pb-4">
        {conversations.map((conversation, i) => (
          <Link to={`/c/${conversation.topic}`} key={conversation.topic} className="block">
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
