import { ReactElement } from "react";
import { Rank } from "../model/rank";

export default function RankBadge(p: {
  rank: Rank;
  size?: "sm" | "md" | "lg";
  showLevel?: boolean;
}): ReactElement {
  const { level, color, emoji, name } = p.rank;
  const isSm = p.size === "sm";
  const isLg = p.size === "lg";

  // Tier 2: Hopper, Trailblazer, Pathfinder (Levels 4-6) - Vibrant neon
  const isTier2 = level >= 4 && level <= 6;
  // Tier 3: Vanguard, Elite, Ascendant (Levels 7-9) - Cosmic aura & pulse
  const isTier3 = level >= 7 && level <= 9;
  // Tier 4: Mythic & Legendary (Levels 10-11) - Radiant gold/amber prestige
  const isTier4 = level >= 10;

  const pad = isSm
    ? "px-2 py-0.5 text-[10px]"
    : isLg
    ? "px-3.5 py-1.5 text-sm"
    : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold select-none transition-all duration-300 ${pad} ${
        isTier4
          ? "ring-1 ring-[#FFD700]/70 shadow-[0_0_18px_rgba(255,215,0,0.4)] animate-pulse"
          : isTier3
          ? "ring-1 ring-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
          : isTier2
          ? "shadow-[0_0_8px_rgba(6,182,212,0.25)]"
          : ""
      }`}
      style={{
        background: isTier4
          ? `linear-gradient(135deg, ${color}35, #161228 85%)`
          : isTier3
          ? `linear-gradient(135deg, ${color}28, ${color}10)`
          : `${color}18`,
        color: isTier4 ? "#FFE875" : color,
        border: `1px solid ${color}${isTier4 ? "cc" : isTier3 ? "99" : isTier2 ? "66" : "40"}`,
      }}
      title={`Level ${level} · ${name} Rank`}
    >
      <span
        aria-hidden
        className={`${
          isTier4 ? "scale-110 drop-shadow-[0_0_6px_gold]" : ""
        }`}
      >
        {emoji}
      </span>
      <span className="tracking-tight">{name}</span>
      {p.showLevel && (
        <span
          className="text-[9px] font-mono opacity-70 px-1 py-0.2 rounded bg-black/30"
        >
          L{level}
        </span>
      )}
      {isTier4 && (
        <span className="text-[10px] text-amber-300 drop-shadow animate-ping">
          ✨
        </span>
      )}
    </span>
  );
}

