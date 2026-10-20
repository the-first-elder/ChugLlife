import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useClient, useClientStatus } from "../../../hooks/useClient";
import {
  LucideFlame,
  LucideUsers,
  LucideGem,
  LucideTrophy,
  LucideShieldCheck,
  LucideArrowRight,
  LucideMessageCircle,
  LucideWallet,
  LucideMousePointerClick,
  LucideMessagesSquare,
} from "lucide-react";
import { CHOG_NFT_ADDRESS } from "../../../util/monad";
import Reveal from "../../../components/Reveal";

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
    title: "Chuglife Shop",
    desc: "Room slots, power-ups & cosmetic flair.",
  },
  {
    icon: LucideTrophy,
    color: "#836ef9",
    title: "11 Ranks",
    desc: "Hatchling → Legendary. Flex your prestige.",
  },
];

const STEPS = [
  {
    icon: LucideWallet,
    title: "Connect your wallet",
    desc: "Your Chog NFT is your identity — no passwords, no signups.",
  },
  {
    icon: LucideMousePointerClick,
    title: "Match or explore",
    desc: "Vibe-match by traits, or browse every holder on Monad.",
  },
  {
    icon: LucideMessagesSquare,
    title: "Chat & climb",
    desc: "DM chogmates, hang in rooms, and rise through 11 ranks.",
  },
];

export const Hero = () => {
  const navigate = useNavigate();
  const client = useClient();
  const { startDemo, isDemo } = useClientStatus();
  const signedIn = !!client || isDemo;

  return (
    <main className="relative bg-[#000000] text-[#f4f1fe] overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#836ef9]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-[#5ce68a]/12 rounded-full blur-3xl pointer-events-none" />

      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="cl-stagger">
          {/* Top row: copy + hero chog */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            {/* Copy */}
            <div className="flex flex-col items-start">
              <div className="cl-chip mb-6 !rounded-full !bg-[#836ef9]/12 !border-[#836ef9]/30 !text-[#a99bfc]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ce68a] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5ce68a]" />
                </span>
                LIVE ON MONAD · CHOGATHON 2026
              </div>

              <h1 className="text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
                Your Chog is
                <br />
                your <span className="text-gradient">identity.</span>
              </h1>

              <p className="mt-6 text-sm sm:text-lg text-[#f4f1fe]/65 leading-relaxed max-w-lg">
                Chuglife is vibe-dating &amp; social chat for{" "}
                <a
                  href={`https://monadscan.com/nft/${CHOG_NFT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#a99bfc] font-bold underline decoration-[#836ef9]/60 underline-offset-2 hover:text-[#c4b8fd] transition-colors"
                >
                  Chog Genesis
                </a>{" "}
                holders. Match by traits, chat in moderated rooms, and climb the
                ranks — all over end-to-end encrypted XMTP.
              </p>

              {/* CTAs */}
              <div className="flex gap-3 mt-8 flex-wrap">
                {signedIn ? (
                  <Link
                    to="/conversations"
                    data-testid="hero-cta-match"
                    className="cl-btn cl-btn-primary cl-btn-md group cl-pulse-ring"
                  >
                    Start vibing
                    <LucideArrowRight
                      size={18}
                      className="cl-nudge"
                    />
                  </Link>
                ) : (
                  <ConnectButton.Custom>
                    {({ openConnectModal: openModal }) => (
                      <button
                        type="button"
                        data-testid="hero-cta-match"
                        onClick={() => {
                          if (openModal) openModal();
                          else navigate("/login");
                        }}
                        className="cl-btn cl-btn-primary cl-btn-md group cl-pulse-ring"
                      >
                        Start vibing
                        <LucideArrowRight
                          size={18}
                          className="cl-nudge"
                        />
                      </button>
                    )}
                  </ConnectButton.Custom>
                )}
                <button
                  type="button"
                  data-testid="hero-cta-demo"
                  onClick={() => {
                    if (!signedIn) startDemo();
                    else navigate("/conversations");
                  }}
                  className="cl-btn cl-btn-ghost cl-btn-md"
                >
                  <LucideMessageCircle size={17} className="text-[#5ce68a]" />
                  {signedIn ? "Enter Chuglife" : "Try the demo"}
                </button>
              </div>
              {!signedIn && (
                <p className="mt-2.5 text-[11px] font-mono text-[#f4f1fe]/40">
                  connect your wallet to use the real app · demo is a trial only —
                  chats &amp; points stay out of the real app
                </p>
              )}

              {/* Trust row */}
              <div className="mt-7 flex items-center gap-2.5 flex-wrap">
                <span className="cl-chip">
                  <LucideShieldCheck size={13} className="text-[#5ce68a]" /> E2E
                  encrypted
                </span>
                <span className="cl-chip">⚡ Gas-free chat</span>
                <span className="cl-chip">🐸 Chog Genesis only</span>
              </div>
            </div>

            {/* Hero art: real Chogs, fanned deck + collage */}
            <div className="relative mx-auto w-full max-w-md md:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#836ef9]/30 to-[#5ce68a]/20 rounded-[2rem] blur-2xl pointer-events-none" />

              {/* main chog — gentle float */}
              <div className="cl-float relative rounded-[2rem] overflow-hidden border border-[rgba(244,241,254,0.18)] shadow-chog-lg aspect-square bg-[#0c0c12]">
                <img
                  src="chog-hero.webp"
                  alt="Chog Genesis holder identity"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width={1000}
                  height={1000}
                />
                {/* floating trait chips */}
                <div className="cl-chip absolute top-4 left-4 !bg-black/55 !backdrop-blur-md !border-white/15">
                  👀 Eyes: Big Oval
                </div>
                <div className="cl-chip absolute top-4 right-4 !bg-black/55 !backdrop-blur-md !border-white/15">
                  🧢 Head: Beanie
                </div>
                <div className="cl-chip absolute bottom-4 left-4 !bg-black/55 !backdrop-blur-md !border-white/15">
                  🦆 Bird: On Shoulder
                </div>
                <div className="absolute bottom-4 right-4 cl-chip !bg-[#836ef9]/85 !border-transparent font-extrabold text-white">
                  #474
                </div>
              </div>

              {/* side chogs */}
              <div className="hidden sm:grid grid-cols-4 gap-3 mt-4">
                {["chog-517.webp", "chog-603.webp", "chog-689.webp", "chog-775.webp"].map(
                  (src, i) => (
                    <div
                      key={src}
                      className="rounded-2xl overflow-hidden border border-[rgba(244,241,254,0.12)] shadow-chog-sm aspect-square bg-[#0c0c12] hover:border-[#836ef9]/50 hover:scale-[1.04] hover:-translate-y-1 transition-all duration-200"
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

          {/* How it works */}
          <Reveal className="mt-16 sm:mt-20">
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 relative">
              <div
                aria-hidden
                className="hidden sm:block absolute top-1/2 left-[18%] right-[18%] border-t border-dashed border-[#836ef9]/25 -translate-y-1/2 pointer-events-none"
              />
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="cl-card p-4 sm:p-5 flex sm:flex-col items-start sm:items-center gap-3 sm:gap-0 text-left sm:text-center relative hover:-translate-y-1 hover:border-[#836ef9]/40 transition duration-200"
                  >
                    <span className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#836ef9]/15 border border-[#836ef9]/30 text-[#a99bfc] shadow-chog-sm">
                      <Icon size={19} strokeWidth={2.2} />
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#836ef9] text-[9px] font-extrabold text-white">
                        {i + 1}
                      </span>
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-[11px] sm:text-xs text-[#f4f1fe]/55 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Feature grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <div className="cl-card p-4 sm:p-5 h-full hover:-translate-y-1 hover:border-[#836ef9]/40 hover:shadow-[0_16px_40px_-16px_var(--p-glow)] transition duration-200">
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
                </Reveal>
              );
            })}
          </div>

          {/* Stats strip */}
          <Reveal className="mt-10 sm:mt-14" delay={0.1}>
            <div className="cl-card grid grid-cols-3 gap-3 p-4 sm:p-6 text-center divide-x divide-white/5">
              <div className="group">
                <div className="text-lg sm:text-2xl font-extrabold text-[#836ef9] font-mono group-hover:scale-110 transition-transform duration-200">
                  11
                </div>
                <div className="cl-section-title mt-1">Rank tiers</div>
              </div>
              <div className="group">
                <div className="text-lg sm:text-2xl font-extrabold text-[#5ce68a] font-mono group-hover:scale-110 transition-transform duration-200">
                  XMTP
                </div>
                <div className="cl-section-title mt-1">MLS encrypted</div>
              </div>
              <div className="group">
                <div className="text-lg sm:text-2xl font-extrabold text-[#f59e0b] font-mono group-hover:scale-110 transition-transform duration-200">
                  Shop
                </div>
                <div className="cl-section-title mt-1">Slots, perks & flair</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};
