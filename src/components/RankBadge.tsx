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
    ? "px-2 py-1 text-[10px]"
    : isLg
    ? "px-4 py-2 text-sm"
    : "px-3 py-1 text-xs";

  const dotSize = isSm ? "h-1 w-1" : "h-1.5 w-1.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-bold leading-none align-middle select-none transition-all duration-300 motion-reduce:transition-none ${pad} ${
        isTier4
          ? "ring-1 ring-[#FFD700]/70 shadow-[0_0_18px_rgba(255,215,0,0.4)] motion-reduce:animate-none animate-pulse"
          : isTier3
          ? "ring-1 ring-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
          : isTier2
          ? "shadow-[0_0_8px_rgba(6,182,212,0.25)]"
          : ""
      }`}
      style={{
        background: isTier4
          ? `linear-gradient(135deg, ${color}35, #0c0c12 85%)`
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
        className={`${dotSize} shrink-0 rounded-full`}
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span aria-hidden className={`${isTier4 ? "drop-shadow-[0_0_6px_gold]" : ""}`}>
        {emoji}
      </span>
      <span className="tracking-tight">{name}</span>
      {p.showLevel && (
        <span className="rounded bg-black/30 px-1 py-px font-mono text-[9px] opacity-70">
          L{level}
        </span>
      )}
      {isTier4 && (
        <span aria-hidden className="text-[10px] text-amber-300 drop-shadow">
          ✨
        </span>
      )}
    </span>
  );
}
