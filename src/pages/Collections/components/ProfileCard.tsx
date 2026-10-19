import React from "react";
import ChogImage from "../../../components/ChogImage";
import StatItem from "./StatItem";
import { ProfileCardProps } from "../types";
import { chogScanUrl } from "../../../model/chog-portal";

const ProfileCard: React.FC<ProfileCardProps> = ({ address, chogs, error }) => {
  const firstChog = chogs?.[0];
  const traitCount = chogs?.reduce((acc, c) => acc + c.traits.length, 0) ?? 0;
  const rareTraits = chogs
    ?.flatMap((c) => c.traits)
    .filter((t) => t.traitType === "Eyes" || t.traitType === "Body").length ?? 0;

  return (
    <section className="flex flex-col grow px-6 py-8 w-full text-base bg-[#161228] border border-white/10 shadow-chog-sm rounded-3xl">
      <div className="self-center w-[120px] aspect-square rounded-2xl overflow-hidden bg-[#141026] border border-white/10 flex items-center justify-center">
        {firstChog ? (
          <ChogImage
            image={firstChog.image}
            alt={firstChog.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🐸</span>
        )}
      </div>

      <h2 className="self-center mt-5 text-lg font-extrabold text-center text-[#f4f1fe]">
        {firstChog ? firstChog.name : "No Chog yet"}
      </h2>
      <p className="self-center text-xs font-mono text-[#836ef9] mt-1">
        {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "not connected"}
      </p>

      <h3 className="self-center mt-6 text-sm text-center font-bold text-[#f4f1fe]/80 uppercase tracking-wider font-mono">
        Chog stats
      </h3>
      <div className="mt-3 bg-[#141026] rounded-2xl p-3 border border-white/5">
        <StatItem label="Chogs held" value={chogs?.length ?? 0} />
        <StatItem label="Traits displayed" value={traitCount} />
        <StatItem label="Rarest slots" value={rareTraits} />
        <StatItem label="Contract" value="Chog Genesis" />
      </div>

      <h3 className="mt-6 text-sm text-center font-bold text-[#f4f1fe]/80 uppercase tracking-wider font-mono">
        Your vibe
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-center text-[#f4f1fe]/70">
        {chogs && chogs.length > 0
          ? "Your Chog traits are your dating profile here — other holders see what makes you, you: eyes, skins, jerseys and all."
          : "Connect with a Chog in your wallet to unlock your vibe profile."}
      </p>

      {error && error !== "none" && (
        <p className="text-xs text-red-400 mt-3 text-center whitespace-pre-wrap">
          {error}
        </p>
      )}

      {firstChog && (
        <a
          href={chogScanUrl(firstChog.tokenId)}
          target="_blank"
          rel="noreferrer"
          className="self-center px-6 py-2.5 mt-6 bg-[#836ef9] text-white font-bold text-xs rounded-full hover:bg-[#9d8dfc] transition"
        >
          View on MonadScan ↗
        </a>
      )}
    </section>
  );
};

export default ProfileCard;
