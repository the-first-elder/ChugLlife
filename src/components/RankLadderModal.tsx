import { ReactElement } from "react";
import { RANKS, rankProgress } from "../model/rank";
import { Activity } from "../model/db";
import RankBadge from "./RankBadge";
import { LucideX, LucideFlame, LucideClock, LucideMessageSquare, LucideAward, LucideSparkles } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141026] border border-[#836ef9]/30 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-chog-lg overflow-hidden text-[#f4f1fe]">
        {/* Header */}
        <div className="p-5 border-b border-[rgba(244,241,254,0.1)] flex items-center justify-between bg-[#161228]/80">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f59e0b] to-[#ffd700] text-black flex items-center justify-center text-lg shadow-sm">
              👑
            </span>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">Chuglife Rank Ladder</h2>
              <p className="text-[11px] text-[#f4f1fe]/50">
                11 Prestigious Tiers · Earn by Chatting & Staying Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#f4f1fe]/60 hover:text-white transition"
          >
            <LucideX size={18} />
          </button>
        </div>

        {/* User Current Standing Card */}
        <div className="p-5 bg-gradient-to-b from-[#181330] to-[#141026] border-b border-[rgba(244,241,254,0.08)]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <RankBadge rank={currentRank} size="lg" showLevel />
              <div>
                <div className="text-xs font-bold text-[#f4f1fe]">
                  Level {currentRank.level} · {currentRank.name}
                </div>
                <div className="text-[10px] text-[#5ce68a] font-mono">
                  {points.toLocaleString()} total activity pts
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
              <span className="flex items-center gap-1 text-[#f4f1fe]/80" title="Messages sent">
                <LucideMessageSquare size={13} className="text-[#836ef9]" />
                {messages} msgs
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1 text-[#f4f1fe]/80" title="Active hours online">
                <LucideClock size={13} className="text-[#5ce68a]" />
                {onlineHours}h online
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-[#f4f1fe]/60">
                Progress to {next ? `${next.emoji} ${next.name}` : "Max Rank"}
              </span>
              <span className="text-[#f59e0b] font-bold">{pct}%</span>
            </div>
            <div className="h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${currentRank.color}, ${next?.color ?? currentRank.color})`,
                  boxShadow: `0 0 10px ${currentRank.color}88`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#f4f1fe]/40 mt-1 font-mono">
              <span>{points} pts</span>
              <span>{next ? `${next.min - points} pts remaining` : "♛ Apex Legendary Chog"}</span>
            </div>
          </div>

          {/* How points work */}
          <div className="mt-3.5 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-[#f4f1fe]/70">
            <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl">
              <LucideFlame size={14} className="text-[#f59e0b]" />
              <span><strong>+5 MON</strong> per message sent</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl">
              <LucideClock size={14} className="text-[#5ce68a]" />
              <span><strong>+1 MON</strong> per active minute</span>
            </div>
          </div>
        </div>

        {/* 11 Ranks Progression List */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1 divide-y divide-white/5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#f4f1fe]/40 px-1 pt-1">
            Complete Rank Hierarchy
          </div>
          {RANKS.map((r) => {
            const isCurrent = r.level === currentRank.level;
            const isUnlocked = points >= r.min;

            return (
              <div
                key={r.level}
                className={`pt-2.5 flex items-center justify-between p-2 rounded-2xl transition ${
                  isCurrent
                    ? "bg-[#836ef9]/15 border border-[#836ef9]/40 shadow-sm"
                    : isUnlocked
                    ? "bg-white/[0.02] hover:bg-white/[0.04]"
                    : "opacity-45 hover:opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-mono text-xs font-bold text-[#f4f1fe]/40 text-center">
                    #{r.level}
                  </span>
                  <RankBadge rank={r} size="md" />
                </div>

                <div className="flex items-center gap-3 text-right font-mono text-xs">
                  <div>
                    <span className="text-[#f4f1fe]/70 font-bold">
                      {r.min.toLocaleString()} pts
                    </span>
                    <div className="text-[9px] text-[#f4f1fe]/40">
                      {r.level === 1
                        ? "Starting rank"
                        : `~${Math.round(r.min / 10)} msgs & time`}
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#836ef9] text-white font-bold">
                      Current
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-xs text-[#5ce68a]">✓</span>
                  ) : (
                    <span className="text-xs text-white/30">🔒</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#161228] border-t border-[rgba(244,241,254,0.1)] text-center text-[11px] text-[#f4f1fe]/50 flex items-center justify-center gap-2">
          <LucideSparkles size={13} className="text-[#836ef9]" />
          Higher ranks unlock exclusive prestige badges, shop discounts & chat glow!
        </div>
      </div>
    </div>
  );
}
