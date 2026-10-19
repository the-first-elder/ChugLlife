import React from "react";
import { Link } from "react-router-dom";
import {
  LucideFlame,
  LucideUsers,
  LucideGem,
  LucideTrophy,
  LucideShieldCheck,
  LucideArrowRight,
  LucideMessageCircle,
} from "lucide-react";
import { CHOG_NFT_ADDRESS } from "../../../util/monad";

const FEATURES = [
  {
    icon: LucideFlame,
    color: "#836ef9",
    title: "Vibe Match",
    desc: "Matched by your Chog's eyes, skin & jersey — not just swipes.",
  },
  {
    icon: LucideUsers,
    color: "#5ce68a",
    title: "Chog Rooms",
    desc: "Public chat rooms with Chog Police auto-mod + word filters.",
  },
  {
    icon: LucideGem,
    color: "#f59e0b",
    title: "Earn MON",
    desc: "Chat, stay online, spend MON in the Chuglife shop.",
  },
  {
    icon: LucideTrophy,
    color: "#836ef9",
    title: "11 Ranks",
    desc: "Hatchling → Legendary. Every message levels you up.",
  },
];

export const Hero = () => {
  return (
    <main className="relative bg-[#0e0b1a] text-[#f4f1fe] overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#836ef9]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-[#5ce68a]/12 rounded-full blur-3xl pointer-events-none" />

      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-20 pb-8">
        {/* Top row: copy + hero chog */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Copy */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#836ef9]/12 border border-[#836ef9]/30 text-[#a99bfc] text-[11px] sm:text-xs font-mono font-bold mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ce68a] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5ce68a]" />
              </span>
              LIVE ON MONAD · CHOGATHON 2026
            </div>

            <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl font-extrabold tracking-tight">
              Your Chog is
              <br />
              your <span className="text-gradient">identity.</span>
            </h1>

            <p className="mt-5 text-sm sm:text-lg text-[#f4f1fe]/65 leading-relaxed max-w-lg">
              Chuglife is vibe-dating &amp; social chat for{" "}
              <a
                href={`https://monadscan.com/nft/${CHOG_NFT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#a99bfc] font-bold underline decoration-[#836ef9]/60 underline-offset-2"
              >
                Chog Genesis
              </a>{" "}
              holders. Match by traits, chat in moderated rooms, and climb the
              ranks — all over end-to-end encrypted XMTP.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 mt-7 flex-wrap">
              <Link
                to="/login"
                data-testid="hero-cta-match"
                className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 text-white bg-[#836ef9] font-bold rounded-2xl shadow-chog hover:bg-[#9d8dfc] transition text-sm sm:text-base"
              >
                Start vibing
                <LucideArrowRight
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <Link
                to="/login"
                data-testid="hero-cta-demo"
                className="inline-flex items-center gap-2 px-6 py-3 text-[#f4f1fe] bg-[#181430] font-bold rounded-2xl shadow-chog-sm border border-white/10 hover:bg-[#221b45] hover:border-[#836ef9]/40 transition text-sm sm:text-base"
              >
                <LucideMessageCircle size={17} className="text-[#5ce68a]" />
                Try the demo
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-6 flex items-center gap-4 text-[11px] sm:text-xs font-mono text-[#f4f1fe]/45">
              <span className="flex items-center gap-1.5">
                <LucideShieldCheck size={14} className="text-[#5ce68a]" /> E2E
                encrypted
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>⚡ Gas-free chat</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>🐸 Chog Genesis only</span>
            </div>
          </div>

          {/* Hero art: real Chogs, fanned deck + collage */}
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#836ef9]/30 to-[#5ce68a]/20 rounded-[2rem] blur-2xl pointer-events-none" />

            {/* main chog */}
            <div className="relative rounded-[2rem] overflow-hidden border border-[rgba(244,241,254,0.18)] shadow-chog-lg aspect-square bg-[#161228]">
              <img
                src="chog-hero.webp"
                alt="Chog Genesis holder identity"
                className="w-full h-full object-cover"
                loading="eager"
                width={1000}
                height={1000}
              />
              {/* floating trait chips */}
              <div className="absolute top-4 left-4 bg-black/55 backdrop-blur-md border border-white/15 rounded-xl px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-bold text-[#f4f1fe]">
                👀 Eyes: Big Oval
              </div>
              <div className="absolute top-4 right-4 bg-black/55 backdrop-blur-md border border-white/15 rounded-xl px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-bold text-[#f4f1fe]">
                🧢 Head: Beanie
              </div>
              <div className="absolute bottom-4 left-4 bg-black/55 backdrop-blur-md border border-white/15 rounded-xl px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-bold text-[#f4f1fe]">
                🦆 Bird: On Shoulder
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#836ef9]/85 backdrop-blur-md rounded-xl px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-extrabold text-white">
                #474
              </div>
            </div>

            {/* side chogs */}
            <div className="hidden sm:grid grid-cols-4 gap-3 mt-4">
              {["chog-517.webp", "chog-603.webp", "chog-689.webp", "chog-775.webp"].map(
                (src, i) => (
                  <div
                    key={src}
                    className="rounded-2xl overflow-hidden border border-[rgba(244,241,254,0.12)] shadow-chog-sm aspect-square bg-[#161228] hover:border-[#836ef9]/50 hover:scale-[1.03] transition-transform duration-200"
                  >
                    <img
                      src={src}
                      alt={`Chog Genesis community member ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={1000}
                      height={1000}
                    />
                  </div>
                )
              )}
            </div>
            <p className="hidden sm:block text-center text-[10px] font-mono text-[#f4f1fe]/40 mt-2.5">
              real Chog Genesis chogs on Monad — every holder is a member
            </p>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-[#141026]/80 border border-[rgba(244,241,254,0.1)] hover:border-[#836ef9]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-colors duration-200"
              >
                <span
                  className="inline-flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl items-center justify-center border"
                  style={{
                    background: `${f.color}1a`,
                    borderColor: `${f.color}44`,
                    color: f.color,
                  }}
                >
                  <Icon size={19} strokeWidth={2.2} />
                </span>
                <h3 className="mt-3 font-extrabold text-sm sm:text-base tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-[#f4f1fe]/55 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats strip */}
        <div className="mt-10 sm:mt-14 grid grid-cols-3 gap-3 bg-[#141026]/80 border border-[rgba(244,241,254,0.1)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
          <div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#836ef9] font-mono">
              11
            </div>
            <div className="text-[10px] sm:text-xs text-[#f4f1fe]/50 font-mono mt-0.5 uppercase tracking-wider">
              Rank tiers
            </div>
          </div>
          <div className="border-x border-white/5">
            <div className="text-lg sm:text-2xl font-extrabold text-[#5ce68a] font-mono">
              XMTP
            </div>
            <div className="text-[10px] sm:text-xs text-[#f4f1fe]/50 font-mono mt-0.5 uppercase tracking-wider">
              MLS encrypted
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#f59e0b] font-mono">
              MON
            </div>
            <div className="text-[10px] sm:text-xs text-[#f4f1fe]/50 font-mono mt-0.5 uppercase tracking-wider">
              Earned by chatting
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
