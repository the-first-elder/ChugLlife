import { ReactElement, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useClient } from "../../hooks/useClient";
import db from "../../model/db";
import { clientAddress } from "../../model/conversations";
import { rankProgress } from "../../model/rank";
import RankBadge from "../../components/RankBadge";
import RankLadderModal from "../../components/RankLadderModal";
import { SHOP_ITEMS, ShopItem, applyPurchase } from "../../model/shop";
import {
  LucideRocket,
  LucideSparkles,
  LucideWallet,
  LucideCoins,
  LucideFlame,
  LucideClock,
  LucideShieldCheck,
  LucideCheck,
} from "lucide-react";

export default function ShopView(): ReactElement {
  const client = useClient();
  const address = client ? clientAddress(client) : "";
  const [filter, setFilter] = useState<"all" | "capacity" | "powerup" | "cosmetic">("all");
  const [showRankModal, setShowRankModal] = useState(false);
  const [justBought, setJustBought] = useState<string | null>(null);

  const activity = useLiveQuery(
    () => (address ? db.activity.get(address) : undefined),
    [address]
  );
  const ownedRooms = useLiveQuery(
    () =>
      address
        ? db.rooms.where("owner").equals(address).filter((r) => !r.archived).count()
        : Promise.resolve(0),
    [address]
  );
  const { rank, pct, next } = activity
    ? rankProgress(activity.chatPoints + activity.presencePoints)
    : { rank: undefined, pct: 0, next: undefined };

  const isTurboActive = activity?.turboUntil && activity.turboUntil > Date.now();

  async function buy(item: ShopItem) {
    if (!client || !activity) return;
    try {
      await applyPurchase(activity, item);
      setJustBought(item.name);
      setTimeout(() => setJustBought(null), 3000);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  const items = SHOP_ITEMS.filter((i) => filter === "all" || i.kind === filter);

  return (
    <div className="text-[#f4f1fe] max-w-5xl mx-auto p-4 pt-8 pb-28 min-h-[75vh]">
      {/* Top Banner */}
      <div className="bg-[#161228] border border-[rgba(244,241,254,0.12)] rounded-3xl p-6 sm:p-8 shadow-chog-lg relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#f59e0b]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] flex items-center justify-center shadow-sm">
                <LucideCoins size={22} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chuglife Shop
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#f4f1fe]/60 mt-2 max-w-xl leading-relaxed">
              Spend MON earned by chatting (+5 MON/msg) and staying active (+1 MON/min online). Upgrade room capacity, boost earnings, and unlock cosmetic flair.
            </p>
          </div>

          <div className="bg-[#141026] border border-[#f59e0b]/30 rounded-3xl px-6 py-4 shadow-chog text-right">
            <div className="font-mono font-extrabold text-2xl text-[#f59e0b] flex items-center gap-2 justify-end">
              <LucideCoins size={20} />
              {activity?.points ?? 0} MON
            </div>
            <div className="text-[11px] text-[#f4f1fe]/50 font-mono mt-0.5">
              your available balance
            </div>
            {isTurboActive && (
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] text-[10px] font-bold border border-[#f59e0b]/40 animate-pulse">
                🚀 2x Turbo Active
              </div>
            )}
          </div>
        </div>

        {/* Earning guide ticker */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3 text-xs font-mono text-[#f4f1fe]/70">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/5">
              <LucideFlame size={14} className="text-[#f59e0b]" /> <strong>+5 MON</strong> per message
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/5">
              <LucideClock size={14} className="text-[#5ce68a]" /> <strong>+1 MON</strong> per min online
            </span>
          </div>

          <span className="text-[11px] text-[#5ce68a] flex items-center gap-1">
            <LucideShieldCheck size={13} /> 100% Free · No Gas · Earn by Vibe
          </span>
        </div>
      </div>

      {justBought && (
        <div className="my-4 p-3.5 rounded-2xl bg-[#5ce68a]/15 border border-[#5ce68a]/40 text-[#5ce68a] text-sm flex items-center gap-2 animate-in fade-in">
          <LucideCheck size={18} />
          <span>Unlocked <strong>{justBought}</strong>! Enjoy the vibes.</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="mt-8 flex gap-2 flex-wrap font-mono text-xs">
        {[
          { id: "all", label: "All Items" },
          { id: "capacity", label: "🏘️ Room Capacity" },
          { id: "powerup", label: "⚡ Power-Ups" },
          { id: "cosmetic", label: "✨ Cosmetics" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id as never)}
            className={`px-3.5 py-1.5 rounded-2xl transition font-bold ${
              filter === c.id
                ? "bg-[#836ef9] text-white shadow-chog-sm"
                : "bg-[#161228] border border-white/5 text-[#f4f1fe]/60 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const affordable = (activity?.points ?? 0) >= item.price;
          const isOwned =
            (item.id === "rooms-5" && (activity?.roomSlots ?? 1) >= 5) ||
            (item.id === "rooms-8" && (activity?.roomSlots ?? 1) >= 8);

          return (
            <div
              key={item.id}
              data-testid={`shop-${item.id}`}
              className="bg-[#161228] hover:bg-[#1a1433] border border-[rgba(244,241,254,0.1)] rounded-3xl p-5 flex flex-col justify-between shadow-sm transition duration-200"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-[#141026] border border-white/5" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="font-mono font-extrabold text-sm text-[#f59e0b] bg-[#f59e0b]/15 px-2.5 py-1 rounded-xl border border-[#f59e0b]/30">
                    {item.price.toLocaleString()} MON
                  </span>
                </div>
                <h2 className="font-extrabold text-base text-[#f4f1fe] mt-3">{item.name}</h2>
                <p className="text-xs text-[#f4f1fe]/60 mt-1.5 leading-relaxed">{item.blurb}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5">
                {isOwned ? (
                  <div className="text-center text-xs font-bold text-[#5ce68a] py-2 bg-[#5ce68a]/10 rounded-2xl border border-[#5ce68a]/20">
                    ✓ Already Unlocked
                  </div>
                ) : (
                  <button
                    type="button"
                    data-testid={`buy-${item.id}`}
                    disabled={!affordable}
                    onClick={() => void buy(item)}
                    className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      affordable
                        ? "bg-[#836ef9] hover:bg-[#9d8dfc] text-white shadow-chog-sm cursor-pointer"
                        : "bg-white/5 text-[#f4f1fe]/30 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    <LucideSparkles size={14} />
                    {affordable ? "Buy Item" : `Need ${item.price.toLocaleString()} MON`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Capacity Status */}
      <div className="mt-8 bg-[#161228] border border-[rgba(244,241,254,0.1)] rounded-3xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#836ef9]/20 text-[#836ef9] flex items-center justify-center text-xl shrink-0">
            <LucideWallet size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-[#f4f1fe]">
              Room Capacity: {ownedRooms ?? 0} / {activity?.roomSlots ?? 1} created
            </div>
            <div className="text-xs text-[#f4f1fe]/50 mt-0.5">
              Every chog holder gets 1 room free. Buy 5-room or 8-room packs above to expand your chat territory.
            </div>
          </div>
        </div>

        <a
          href="/rooms/new"
          className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold font-mono border border-white/10 transition"
        >
          Create Room →
        </a>
      </div>

      {/* User Rank Progress */}
      <div className="mt-4 bg-[#161228] border border-[rgba(244,241,254,0.1)] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <LucideRocket size={18} className="text-[#836ef9]" />
            Your Activity Rank
          </div>
          <button
            type="button"
            onClick={() => setShowRankModal(true)}
            className="text-xs text-[#836ef9] font-mono hover:underline"
          >
            View Full 11-Rank Ladder →
          </button>
        </div>

        {rank && activity ? (
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <RankBadge rank={rank} size="md" showLevel />
            <div className="grow w-full">
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    background: rank.color,
                    width: `${pct}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#f4f1fe]/50 mt-1 font-mono">
                <span>{pct}% to next level ({next?.name ?? "Max"})</span>
                <span>{activity.messageCount} messages · {Math.round((activity.onlineMinutes / 60) * 10) / 10}h online</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#f4f1fe]/50">Sign in to start earning MON and climbing the ladder.</div>
        )}
      </div>

      <RankLadderModal
        activity={activity}
        isOpen={showRankModal}
        onClose={() => setShowRankModal(false)}
      />
    </div>
  );
}
