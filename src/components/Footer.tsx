import * as React from "react";
import { Link } from "react-router-dom";
import { LucideChogIcon } from "./ChogIcons";

export const Footer = ({ bottomInset = true }: { bottomInset?: boolean }) => {
  return (
    <footer
      className={`px-6 py-10 bg-[#000000] border-t border-[rgba(244,241,254,0.08)] text-[#f4f1fe] ${
        bottomInset ? "pb-36" : "pb-10"
      }`}
    >
      <div className="max-w-6xl mx-auto flex gap-8 max-md:flex-col">
        <div className="flex flex-col w-[40%] max-md:w-full">
          <Link
            to="/"
            className="text-lg font-extrabold text-[#f4f1fe] flex items-center gap-2.5"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#836ef9] to-[#a99bfc] flex items-center justify-center shadow-chog">
              <LucideChogIcon size={18} />
            </span>
            Chuglife
          </Link>
          <div className="mt-2.5 text-xs leading-relaxed text-[#f4f1fe]/55 max-w-sm">
            Vibe matchmaking, moderated group rooms, and activity ranks for <span className="text-[#a99bfc] font-bold">Chog Genesis</span> holders on Monad. Match by traits, chat over XMTP. Built for Chogathon 2026.
          </div>
          <div className="mt-4 flex gap-4 text-xs font-mono text-[#f4f1fe]/50">
            <a href="https://chog.xyz" target="_blank" rel="noreferrer" className="hover:text-[#a99bfc] transition">
              chog.xyz
            </a>
            <a href="https://chogathon.chog.xyz" target="_blank" rel="noreferrer" className="hover:text-[#a99bfc] transition">
              Chogathon
            </a>
            <a href="https://monad.xyz" target="_blank" rel="noreferrer" className="hover:text-[#a99bfc] transition">
              Monad
            </a>
            <a href="https://docs.xmtp.org" target="_blank" rel="noreferrer" className="hover:text-[#a99bfc] transition">
              XMTP
            </a>
          </div>
        </div>
        <div className="flex flex-col ml-5 w-[60%] max-md:ml-0 max-md:w-full">
          <div className="justify-between px-0 max-md:mt-2">
            <div className="flex gap-8 max-md:flex-col text-xs">
              <div className="flex flex-col w-4/12 max-md:w-full">
                <div className="cl-section-title">Chuglife</div>
                <Link to="/rooms" className="mt-2.5 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Chat Rooms</Link>
                <Link to="/match" className="mt-2 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Vibe Match</Link>
                <Link to="/shop" className="mt-2 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Chuglife Shop</Link>
                <Link to="/explore" className="mt-2 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Explore Chogs</Link>
              </div>
              <div className="flex flex-col w-4/12 max-md:w-full max-md:mt-4">
                <div className="cl-section-title">Infrastructure</div>
                <a href="https://docs.xmtp.org" target="_blank" rel="noreferrer" className="mt-2.5 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">XMTP V3 MLS</a>
                <a href="https://testnet.monadexplorer.com" target="_blank" rel="noreferrer" className="mt-2 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Monad Testnet</a>
                <a href="https://magiceden.io/chains/monad" target="_blank" rel="noreferrer" className="mt-2 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Magic Eden</a>
              </div>
              <div className="flex flex-col w-4/12 max-md:w-full max-md:mt-4">
                <div className="cl-section-title">Community</div>
                <a href="https://chogathon.chog.xyz" target="_blank" rel="noreferrer" className="mt-2.5 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Chogathon 2026</a>
                <a href="https://discord.com/invite/monad" target="_blank" rel="noreferrer" className="mt-2 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Monad Discord</a>
                <a href="https://x.com/chog_nft" target="_blank" rel="noreferrer" className="mt-2 text-[#f4f1fe]/55 hover:text-[#a99bfc] transition">Chog on X</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/5 text-[11px] text-[#f4f1fe]/40 flex items-center justify-between flex-wrap gap-2">
        <span>gm, gmonad. Fully decentralized, private, and moderated.</span>
        <span>Chuglife v1.0.0</span>
      </div>
    </footer>
  );
};
