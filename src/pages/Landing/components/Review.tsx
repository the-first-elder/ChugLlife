import * as React from "react";
import { LucideChogIcon } from "../../../components/ChogIcons";

export const Review = () => {
  return (
    <div className="flex flex-col gap-6 justify-center items-center px-10 py-12 text-[#f4f1fe] bg-[#141026] border-y border-[rgba(244,241,254,0.08)] max-md:px-5">
      <div className="text-xl text-center max-md:max-w-full font-extrabold tracking-tight">
        gm ✦ gmonad ✦ Chat, moderate rooms, level up to Legendary 🐸
      </div>
      <div className="chog-marquee text-[#836ef9] text-sm font-mono font-bold w-full max-w-3xl">
        <span>
          your chog is your identity ✦ shared traits ✦ chog police auto-mod ✦ 11 activity ranks ✦ earn mon ✦ xmtp sealed ✦
        </span>
      </div>
      <div className="flex gap-3 justify-between items-center">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#836ef9] to-[#a99bfc] text-white flex items-center justify-center shadow-chog">
          <LucideChogIcon size={20} />
        </span>
        <p className="my-auto text-xs text-[#f4f1fe]/70 font-mono">
          Chuglife — Built for Chogathon 2026 on Monad
        </p>
      </div>
    </div>
  );
};
