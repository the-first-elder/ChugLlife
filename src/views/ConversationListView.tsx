import { ReactElement, useMemo, useState } from "react";
import { useConversations } from "../hooks/useMessagePipeline";
import { useClient, useClientStatus } from "../hooks/useClient";
import { Link, useNavigate } from "react-router-dom";
import { useLatestMessages } from "../hooks/useLatestMessages";
import ConversationCellView from "./ConversationCellView";
import {
  LucideFlame,
  LucideUsers,
  LucideMessageSquare,
  LucideMessageSquarePlus,
  LucideLogOut,
  LucideSearch,
  LucideX,
  LucideChevronsDown,
} from "lucide-react";
import type { Conversation, Message } from "../model/db";

/** Chats rendered at once before the "Show more" affordance. */
const PAGE_SIZE = 25;

type Bucket = "all" | "rooms" | "dms";

const BUCKETS: { id: Bucket; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rooms", label: "Rooms" },
  { id: "dms", label: "DMs" },
];

function isRoomConversation(
  conversation: Conversation | undefined
): boolean {
  return conversation ? conversation.peerAddress === "" : false;
}

function searchableText(conversation: Conversation, latest?: Message): string {
  const content = typeof latest?.content === "string" ? latest.content : "";
  return `${conversation.title ?? ""} ${conversation.peerAddress} ${content}`
    .toLowerCase();
}

export default function ConversationListView(): ReactElement {
  const client = useClient();
  const { isDemo, stopDemo } = useClientStatus();
  const toLogin = useNavigate();
  const conversations = useConversations(client);
  const latestMessages = useLatestMessages(conversations);

  const [bucket, setBucket] = useState<Bucket>("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /** topic -> latest message, so filtered rows can still find their preview */
  const latestByTopic = useMemo(() => {
    const map = new Map<string, Message>();
    conversations.forEach((conversation, i) => {
      const latest = latestMessages[i];
      if (latest) map.set(conversation.topic, latest);
    });
    return map;
  }, [conversations, latestMessages]);

  const counts = useMemo(
    () => ({
      all: conversations.length,
      rooms: conversations.filter(isRoomConversation).length,
      dms: conversations.filter((c) => !isRoomConversation(c)).length,
    }),
    [conversations]
  );

  const matched = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (bucket === "rooms" && !isRoomConversation(conversation)) return false;
      if (bucket === "dms" && isRoomConversation(conversation)) return false;
      if (!q) return true;
      return searchableText(conversation, latestByTopic.get(conversation.topic))
        .includes(q);
    });
  }, [conversations, bucket, search, latestByTopic]);

  /** Reset paging whenever the user changes scope. */
  const effectiveVisible = visibleCount;

  return (
    <div className="flex flex-col min-h-0 pr-0.5">
      {/* Sticky scope + search toolbar — scales to hundreds of chats */}
      <div className="flex items-center justify-between gap-2 my-3">
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

      {conversations.length > 0 && (
        <div className="sticky top-14 z-20 -mx-1 px-1 pb-2 pt-1 bg-[#100e1a]/90 backdrop-blur-xl">
          {/* Segmented buckets */}
          <div className="flex gap-1.5 mb-2">
            {BUCKETS.map((b) => {
              const active = bucket === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setBucket(b.id);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                    active
                      ? "bg-[#836ef9]/20 text-[#a99bfc] border-[#836ef9]/50"
                      : "bg-white/[0.04] text-[#f4f1fe]/50 border-white/10 hover:text-[#f4f1fe]/80"
                  }`}
                >
                  {b.id === "dms" ? (
                    <LucideMessageSquare size={12} />
                  ) : (
                    <LucideUsers size={12} />
                  )}
                  {b.label}{" "}
                  <span className="font-mono tabular-nums opacity-70">
                    {counts[b.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <LucideSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f4f1fe]/40 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder={
                conversations.length > PAGE_SIZE
                  ? `Filter ${conversations.length} chats…`
                  : "Filter chats by name or text…"
              }
              className="cl-input w-full pl-9 pr-8 py-2 text-xs"
              aria-label="Filter chats"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setVisibleCount(PAGE_SIZE);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#f4f1fe]/40 hover:text-[#f4f1fe]"
                title="Clear filter"
              >
                <LucideX size={13} />
              </button>
            )}
          </div>
        </div>
      )}

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

      {matched.length === 0 && conversations.length > 0 && (
        <div className="cl-empty cl-fade-in my-4">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="font-bold text-sm text-[#f4f1fe]">No chats match</p>
          <p className="text-xs text-[#f4f1fe]/55 mt-1">
            Try a different search or scope.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 pb-2">
        {matched.slice(0, effectiveVisible).map((conversation) => (
          <Link
            to={`/c/${conversation.topic}`}
            key={conversation.topic}
            className="block"
          >
            <ConversationCellView
              conversation={conversation}
              latestMessage={latestByTopic.get(conversation.topic)}
            />
          </Link>
        ))}
      </div>

      {matched.length > effectiveVisible && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          data-testid="chats-show-more"
          className="cl-btn cl-btn-ghost cl-btn-sm mt-1 mb-4 self-center"
        >
          <LucideChevronsDown size={14} />
          Show more ({matched.length - effectiveVisible} hidden)
        </button>
      )}
      {matched.length > PAGE_SIZE &&
        matched.length <= effectiveVisible && (
          <p className="text-center font-mono text-[10px] text-[#f4f1fe]/30 pb-4">
            all {matched.length} chats shown
          </p>
        )}
    </div>
  );
}
