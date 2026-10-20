import React from "react";
import ChogImage from "../../../components/ChogImage";
import StatItem from "./StatItem";
import { ProfileCardProps } from "../types";
import { chogScanUrl } from "../../../model/chog-portal";
import { Link } from "react-router-dom";
import { LucideFlame } from "lucide-react";

const ProfileCard: React.FC<ProfileCardProps> = ({ address, chogs, error }) => {
  const firstChog = chogs?.[0];
  const traitCount = chogs?.reduce((acc, c) => acc + c.traits.length, 0) ?? 0;
  const rareTraits = chogs
    ?.flatMap((c) => c.traits)
    .filter((t) => t.traitType === "Eyes" || t.traitType === "Body").length ?? 0;

  return (
    <section className="cl-card cl-card-glow cl-fade-in flex flex-col grow px-6 py-8 w-full text-base">
      <div className="relative z-10 flex flex-col grow">
        <div
          className={`self-center w-[120px] aspect-square rounded-2xl overflow-hidden bg-[#08080d] border shadow-chog-glow flex items-center justify-center transition-shadow duration-300 ${
            firstChog
              ? "border-[#836ef9]/50 shadow-[0_0_24px_-6px_rgba(131,110,249,0.5)]"
              : "border-[#836ef9]/30"
          }`}
        >
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
        <span className="cl-chip mx-auto mt-2 max-w-full truncate">
          {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "not connected"}
        </span>

        <h3 className="cl-section-title self-center mt-6">Chog stats</h3>
        <div className="cl-card-flat mt-3 bg-[#08080d] p-3">
          <StatItem label="Chogs held" value={chogs?.length ?? 0} />
          <StatItem label="Traits displayed" value={traitCount} />
          <StatItem label="Rarest slots" value={rareTraits} />
          <StatItem label="Contract" value="Chog Genesis" />
        </div>

        <h3 className="cl-section-title self-center mt-6">Your vibe</h3>
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
          <div className="flex flex-col items-center gap-2 mt-6">
            <Link
              to="/match"
              className="cl-btn cl-btn-primary cl-btn-sm w-full justify-center"
            >
              <LucideFlame size={14} /> Match with this Chog
            </Link>
            <a
              href={chogScanUrl(firstChog.tokenId)}
              target="_blank"
              rel="noreferrer"
              className="cl-btn cl-btn-ghost cl-btn-sm w-full justify-center"
            >
              View on MonadScan ↗
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileCard;
