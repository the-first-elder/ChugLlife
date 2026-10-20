import { ReactElement, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import ConversationListView from "./ConversationListView";
import { shortAddress } from "../util/shortAddress";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useClient, useClientStatus } from "../hooks/useClient";
import { clientAddress } from "../model/conversations";
import db from "../model/db";
import { rankProgress } from "../model/rank";
import { SHOP_ITEMS } from "../model/shop";
import RankBadge from "../components/RankBadge";
import RankLadderModal from "../components/RankLadderModal";
import PeerAvatar from "./PeerAvatar";
import { Link, useNavigate } from "react-router-dom";
import ChogBackdrop from "../components/ChogBackdrop";
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
  const { data: balance } = useBalance({ address });
  const { disconnectAsync } = useDisconnect();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showRankModal, setShowRankModal] = useState(false);

  const myAddress = client ? clientAddress(client) : (address ?? "");
  const walletMon = balance
    ? Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : undefined;
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
      navigate("/login");
      return;
    }
    try {
      await disconnectAsync();
    } finally {
      indexedDB.deleteDatabase("DB");
      navigate("/");
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
    <div className="relative z-10 p-4 pt-6 max-w-5xl mx-auto pb-28 text-[#f4f1fe]">
      <ChogBackdrop seed="home" />
      {/* Profile & Rank Strip */}
      <div
        className="mb-6 bg-[#0c0c12] border border-[rgba(244,241,254,0.12)] rounded-3xl shadow-chog-lg p-4 sm:p-5 relative overflow-hidden"
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
            {/* Ladder progress — activity pts only, never MON */}
            {rank && activity && (
              <button
                type="button"
                data-testid="open-rank-ladder"
                onClick={() => setShowRankModal(true)}
                className="group flex items-center gap-3 rounded-2xl border border-[#836ef9]/30 bg-[#14141b]/60 p-2.5 transition hover:border-[#836ef9]/50 hover:bg-[#14141b] text-left"
                title="Click to view rank progression ladder"
              >
                <RankBadge rank={rank} size="sm" showLevel />
                <div className="w-36">
                  <div className="flex items-center justify-between font-mono text-[9px] text-[#f4f1fe]/55 mb-1">
                    <span className="font-bold text-[#f4f1fe]/80">
                      {next ? `${next.emoji} ${next.name}` : "♛ Max Rank"}
                    </span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/40 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        background: `linear-gradient(90deg, ${rank.color}, ${next?.color ?? rank.color})`,
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 font-mono text-[9px] text-right text-[#f4f1fe]/45 tabular-nums">
                    {next
                      ? `${(next.min - (activity.chatPoints + activity.presencePoints)).toLocaleString()} pts to go`
                      : "All 11 tiers unlocked"}
                  </div>
                </div>
              </button>
            )}

            {/* Wallet MON balance — what you can spend in the shop */}
            {address && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f59e0b]/10 px-2.5 py-1.5 font-mono text-[11px] font-bold tabular-nums text-[#f59e0b] border border-[#f59e0b]/30"
                title="Your wallet balance"
                data-testid="mon-balance"
              >
                <LucideCoins size={12} />
                {walletMon ?? "—"} MON
              </span>
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

        {/* Shop inventory — everything you own, front and center */}
        {activity && activity.ownedItems && activity.ownedItems.length > 0 && (
          <div
            className="mt-3 flex items-center gap-2 flex-wrap"
            data-testid="inventory-strip"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#f4f1fe]/40">
              Inventory
            </span>
            {activity.ownedItems.map((id) => {
              const item = SHOP_ITEMS.find((i) => i.id === id);
              if (!item) return null;
              return (
                <span
                  key={id}
                  title={item.name}
                  data-testid={`inventory-${id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/25 px-2 py-0.5 text-[11px] font-bold text-[#f59e0b]"
                >
                  <span>{item.emoji}</span>
                  <span className="text-[#f4f1fe]/80">{item.name}</span>
                </span>
              );
            })}
          </div>
        )}
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
