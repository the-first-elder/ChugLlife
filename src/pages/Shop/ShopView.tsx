import { ReactElement, useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useClient } from "../../hooks/useClient";
import { useClientStatus } from "../../hooks/useClient";
import db from "../../model/db";
import { clientAddress } from "../../model/conversations";
import { getActivity } from "../../model/activity";
import { rankProgress } from "../../model/rank";
import RankBadge from "../../components/RankBadge";
import RankLadderModal from "../../components/RankLadderModal";
import { SHOP_ITEMS, ShopItem, ShopItemId, applyPurchase, buyWithPoints } from "../../model/shop";
import { monad, monadPublicClient, shopTreasury } from "../../util/monad";
import { useAccount, useBalance, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import { sfx } from "../../util/sfx";
import ChogBackdrop from "../../components/ChogBackdrop";
import {
  LucideRocket,
  LucideSparkles,
  LucideWallet,
  LucideCoins,
  LucideFlame,
  LucideClock,
  LucideShieldCheck,
  LucideCheck,
  LucideTrendingUp,
} from "lucide-react";

function useTurboCountdown(activeUntil?: number): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!activeUntil || activeUntil <= now) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activeUntil, now]);
  if (!activeUntil || activeUntil <= now) return "";
  const ms = activeUntil - now;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function checkoutError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/user rejected|rejected the request|user denied/i.test(msg)) {
    return "Payment cancelled — no MON left your wallet.";
  }
  if (/insufficient funds|exceeds balance|balance too low/i.test(msg)) {
    return "Not enough MON in your wallet to cover this item plus gas.";
  }
  if (/chain|mismatch/i.test(msg)) {
    return "Checkout runs on Monad — switch your wallet to Monad and try again.";
  }
  if (/memory access out of bounds|RuntimeError|unreachable/i.test(msg)) {
    return "Chuglife jammed for a second. Reload the page and try again.";
  }
  return msg.slice(0, 220);
}

export default function ShopView(): ReactElement {
  const client = useClient();
  const { isDemo } = useClientStatus();
  const address = client ? clientAddress(client) : "";
  const [filter, setFilter] = useState<"all" | "capacity" | "powerup" | "cosmetic">("all");
  const [showRankModal, setShowRankModal] = useState(false);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [pendingItem, setPendingItem] = useState<ShopItemId | null>(null);
  const [checkoutMsg, setCheckoutMsg] = useState<string | undefined>();

  const treasury = shopTreasury();
  const { address: walletAddress, chainId } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({ address: walletAddress });
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync, isPending } = useSendTransaction();

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
  const turboLeft = useTurboCountdown(isTurboActive ? activity?.turboUntil : undefined);

  const hasWallet = !!walletAddress && !isDemo;
  const busy = pendingItem !== null || isPending;
  const walletMon = balance
    ? Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : undefined;

  async function buy(item: ShopItem, mode: "mon" | "points") {
    if (busy) return;
    setPendingItem(item.id);
    setCheckoutMsg(undefined);
    try {
      if (mode === "mon") {
        const value = parseEther(item.price);
        if (!walletAddress || !treasury) {
          throw new Error("MON checkout needs a wallet + treasury config.");
        }
        if (balance && balance.value < value) {
          throw new Error(`Not enough MON — this item costs ${item.price} MON.`);
        }
        if (chainId !== monad.id) {
          await switchChainAsync({ chainId: monad.id });
        }
        const hash = await sendTransactionAsync({ to: treasury, value });
        setCheckoutMsg(`Confirming on Monad…`);
        await monadPublicClient.waitForTransactionReceipt({ hash });
        const row = await getActivity(address || walletAddress);
        await applyPurchase(row, item);
        void refetchBalance();
      } else {
        // Point checkout — works for demo identities & broke chogs
        await buyWithPoints(address, item);
      }
      sfx.success();
      setJustBought(item.name);
      setCheckoutMsg(undefined);
      setTimeout(() => setJustBought(null), 5000);
    } catch (e) {
      sfx.error();
      setCheckoutMsg(checkoutError(e));
    } finally {
      setPendingItem(null);
    }
  }

  const items = SHOP_ITEMS.filter((i) => filter === "all" || i.kind === filter);

  return (
    <div className="relative z-10 text-[#f4f1fe] max-w-5xl mx-auto p-4 pt-8 pb-28 min-h-[75vh]">
      <ChogBackdrop seed="shop" />
      {/* Top Banner */}
      <div className="cl-card cl-card-glow cl-fade-in p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#f59e0b]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] flex items-center justify-center shadow-sm">
                <LucideCoins size={22} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chuglife Shop
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#f4f1fe]/55 mt-3 max-w-xl leading-relaxed">
              Room slots, power-ups and cosmetic flair — paid straight from your
              wallet in MON. Items unlock the moment your transfer lands.
            </p>
          </div>

          {/* Wallet balance — what you can actually spend */}
          <div className="cl-card-flat px-6 py-4 text-right min-w-[200px]">
            <div className="cl-section-title">Your wallet</div>
            <div className="mt-2 flex items-center justify-end gap-2 text-[#f59e0b]">
              <LucideCoins size={26} className="shrink-0" />
              <span className="text-4xl font-extrabold leading-none tabular-nums">
                {walletMon ?? "—"}
              </span>
              <span className="text-sm font-bold opacity-80">MON</span>
            </div>
            <div className="mt-2 font-mono text-[11px] text-[#f4f1fe]/55">
              {hasWallet
                ? "spendable in this shop"
                : "points checkout — earn by chatting"}
            </div>
            {activity && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#836ef9]/10 border border-[#836ef9]/25 px-3 py-2">
                <span className="font-mono text-[10px] text-[#a99bfc]">Chug Points</span>
                <span
                  data-testid="chug-points"
                  className="font-mono text-sm font-extrabold tabular-nums text-[#f4f1fe]"
                >
                  {activity.points.toLocaleString()}
                </span>
              </div>
            )}
            {isTurboActive && (
              <div className="cl-chip mt-3 border-[#f59e0b]/40 bg-[#f59e0b]/15 text-[#f59e0b]">
                🚀 Turbo active
                {turboLeft && (
                  <span className="font-mono font-bold tabular-nums">
                    {" "}
                    · {turboLeft}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Shop info ticker */}
        <div className="relative z-10 mt-6 flex items-center justify-between flex-wrap gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cl-chip">
              <LucideFlame size={14} className="text-[#f59e0b]" />
              <strong>Turbo</strong> 2x rank progress
            </span>
            <span className="cl-chip">
              <LucideClock size={14} className="text-[#5ce68a]" />
              <strong>8</strong> items to unlock
            </span>
          </div>

          <span className="cl-chip text-[#5ce68a]">
            <LucideShieldCheck size={13} /> Paid in MON · settles on Monad
          </span>
        </div>
      </div>

      {checkoutMsg && (
        <div
          role="status"
          data-testid="shop-checkout-status"
          className="cl-toast-in mt-4 flex items-center gap-3 rounded-2xl border border-[#836ef9]/40 bg-[#836ef9]/10 px-4 py-3"
        >
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#836ef9]/30 border-t-[#836ef9]"
          />
          <p className="text-sm text-[#f4f1fe]/80">{checkoutMsg}</p>
        </div>
      )}

      {justBought && (
        <div
          role="status"
          className="cl-toast-in mt-4 flex items-center gap-3 rounded-2xl border border-[#5ce68a]/40 bg-[#5ce68a]/10 px-4 py-3"
        >
          <span className="cl-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5ce68a]/15 text-[#5ce68a]">
            <LucideCheck size={16} />
          </span>
          <p className="text-sm text-[#f4f1fe]/80">
            Unlocked <strong className="text-[#5ce68a]">{justBought}</strong>!
            Enjoy the vibes.
          </p>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="mt-8 flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Items" },
          { id: "capacity", label: "🏘️ Room Capacity" },
          { id: "powerup", label: "⚡ Power-Ups" },
          { id: "cosmetic", label: "✨ Cosmetics" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id as never)}
            className="cl-pill"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="cl-section-title">Shop Catalog</h2>
        <span className="font-mono text-[11px] text-[#f4f1fe]/55">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="cl-stagger mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const chainValue = parseEther(item.price);
          const canPayChain = !balance || balance.value >= chainValue;
          const canAffordPts = (activity?.points ?? 0) >= item.pointsPrice;
          const isOwned = ((activity?.ownedItems ?? []) as string[]).includes(item.id);
          const payingMon = pendingItem === item.id && !!treasury && hasWallet;
          const payingPts = pendingItem === item.id && (!treasury || !hasWallet);

          const disabledMon = !address || busy || isOwned || !treasury || !hasWallet || !canPayChain;
          const disabledPts = !address || busy || isOwned || !canAffordPts;

          return (
            <div
              key={item.id}
              data-testid={`shop-${item.id}`}
              className="cl-card-flat hover:border-[#836ef9]/50 transition duration-200 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="w-12 h-12 text-2xl rounded-2xl bg-[#08080d] border border-white/5 flex items-center justify-center" aria-hidden>
                    {item.emoji}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="cl-chip bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b] font-bold tabular-nums">
                      {item.price} MON
                    </span>
                    <span className="cl-chip bg-[#836ef9]/10 border-[#836ef9]/30 text-[#a99bfc] font-bold tabular-nums">
                      {item.pointsPrice.toLocaleString()} pts
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-[15px] text-[#f4f1fe] mt-4">{item.name}</h3>
                <p className="text-xs text-[#f4f1fe]/55 mt-2 leading-relaxed">{item.blurb}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                {isOwned ? (
                  <div className="text-center text-xs font-bold text-[#5ce68a] py-2 bg-[#5ce68a]/10 rounded-2xl border border-[#5ce68a]/20">
                    ✓ In your inventory
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Pay from wallet in MON */}
                    <button
                      type="button"
                      data-testid={`buy-${item.id}-mon`}
                      disabled={disabledMon}
                      onClick={() => void buy(item, "mon")}
                      className={`cl-btn cl-btn-sm w-full ${
                        disabledMon
                          ? "bg-white/5 text-[#f4f1fe]/40 border border-white/10 cursor-not-allowed"
                          : "cl-btn-primary"
                      }`}
                    >
                      <LucideCoins size={14} />
                      {payingMon
                        ? "Confirming…"
                        : !hasWallet
                          ? "Connect wallet for MON"
                          : `Pay ${item.price} MON`}
                    </button>
                    {/* Or spend earned Chug Points */}
                    <button
                      type="button"
                      data-testid={`buy-${item.id}`}
                      disabled={disabledPts}
                      onClick={() => void buy(item, "points")}
                      className={`cl-btn cl-btn-sm w-full ${
                        disabledPts
                          ? "bg-white/5 text-[#f4f1fe]/40 border border-white/10 cursor-not-allowed"
                          : "cl-btn-ghost !text-[#a99bfc] !border-[#836ef9]/40"
                      }`}
                    >
                      <LucideSparkles size={14} />
                      {payingPts
                        ? "Unlocking…"
                        : `Use ${item.pointsPrice.toLocaleString()} pts`}
                    </button>
                    {!canAffordPts && address && !payingPts && (
                      <p className="flex items-center justify-center gap-1 text-[10px] text-[#f4f1fe]/45">
                        <LucideTrendingUp size={11} className="text-[#836ef9]" />
                        Chat to earn points — every message pays 25
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Capacity Status */}
      <section className="cl-card mt-8 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#836ef9]/20 text-[#836ef9] flex items-center justify-center shrink-0">
              <LucideWallet size={20} />
            </div>
            <div>
              <div className="cl-section-title">Room Capacity</div>
              <div className="mt-2 font-bold text-sm text-[#f4f1fe]">
                {ownedRooms ?? 0} / {activity?.roomSlots ?? 1} rooms created
              </div>
              <p className="mt-2 max-w-md text-xs text-[#f4f1fe]/55 leading-relaxed">
                Every chog holder gets 1 room free. Buy 5-room or 8-room packs above to expand your chat territory.
              </p>
            </div>
          </div>

          <a
            href="/rooms/new"
            className="cl-btn cl-btn-ghost cl-btn-sm"
          >
            Create Room →
          </a>
        </div>
      </section>

      {/* User Rank Progress */}
      <section className="cl-card mt-4 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="cl-section-title flex items-center gap-2">
            <LucideRocket size={14} className="text-[#836ef9]" />
            Your Activity Rank
          </div>
          <button
            type="button"
            onClick={() => setShowRankModal(true)}
            className="cl-btn cl-btn-ghost cl-btn-sm text-[#836ef9]"
          >
            View Full 11-Rank Ladder →
          </button>
        </div>

        {rank && activity ? (
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <RankBadge rank={rank} size="md" showLevel />
            <div className="grow w-full">
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    background: rank.color,
                    width: `${pct}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#f4f1fe]/55 mt-2 font-mono">
                <span>{pct}% to next level ({next?.name ?? "Max"})</span>
                <span>{activity.messageCount} messages · {Math.round((activity.onlineMinutes / 60) * 10) / 10}h online</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#f4f1fe]/55">Sign in to see your rank climb the ladder.</div>
        )}
      </section>

      <RankLadderModal
        activity={activity}
        isOpen={showRankModal}
        onClose={() => setShowRankModal(false)}
      />
    </div>
  );
}
