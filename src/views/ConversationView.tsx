import { Fragment, ReactElement, useEffect, useState } from "react";
import { Conversation, Message } from "../model/db";
import { useMessages } from "../hooks/useMessages";
import MessageComposerView from "./MessageComposerView";
import MessageCellView from "./MessageCellView";
import { Link } from "react-router-dom";
import { LucideArrowLeft, LucideInfo, LucideMessageSquarePlus } from "lucide-react";
import ConversationSettingsView from "./ConversationSettingsView";
import ConversationListView from "./ConversationListView";
import PeerAvatar from "./PeerAvatar";
import { CHOG_NFT_ADDRESS } from "../util/monad";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../model/db";

const appearsInMessageList = (message: Message): boolean => {
  const type = (message.contentType as { typeId?: string }).typeId;
  return type !== "reaction" && type !== "unknown";
};

const dayKey = (date: Date): string => new Date(date).toDateString();

function formatDayLabel(date: Date): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Today";
  if (dayKey(d) === dayKey(yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() === today.getFullYear() ? {} : { year: "numeric" }),
  });
}

export default function ConversationView({
  conversation,
}: {
  conversation: Conversation;
}): ReactElement {
  const messages = useMessages(conversation);
  const [isShowingSettings, setIsShowingSettings] = useState(false);
  const isRoom = conversation.peerAddress === "";
  const room = useLiveQuery(
    () => db.rooms.get(conversation.topic),
    [conversation.topic]
  );

  useEffect(() => {
    window.scrollTo({ top: 100000, behavior: "smooth" });
  }, [messages?.length]);

  return (
    <section className="flex flex-row bg-[#0e0b1a] text-[#f4f1fe] min-h-[calc(100vh-65px)]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-full max-w-xs p-4 space-y-3 bg-[#141026] border-r border-[rgba(244,241,254,0.08)]">
        <div className="flex items-center justify-between gap-2 py-1">
          <span className="cl-section-title">Chogmates</span>
          <Link
            to="/match"
            className="cl-btn cl-btn-primary cl-btn-sm"
          >
            <LucideMessageSquarePlus size={13} /> Match
          </Link>
        </div>
        <ConversationListView />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col w-full h-[calc(100vh-65px)] bg-[#0e0b1a]">
        <header className="sticky top-0 z-40 px-4 py-3 bg-[#141026]/90 backdrop-blur-xl border-b border-[rgba(244,241,254,0.08)]">
          <div className="flex justify-between items-center gap-2 font-bold">
            <Link
              to="/conversations"
              className="cl-btn cl-btn-ghost p-2 mr-2 md:hidden shrink-0 text-[#f4f1fe]/70 hover:text-[#f4f1fe]"
            >
              <LucideArrowLeft size={18} />
            </Link>

            <div className="flex-grow flex items-center gap-x-3 overflow-hidden">
              {isRoom ? (
                <div className="w-10 h-10 rounded-2xl bg-[#836ef9]/20 border border-[#836ef9]/40 flex items-center justify-center text-xl shrink-0">
                  {room?.emoji || "🐸"}
                </div>
              ) : (
                <PeerAvatar address={conversation.peerAddress} size={40} />
              )}

              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-sm font-bold text-[#f4f1fe] truncate">
                  {isRoom
                    ? room?.name || conversation.title || "Chuglife Room"
                    : conversation.peerAddress
                    ? `${conversation.peerAddress.slice(0, 6)}…${conversation.peerAddress.slice(-4)}`
                    : "Chogmate"}
                </span>

                <span className="text-[10px] text-[#f4f1fe]/55 font-normal flex items-center gap-1.5 flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ce68a] inline-block shadow-[0_0_6px_#5ce68a]" />
                  {isRoom ? (
                    <span className="text-[#5ce68a] font-mono font-bold">
                      room · 👮 chog police active
                    </span>
                  ) : (
                    <span>secure XMTP chat</span>
                  )}

                  {isRoom && (
                    <Link
                      to={`/room/${conversation.topic}/settings`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#a99bfc] hover:text-[#f4f1fe] bg-[#836ef9]/10 px-2 py-0.5 rounded-lg border border-[#836ef9]/30 transition-colors"
                      data-testid="room-dashboard"
                    >
                      Room Dashboard ⚙️
                    </Link>
                  )}

                  {!isRoom && conversation.peerAddress && (
                    <a
                      href={`https://monadscan.com/nft/${CHOG_NFT_ADDRESS}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hidden sm:inline text-[#836ef9] hover:text-[#a99bfc] ml-1 transition-colors"
                    >
                      view on MonadScan
                    </a>
                  )}
                </span>
              </div>
            </div>

            <button
              data-testid="conversation-info"
              className="cl-btn cl-btn-ghost p-2 shrink-0 text-[#f4f1fe]/60 hover:text-[#f4f1fe]"
              onClick={() => setIsShowingSettings(!isShowingSettings)}
              title="Conversation Settings"
            >
              <LucideInfo size={18} />
            </button>
          </div>

          {isShowingSettings && (
            <ConversationSettingsView
              conversation={conversation}
              dismiss={() => setIsShowingSettings(false)}
            />
          )}
        </header>

        <div
          className="cl-stagger flex-1 grow shrink-0 flex flex-col space-y-2.5 px-4 py-4 overflow-y-auto"
          data-testid="message-list"
        >
          {messages?.length === 0 && (
            <div className="cl-empty cl-fade-in my-auto w-full max-w-sm self-center flex flex-col items-center">
              <span className="text-4xl block mb-3">🐸</span>
              <p className="text-base font-bold text-[#f4f1fe]">
                {isRoom ? "Welcome to the room!" : "Your chogmate conversation"}
              </p>
              <p className="text-xs text-[#f4f1fe]/55 mt-1 max-w-xs">
                {isRoom
                  ? "Say gm! Chatting in here pushes you up the rank ladder."
                  : "Say gm to start vibing. Messages are encrypted end-to-end."}
              </p>
            </div>
          )}
          {messages
            ? messages.filter(appearsInMessageList).map((message, index, list) => {
                const prev = list[index - 1];
                const newDay = !prev || dayKey(prev.sentAt) !== dayKey(message.sentAt);
                return (
                  <Fragment key={message.id}>
                    {newDay && (
                      <span className="cl-chip self-center my-1">
                        {formatDayLabel(message.sentAt)}
                      </span>
                    )}
                    <MessageCellView message={message} />
                  </Fragment>
                );
              })
            : (
              <span className="text-[#f4f1fe]/55 text-sm text-center py-6">Could not load messages</span>
            )}
        </div>

        <div className="grow-0">
          <MessageComposerView conversation={conversation} />
        </div>
      </div>
    </section>
  );
}
