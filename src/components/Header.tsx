import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { useClient } from "../hooks/useClient";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../model/db";
import { clientAddress } from "../model/conversations";
import { rankProgress } from "../model/rank";
import RankBadge from "./RankBadge";
import RankLadderModal from "./RankLadderModal";
import { LucideCoins } from "lucide-react";

export default function Header({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const client = useClient();
  const [showRankModal, setShowRankModal] = useState(false);

  const myAddress = client ? clientAddress(client) : "";
  const activity = useLiveQuery(
    () => (myAddress ? db.activity.get(myAddress) : undefined),
    [myAddress]
  );
  const { rank } = activity
    ? rankProgress(activity.chatPoints + activity.presencePoints)
    : { rank: undefined };

  return (
    <>
      <header
        className="sticky top-0 z-50 px-4 sm:px-8 py-2.5 border-b border-[rgba(244,241,254,0.1)] bg-[#0e0b1a]/92 backdrop-blur-xl"
        style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
      >
        <div className="flex gap-4 justify-between items-center max-w-7xl mx-auto">
          <Link
            to="/"
            className="my-auto text-lg font-extrabold text-[#f4f1fe] flex items-center gap-2.5 tracking-tight group"
          >
            {/* Real Chog avatar as the app icon */}
            <span className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#836ef9]/50 shadow-chog group-hover:scale-105 transition-transform duration-200 bg-[#161228]">
              <img
                src="chog-app-icon.webp"
                alt="Choglife"
                className="w-full h-full object-cover"
                width={250}
                height={250}
              />
            </span>
            <div className="flex flex-col">
              <span className="leading-none text-base font-extrabold tracking-tight">
                Chuglife
              </span>
              <span className="hidden xs:inline text-[9px] font-mono font-bold text-[#5ce68a] leading-none mt-0.5 tracking-wider uppercase">
                Chogathon 2026
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Quick Rank & MON points badge */}
            {activity && rank && (
              <button
                type="button"
                onClick={() => setShowRankModal(true)}
                title="View Rank Ladder & Progress"
                className="flex items-center gap-1.5 bg-[#161228] hover:bg-[#1e183a] border border-[#836ef9]/30 px-2.5 py-1 rounded-xl transition shadow-sm"
              >
                <RankBadge rank={rank} size="sm" />
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-xs font-bold text-[#f59e0b]">
                  <LucideCoins size={12} />
                  {activity.points}
                </span>
              </button>
            )}

            {!client && (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#836ef9]/15 hover:bg-[#836ef9]/25 text-[#836ef9] border border-[#836ef9]/30 transition"
              >
                Sign in 🐸
              </Link>
            )}

            <div className="connect-button">
              {children ?? <ConnectButton />}
            </div>
          </div>
        </div>
      </header>

      <RankLadderModal
        activity={activity}
        isOpen={showRankModal}
        onClose={() => setShowRankModal(false)}
      />
    </>
  );
}
