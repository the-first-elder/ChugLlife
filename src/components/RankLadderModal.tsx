import { ReactElement } from "react";
import { RANKS, rankProgress } from "../model/rank";
import { Activity } from "../model/db";
import RankBadge from "./RankBadge";
import { LucideX, LucideClock, LucideMessageSquare, LucideSparkles, LucideCheck } from "lucide-react";

export default function RankLadderModal({
  activity,
  isOpen,
  onClose,
}: {
  activity?: Activity;
  isOpen: boolean;
  onClose: () => void;
}): ReactElement | null {
  if (!isOpen) return null;

  const points = activity ? activity.chatPoints + activity.presencePoints : 0;
  const { rank: currentRank, next, pct } = rankProgress(points);
  const messages = activity?.messageCount ?? 0;
  const onlineHours = activity ? Math.round((activity.onlineMinutes / 60) * 10) / 10 : 0;
  const remaining = next ? Math.max(0, next.min - points) : 0;

  const RING = 44;
  const circumference = 2 * Math.PI * RING;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Chuglife Rank Ladder"
    >
      <div className="cl-card cl-fade-in flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden text-[#f4f1fe]">
        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 border-b border-white/10 p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#836ef9]/20 to-transparent"
          />
          <div className="relative flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f59e0b] to-[#ffd700] text-lg text-black shadow-[0_0_18px_-4px_rgba(245,158,11,0.7)]">
              👑
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold tracking-tight">Chuglife Rank Ladder</h2>
              <p className="truncate text-[11px] text-[#f4f1fe]/55">
                11 tiers · Climb through community activity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rank ladder"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#f4f1fe]/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <LucideX size={17} />
          </button>
        </div>

        {/* Current standing */}
        <div className="border-b border-white/10 bg-gradient-to-b from-[#101018] to-[#08080d] px-4 py-5 sm:px-5">
          <div className="flex items-center gap-4">
            {/* Progress ring */}
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={RING + 2}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={RING + 2}
                  fill="none"
                  stroke={currentRank.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                  className="transition-all duration-700 ease-out"
                  style={{ filter: `drop-shadow(0 0 5px ${currentRank.color}88)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <RankBadge rank={currentRank} size="md" />
                <span className="mt-1 font-mono text-[10px] font-bold tabular-nums text-[#f4f1fe]/70">
                  {pct}%
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#836ef9]">
                Level {currentRank.level} of {RANKS.length}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-lg font-extrabold tracking-tight">
                {currentRank.name}
                <span aria-hidden>{currentRank.emoji}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-[#f4f1fe]/50 tabular-nums">
                {points.toLocaleString()} activity pts
              </div>
            </div>
          </div>

          {/* Next-tier progress */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
              <span className="text-[#f4f1fe]/55">
                {next ? `Next: ${next.emoji} ${next.name}` : "Apex reached — all tiers unlocked"}
              </span>
              {next && (
                <span className="font-bold text-[#f59e0b] tabular-nums">
                  {remaining.toLocaleString()} pts to go
                </span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/50">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${currentRank.color}, ${next?.color ?? currentRank.color})`,
                  boxShadow: `0 0 10px ${currentRank.color}66`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="cl-chip">
              <LucideMessageSquare size={13} className="text-[#836ef9]" />
              {messages.toLocaleString()} msgs
            </span>
            <span className="cl-chip">
              <LucideClock size={13} className="text-[#5ce68a]" />
              {onlineHours}h online
            </span>
            <span className="cl-chip">
              <LucideSparkles size={13} className="text-[#f59e0b]" />
              {RANKS.filter((r) => points >= r.min).length} tiers unlocked
            </span>
          </div>
        </div>

        {/* Tier timeline */}
        <div className="flex-1 overflow-y-auto px-4 pb-5 pt-3">
          <div className="cl-section-title sticky top-0 z-10 bg-[#0c0c12]/90 pb-2 pt-1 backdrop-blur-sm">
            Rank hierarchy
          </div>
          <ol className="relative ml-1 space-y-1">
            <span
              aria-hidden
              className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-[#836ef9]/50 via-white/10 to-transparent"
            />
            {RANKS.map((r) => {
              const isCurrent = r.level === currentRank.level;
              const isUnlocked = points >= r.min;

              return (
                <li
                  key={r.level}
                  className={`relative flex items-center gap-3 rounded-xl py-2 pl-1.5 pr-2 transition ${
                    isCurrent ? "bg-[#836ef9]/15" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                      isCurrent
                        ? "border-transparent text-[#000000]"
                        : isUnlocked
                        ? "border-[#5ce68a]/40 bg-[#5ce68a]/10 text-[#5ce68a]"
                        : "border-white/10 bg-[#0c0c12] text-[#f4f1fe]/35"
                    }`}
                    style={
                      isCurrent
                        ? { background: r.color, boxShadow: `0 0 12px ${r.color}66` }
                        : undefined
                    }
                  >
                    {isCurrent ? r.level : isUnlocked ? <LucideCheck size={12} /> : r.level}
                  </span>

                  <RankBadge rank={r} size="sm" />

                  <div className="min-w-0 flex-1">
                    <div
                      className={`flex items-baseline gap-2 text-sm font-bold ${
                        isCurrent
                          ? "text-[#f4f1fe]"
                          : isUnlocked
                          ? "text-[#f4f1fe]/75"
                          : "text-[#f4f1fe]/40"
                      }`}
                    >
                      <span className="truncate">{r.name}</span>
                      <span className="font-mono text-[10px] font-normal text-[#f4f1fe]/40 tabular-nums">
                        {r.min.toLocaleString()} pts
                      </span>
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-[#f4f1fe]/30">
                      Tier {r.level}
                    </div>
                  </div>

                  {isCurrent ? (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-[#000000]"
                      style={{ background: r.color }}
                    >
                      Current
                    </span>
                  ) : isUnlocked ? (
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-[#5ce68a]/80">
                      Unlocked
                    </span>
                  ) : (
                    <span aria-hidden className="shrink-0 text-[11px] text-white/20">
                      🔒
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Footer */}
        <div className="space-y-2.5 border-t border-white/10 bg-[#0c0c12] p-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="cl-chip">
              <LucideMessageSquare size={13} className="text-[#836ef9]" />
              Chatting pushes your rank up
            </span>
            <span className="cl-chip">
              <LucideClock size={13} className="text-[#5ce68a]" />
              Hanging out boosts it too
            </span>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-[#f4f1fe]/50">
            <LucideSparkles size={12} className="shrink-0 text-[#836ef9]" />
            Higher ranks unlock prestige badges, shop discounts & chat glow
          </p>
        </div>
      </div>
    </div>
  );
}
