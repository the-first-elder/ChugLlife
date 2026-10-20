import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useClient } from "../hooks/useClient";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../model/db";
import { clientAddress } from "../model/conversations";
import { useClientStatus } from "../hooks/useClient";
import { rankProgress } from "../model/rank";
import RankBadge from "./RankBadge";
import RankLadderModal from "./RankLadderModal";
import { LucideCoins } from "lucide-react";

export default function Header({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const client = useClient();
  const { isDemo } = useClientStatus();
  const [showRankModal, setShowRankModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        className={`sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#000000]/60 transition-shadow duration-300 ${
          scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]" : ""
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="px-4 sm:px-6 h-14 flex gap-3 justify-between items-center max-w-5xl mx-auto">
          <Link
            to="/"
            className="my-auto text-lg font-extrabold text-[#f4f1fe] flex items-center gap-2.5 tracking-tight group shrink-0"
          >
            {/* Real Chog avatar as the app icon */}
            <span className="relative w-8 h-8 rounded-[10px] overflow-hidden ring-1 ring-[#836ef9]/50 group-hover:ring-[#836ef9] group-hover:scale-105 transition-all duration-200 bg-[#0c0c12] shadow-[0_0_12px_-4px_rgba(131,110,249,0.6)] shrink-0">
              <img
                src="chog-app-icon.webp"
                alt="Choglife"
                className="absolute inset-0 h-full w-full object-cover"
                width={250}
                height={250}
              />
            </span>
            <span className="leading-none text-[15px] font-extrabold tracking-tight">
              Chuglife
            </span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            {/* Rank chip — opens the ladder */}
            {activity && rank && (
              <button
                type="button"
                onClick={() => setShowRankModal(true)}
                title="View Rank Ladder & Progress"
                className="flex items-center gap-1.5 bg-[#0c0c12]/80 hover:bg-[#14141b] hover:border-[#836ef9]/50 hover:shadow-[0_0_14px_rgba(131,110,249,0.35)] border border-[#836ef9]/25 pl-1.5 pr-2.5 py-1 rounded-full transition-all duration-200 active:scale-95"
              >
                <RankBadge rank={rank} size="sm" />
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#836ef9] tabular-nums">
                  <LucideCoins size={11} />
                  {activity.points} pts
                </span>
              </button>
            )}

            {!client && !isDemo && (
              <Link
                to="/login"
                className="cl-btn cl-btn-ghost cl-btn-sm !rounded-full"
              >
                Sign in
              </Link>
            )}

            {!isDemo && (
              <div className="connect-button hidden sm:block">
                {children ?? <ConnectButton showBalance={false} />}
              </div>
            )}
          </div>
        </div>
        {/* Hairline glow instead of a hard border */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#836ef9]/35 to-transparent" />
      </header>

      <RankLadderModal
        activity={activity}
        isOpen={showRankModal}
        onClose={() => setShowRankModal(false)}
      />
    </>
  );
}
