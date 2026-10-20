import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, ReactElement, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  /** Marketing/login screens never show points — you haven't earned them yet. */
  const onEntryRoute = ["/", "/login"].includes(location.pathname);

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
            className="my-auto flex items-center gap-2.5 shrink-0 tracking-tight group no-underline"
            title="Chuglife"
          >
            {/* Real Chog avatar as the app icon */}
            <span className="relative w-9 h-9 rounded-[12px] overflow-hidden ring-2 ring-[#836ef9]/60 group-hover:ring-[#5ce68a] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 bg-[#14121f] shadow-[0_0_18px_-2px_rgba(131,110,249,0.6)] shrink-0">
              <img
                src="/chog-app-icon.webp"
                alt="Choglife"
                className="absolute inset-0 h-full w-full object-cover"
                width={250}
                height={250}
              />
            </span>
            <span className="relative leading-none flex items-baseline select-none">
              <span className="cl-wordmark group-hover:tracking-widest transition-all duration-300">
                Chug
              </span>
              <span className="cl-wordmark-clash group-hover:translate-x-0.5 transition-all duration-300">
                life
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            {/* Rank chip — opens the ladder (never on entry screens) */}
            {!onEntryRoute && activity && rank && (
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
