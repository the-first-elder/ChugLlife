import * as React from "react";
import { Link } from "react-router-dom";
import { LucideArrowRight } from "lucide-react";

const CHOGS = [
  "chog-1033.webp",
  "chog-517.webp",
  "chog-603.webp",
  "chog-689.webp",
  "chog-hero.webp",
  "chog-775.webp",
];

export const Review = () => {
  return (
    <div className="flex flex-col gap-6 justify-center items-center px-5 py-12 sm:py-16 text-[#f4f1fe] bg-[#141026] border-y border-[rgba(244,241,254,0.08)]">
      <h2 className="text-xl sm:text-2xl text-center font-extrabold tracking-tight">
        gm ✦ gmonad ✦ chat, moderate rooms, level up to{" "}
        <span className="text-gradient">Legendary</span> 🐸
      </h2>

      {/* Real Chog strip */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center max-w-md">
        {CHOGS.map((src, i) => (
          <div
            key={src}
            className={`rounded-xl overflow-hidden border border-[rgba(244,241,254,0.14)] shadow-chog-sm aspect-square bg-[#161228] ${
              i % 2 === 0 ? "w-14 sm:w-16 translate-y-1" : "w-12 sm:w-14"
            }`}
          >
            <img
              src={src}
              alt={`Chog ${i}`}
              className="w-full h-full object-cover"
              loading="lazy"
              width={1000}
              height={1000}
            />
          </div>
        ))}
      </div>

      <div className="chog-marquee text-[#836ef9] text-sm font-mono font-bold w-full max-w-3xl">
        <span>
          your chog is your identity ✦ shared traits ✦ chog police auto-mod ✦ 11
          activity ranks ✦ earn mon ✦ xmtp sealed ✦
        </span>
      </div>

      <Link
        to="/match"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#836ef9]/12 border border-[#836ef9]/30 text-[#a99bfc] hover:bg-[#836ef9]/20 hover:text-white font-bold text-sm transition"
      >
        Find your chogmate
        <LucideArrowRight size={16} />
      </Link>
    </div>
  );
};
