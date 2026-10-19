import { ReactElement, useEffect, useState } from "react";
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
      <div className="hidden md:block w-full max-w-xs p-3 space-y-3 bg-[#141026] border-r border-[rgba(244,241,254,0.08)]">
        <div className="font-extrabold text-base py-1 text-[#f4f1fe] flex items-center justify-between">
          <span>Chogmates</span>
          <Link
            to="/match"
            className="inline-flex items-center gap-1 text-xs bg-[#836ef9] text-white px-2.5 py-1 rounded-xl hover:bg-[#9d8dfc] transition font-bold shadow-sm"
          >
            <LucideMessageSquarePlus size={13} /> Match
          </Link>
        </div>
        <ConversationListView />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col w-full h-[calc(100vh-65px)] bg-[#0e0b1a]">
        <header className="sticky top-0 z-40 px-4 py-3 bg-[#141026]/90 backdrop-blur-xl border-b border-[rgba(244,241,254,0.08)]">
          <div className="flex justify-between items-center font-bold">
            <Link to="/conversations" className="mr-3 md:hidden p-1.5 rounded-xl hover:bg-white/5 text-[#f4f1fe]/70 hover:text-white">
              <LucideArrowLeft size={18} />
            </Link>

            <div className="flex-grow flex items-center gap-x-3 overflow-hidden">
              {isRoom ? (
                <div className="w-10 h-10 rounded-2xl bg-[#836ef9]/20 border border-[#836ef9]/40 flex items-center justify-center text-xl shadow-sm shrink-0">
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

                <span className="text-[10px] text-[#f4f1fe]/50 font-normal flex items-center gap-1.5 flex-wrap">
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
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#836ef9] hover:underline bg-[#836ef9]/10 px-2 py-0.5 rounded-md border border-[#836ef9]/30"
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
                      className="underline hidden sm:inline text-[#836ef9] ml-1"
                    >
                      view on MonadScan
                    </a>
                  )}
                </span>
              </div>
            </div>

            <button
              data-testid="conversation-info"
              className="p-2 rounded-xl text-[#f4f1fe]/60 hover:text-white hover:bg-white/5 transition"
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

        <div className="flex-1 grow shrink-0 flex flex-col space-y-2.5 px-4 py-3 overflow-y-auto" data-testid="message-list">
          {messages?.length === 0 && (
            <div className="h-[calc(100vh-260px)] w-full flex flex-col justify-center items-center overflow-hidden text-center">
              <span className="text-5xl block mb-3 animate-bounce">🐸</span>
              <p className="text-base font-bold text-[#f4f1fe]">
                {isRoom ? "Welcome to the room!" : "Your chogmate conversation"}
              </p>
              <p className="text-xs text-[#f4f1fe]/50 mt-1 max-w-xs">
                {isRoom
                  ? "Say gm! Every message earns +5 MON toward your activity rank."
                  : "Say gm to start vibing. Messages are encrypted end-to-end."}
              </p>
            </div>
          )}
          {messages
            ? messages.filter(appearsInMessageList).map((message) => (
                <MessageCellView key={message.id} message={message} />
              ))
            : (
              <span className="text-[#f4f1fe]/50 text-center py-6">Could not load messages</span>
            )}
        </div>

        <div className="grow-0">
          <MessageComposerView conversation={conversation} />
        </div>
      </div>
    </section>
  );
}
