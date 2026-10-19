import React from "react";
import { Link } from "react-router-dom";
import { LucideChogIcon } from "../../../components/ChogIcons";
import { CHOG_NFT_ADDRESS } from "../../../util/monad";

export const Hero = () => {
  return (
    <main className="flex justify-center items-center px-6 sm:px-16 py-16 bg-[#0e0b1a] text-[#f4f1fe] max-md:px-5 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#836ef9]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#5ce68a]/10 rounded-full blur-3xl pointer-events-none" />

      <section className="justify-between w-full max-w-[1300px] relative z-10">
        <div className="flex gap-10 items-center max-md:flex-col">
          <div className="flex flex-col w-[54%] max-md:w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#836ef9]/15 border border-[#836ef9]/30 text-[#836ef9] text-xs font-mono font-bold w-fit mb-4">
              <span>🐸</span> Chogathon 2026 Hackathon Entry
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#f4f1fe] leading-tight tracking-tight">
              Take the Chog out.
              <br />
              Does <span className="text-[#836ef9] underline decoration-[#5ce68a] decoration-wavy">your match</span> still work?
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#f4f1fe]/70 leading-relaxed max-w-xl">
              Chuglife is vibe dating for{" "}
              <a
                href={`https://monadscan.com/nft/${CHOG_NFT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#836ef9] font-bold underline"
              >
                Chog Genesis
              </a>{" "}
              holders on Monad. Your NFT's traits — eyes, skin, jersey, chaos level — are
              your identity. Chat in moderated rooms with Chog Police, climb the 11-level ranking ladder, and earn MON by being active.
            </p>

            <div className="flex gap-3 mt-8 flex-wrap">
              <Link
                to="/login"
                data-testid="hero-cta-demo"
                className="justify-center self-start px-8 py-3 text-[#f4f1fe] bg-[#161228] font-bold rounded-2xl shadow-chog-sm border border-white/10 hover:bg-[#1e183a] transition flex items-center gap-2"
              >
                Try the demo 🐸
              </Link>
              <Link
                to="/match"
                data-testid="hero-cta-match"
                className="justify-center self-start px-8 py-3 text-white bg-[#836ef9] font-bold rounded-2xl shadow-chog hover:bg-[#9d8dfc] transition flex items-center gap-2"
              >
                Start vibing ⚡
              </Link>
              <Link
                to="/rooms"
                className="justify-center self-start px-8 py-3 text-[#f4f1fe] bg-[#161228] font-bold rounded-2xl shadow-chog-sm border border-white/10 hover:bg-[#1e183a] transition"
              >
                Public Rooms 🏘️
              </Link>
            </div>

            {/* Highlights ticker */}
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-xs font-mono">
              <div className="bg-[#141026] p-2.5 rounded-xl border border-white/5">
                <span className="text-[#836ef9] font-bold block text-sm">11 Tiers</span>
                <span className="text-[#f4f1fe]/50 text-[10px]">Activity Ranks</span>
              </div>
              <div className="bg-[#141026] p-2.5 rounded-xl border border-white/5">
                <span className="text-[#5ce68a] font-bold block text-sm">Chog Police</span>
                <span className="text-[#f4f1fe]/50 text-[10px]">Room Auto-Mod</span>
              </div>
              <div className="bg-[#141026] p-2.5 rounded-xl border border-white/5">
                <span className="text-[#f59e0b] font-bold block text-sm">MON Economy</span>
                <span className="text-[#f4f1fe]/50 text-[10px]">Earn by Chatting</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col ml-4 w-[46%] max-md:w-full max-md:ml-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#836ef9] to-[#5ce68a] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500" />
              <img
                loading="lazy"
                src="nfthero.png"
                alt="Chuglife showcase"
                className="relative w-full rounded-3xl shadow-chog-lg border border-[rgba(244,241,254,0.15)] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
