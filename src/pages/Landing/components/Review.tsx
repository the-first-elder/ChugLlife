import * as React from "react";
import { Link } from "react-router-dom";
import { LucideArrowRight, LucideSparkles } from "lucide-react";
import Reveal from "../../../components/Reveal";

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
    <div className="flex flex-col items-center justify-center gap-7 px-5 py-14 sm:py-20 text-[#f4f1fe] bg-[#08080d] border-y border-[rgba(244,241,254,0.08)] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-64 bg-[#836ef9]/12 rounded-full blur-3xl pointer-events-none" />

      <Reveal className="flex flex-col items-center gap-7 w-full relative z-10">
        <div className="text-center">
          <div className="cl-section-title mb-3">The Chog life</div>
          <h2 className="text-xl sm:text-2xl text-center font-extrabold tracking-tight">
            gm ✦ gmonad ✦ chat, moderate rooms, level up to{" "}
            <span className="text-gradient">Legendary</span> 🐸
          </h2>
        </div>

        {/* Real Chog trait strip */}
        <div className="cl-card-flat flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center max-w-md px-4 py-3">
          {CHOGS.map((src, i) => (
            <div
              key={src}
              className={`rounded-xl overflow-hidden border border-[rgba(244,241,254,0.14)] shadow-chog-sm aspect-square bg-[#0c0c12] hover:border-[#836ef9]/50 hover:-translate-y-1 hover:scale-105 transition-all duration-200 ${
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

        {/* Refined marquee with edge fades */}
        <div className="chog-marquee text-[#a99bfc] text-sm font-mono font-bold w-full max-w-3xl [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <span>
            your chog is your identity ✦ shared traits ✦ chog police auto-mod ✦ 11
            activity ranks ✦ xmtp sealed ✦
          </span>
        </div>

        {/* Closing CTA */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <Link
            to="/login"
            className="cl-btn cl-btn-primary cl-btn-md group cl-pulse-ring"
          >
            <LucideSparkles size={17} />
            Find your chogmate
            <LucideArrowRight size={17} className="cl-nudge" />
          </Link>
          <span className="text-[11px] font-mono text-[#f4f1fe]/40">
            free to start · no gas · wallet or demo
          </span>
        </div>
      </Reveal>
    </div>
  );
};
