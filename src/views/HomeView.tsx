import { ReactElement, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import ConversationListView from "./ConversationListView";
import { shortAddress } from "../util/shortAddress";
import { useAccount, useDisconnect } from "wagmi";
import { useClient, useClientStatus } from "../hooks/useClient";
import { clientAddress } from "../model/conversations";
import db from "../model/db";
import { rankProgress } from "../model/rank";
import RankBadge from "../components/RankBadge";
import RankLadderModal from "../components/RankLadderModal";
import PeerAvatar from "./PeerAvatar";
import { Link } from "react-router-dom";
import {
  LucideCoins,
  LucideCopy,
  LucideCheck,
  LucideLogOut,
  LucideClock,
  LucideMessageSquare,
  LucideStore,
  LucideSparkles,
} from "lucide-react";

export default function HomeView(): ReactElement {
  const client = useClient();
  const { stopDemo, isDemo } = useClientStatus();
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);

  const myAddress = client ? clientAddress(client) : (address ?? "");
  const activity = useLiveQuery(
    () => (myAddress ? db.activity.get(myAddress.toLowerCase()) : undefined),
    [myAddress]
  );
  const { rank, pct, next } = activity
    ? rankProgress(activity.chatPoints + activity.presencePoints)
    : { rank: undefined, pct: 0, next: undefined };

  async function logout() {
    if (isDemo) {
      stopDemo();
      return;
    }
    try {
      await disconnectAsync();
    } finally {
      indexedDB.deleteDatabase("DB");
    }
  }

  function copy() {
    if (!myAddress) return;
    navigator.clipboard.writeText(myAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const messagesCount = activity?.messageCount ?? 0;
  const onlineHours = activity ? Math.round((activity.onlineMinutes / 60) * 10) / 10 : 0;

  return (
    <div className="p-4 pt-6 max-w-5xl mx-auto pb-28 text-[#f4f1fe]">
      {/* Profile & Rank Strip */}
      <div
        className="mb-6 bg-[#161228] border border-[rgba(244,241,254,0.12)] rounded-3xl shadow-chog-lg p-4 sm:p-5 relative overflow-hidden"
        data-testid="profile-strip"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <PeerAvatar address={myAddress} size={48} />
              {rank && (
                <span className="absolute -bottom-1 -right-1 text-sm drop-shadow">
                  {rank.emoji}
                </span>
              )}
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-[#f4f1fe]/50 font-mono">
                {isDemo ? "Demo Chog Identity" : "Connected Wallet"}
              </div>
              <div
                className="text-sm font-bold text-[#f4f1fe] font-mono mt-0.5 flex items-center gap-1.5"
                data-testid="my-address"
              >
                {shortAddress(myAddress) || "…"}
                <button
                  data-testid="copy-address"
                  onClick={copy}
                  className="text-[#f4f1fe]/40 hover:text-[#836ef9] transition p-1"
                  title="Copy address"
                >
                  {copied ? <LucideCheck size={14} className="text-[#5ce68a]" /> : <LucideCopy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Activity Metrics & Rank Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            {rank && activity && (
              <button
                type="button"
                onClick={() => setShowRankModal(true)}
                className="flex items-center gap-3 bg-[#1e183a]/80 hover:bg-[#1e183a] border border-[#836ef9]/30 p-2.5 rounded-2xl transition group text-left"
                title="Click to view rank progression ladder"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <RankBadge rank={rank} size="sm" showLevel />
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30"
                      title="MON earned by chatting & staying online"
                      data-testid="mon-balance"
                    >
                      <LucideCoins size={12} />
                      {activity.points} MON
                    </span>
                  </div>
                  <div className="mt-1.5 w-32">
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ background: rank.color, width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-[#f4f1fe]/50 text-right mt-0.5 font-mono">
                      {next ? `${next.min - (activity.chatPoints + activity.presencePoints)} MON to ${next.emoji}` : "Max Rank ♛"}
                    </div>
                  </div>
                </div>
              </button>
            )}

            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#836ef9]/15 hover:bg-[#836ef9]/25 text-[#836ef9] border border-[#836ef9]/30 font-bold text-xs transition"
            >
              <LucideStore size={14} /> Shop
            </Link>

            <button
              data-testid="logout"
              onClick={logout}
              className="p-2 rounded-2xl bg-white/5 hover:bg-red-500/15 text-[#f4f1fe]/50 hover:text-red-400 border border-white/5 transition"
              title={isDemo ? "Exit demo" : "Sign out"}
            >
              <LucideLogOut size={16} />
            </button>
          </div>
        </div>

        {/* Quick Activity Stats Bar */}
        <div className="mt-4 pt-3 border-t border-[rgba(244,241,254,0.06)] flex items-center justify-between flex-wrap gap-2 text-xs font-mono text-[#f4f1fe]/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <LucideMessageSquare size={13} className="text-[#836ef9]" />
              <strong className="text-[#f4f1fe]">{messagesCount}</strong> messages sent
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <LucideClock size={13} className="text-[#5ce68a]" />
              <strong className="text-[#f4f1fe]">{onlineHours}h</strong> active online
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowRankModal(true)}
            className="text-[11px] text-[#836ef9] hover:underline flex items-center gap-1"
          >
            <LucideSparkles size={12} /> View Rank Ladder →
          </button>
        </div>
      </div>

      <ConversationListView />

      <RankLadderModal
        activity={activity}
        isOpen={showRankModal}
        onClose={() => setShowRankModal(false)}
      />
    </div>
  );
}
