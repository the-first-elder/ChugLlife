
export interface Rank {
  level: number;
  name: string;
  emoji: string;
  color: string;
  /** Points needed to reach this rank. */
  min: number;
}

export const RANKS: Rank[] = [
  { level: 1, name: "Hatchling", emoji: "🥚", color: "#9CA3AF", min: 0 },
  { level: 2, name: "Sprout", emoji: "🌱", color: "#84CC16", min: 100 },
  { level: 3, name: "Tadpole", emoji: "🐸", color: "#22C55E", min: 250 },
  { level: 4, name: "Hopper", emoji: "⚡", color: "#14B8A6", min: 500 },
  { level: 5, name: "Trailblazer", emoji: "🔥", color: "#06B6D4", min: 1000 },
  { level: 6, name: "Pathfinder", emoji: "💎", color: "#3B82F6", min: 2000 },
  { level: 7, name: "Vanguard", emoji: "👑", color: "#8B5CF6", min: 4000 },
  { level: 8, name: "Elite", emoji: "🌌", color: "#A855F7", min: 7500 },
  { level: 9, name: "Ascendant", emoji: "☄️", color: "#D946EF", min: 13000 },
  { level: 10, name: "Mythic", emoji: "🐉", color: "#F59E0B", min: 21000 },
  { level: 11, name: "Legendary", emoji: "♛", color: "#FFD700", min: 34000 },
];

export function rankFor(points: number): Rank {
  let best = RANKS[0];
  for (const r of RANKS) {
    if (points >= r.min) best = r;
  }
  return best;
}

export function nextRank(points: number): Rank | undefined {
  return RANKS.find((r) => r.min > points);
}

export function rankProgress(points: number): { rank: Rank; next?: Rank; pct: number } {
  const rank = rankFor(points);
  const next = nextRank(points);
  if (!next) return { rank, pct: 100 };
  const pct = Math.min(
    100,
    Math.round(((points - rank.min) / (next.min - rank.min)) * 100)
  );
  return { rank, next, pct };
}
