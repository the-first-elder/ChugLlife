import { ReactElement, useMemo } from "react";
import ChogImage from "./ChogImage";
import demoChogsData from "../data/demo-chogs.json";

/** FNV-1a-ish tiny hash for deterministic per-page layouts. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface Spot {
  top: string;
  /** one side is intentionally undefined — chogs hug either edge */
  left?: string;
  right?: string;
  size: number;
  rotate: number;
  opacity: number;
  blur: number;
  chogIndex: number;
}

/**
 * A drifting collage of real Chog NFTs rendered behind a page. Each page
 * passes its own `seed`, so every screen gets a different arrangement of
 * different chogs.
 */
export default function ChogBackdrop({
  seed,
  count = 7,
  faint = false,
}: {
  seed: string;
  count?: number;
  faint?: boolean;
}): ReactElement {
  const chogs = demoChogsData.demoChogs as {
    tokenId: string;
    address: string;
    image: string;
  }[];

  const spots: Spot[] = useMemo(() => {
    let h = hash(seed);
    const rand = () => {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      return h / 0x7fffffff;
    };
    return Array.from({ length: count }, () => {
      const size = 90 + Math.floor(rand() * 150);
      const side = rand() > 0.5;
      const spot: Spot = {
        top: `${Math.floor(rand() * 78)}%`,
        left: side ? `${Math.floor(rand() * 30)}%` : undefined,
        right: side ? undefined : `${Math.floor(rand() * 30)}%`,
        size,
        rotate: Math.floor(rand() * 36 - 18),
        opacity: (faint ? 0.16 : 0.3) + rand() * (faint ? 0.08 : 0.16),
        blur: rand() > 0.65 ? 1.5 : 0,
        chogIndex: Math.floor(rand() * chogs.length),
      };
      return spot;
    });
  }, [seed, count, faint, chogs.length]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      data-testid={`chog-backdrop-${seed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      {spots.map((s, i) => (
        <div
          key={i}
          className="absolute overflow-hidden rounded-[28%] shadow-2xl will-change-transform"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            transform: `rotate(${s.rotate}deg)`,
            filter: s.blur ? `blur(${s.blur}px)` : undefined,
          }}
        >
          <ChogImage image={chogs[s.chogIndex]?.image ?? ""} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
      {/* readability veil — content always wins over the collage */
      }
      {/* much lighter now so the Chog NFT collage actually shows through */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#100e1a]/10 via-[#100e1a]/20 to-[#100e1a]/45" />
    </div>
  );
}
