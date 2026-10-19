import { ReactElement, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClient } from "../hooks/useClient";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../model/db";
import { clientAddress } from "../model/conversations";
import { rankProgress } from "../model/rank";
import RankLadderModal from "./RankLadderModal";
import {
  LucideMessageSquare,
  LucideUsers,
  LucideFlame,
  LucideStore,
  LucideCrown,
  LucideCompass,
} from "lucide-react";

export default function BottomNav(): ReactElement {
  const location = useLocation();
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

  const active = (path: string) => {
    if (path === "/conversations" && (location.pathname === "/conversations" || location.pathname.startsWith("/c/"))) {
      return true;
    }
    return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
  };

  const navItems = [
    {
      to: "/conversations",
      label: "Chugmates",
      icon: LucideMessageSquare,
      badge: null,
      authRequired: true,
    },
    {
      to: "/rooms",
      label: "Rooms",
      icon: LucideUsers,
      badge: "Free",
      authRequired: false,
    },
    {
      to: "/match",
      label: "Vibe Match",
      icon: LucideFlame,
      badge: null,
      authRequired: false,
    },
    {
      to: "/shop",
      label: "Shop",
      icon: LucideStore,
      badge: activity ? `${activity.points}` : null,
      authRequired: false,
    },
  ];

  return (
    <>
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#141026]/95 backdrop-blur-xl border-t border-[rgba(244,241,254,0.12)] px-2 sm:px-6 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const isSelected = active(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={!client && item.authRequired ? "/login" : item.to}
                data-testid={`bottom-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 group ${
                  isSelected
                    ? "text-[#836ef9]"
                    : "text-[#f4f1fe]/60 hover:text-[#f4f1fe] hover:bg-white/5"
                }`}
              >
                <div className="relative">
                  <div
                    className={`p-1 rounded-xl transition ${
                      isSelected
                        ? "bg-[#836ef9]/20 shadow-[0_0_12px_rgba(131,110,249,0.5)]"
                        : "group-hover:scale-105"
                    }`}
                  >
                    <Icon size={20} className={isSelected ? "text-[#836ef9]" : ""} />
                  </div>
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 font-mono text-[9px] font-extrabold bg-[#f59e0b] text-black px-1.5 py-0.2 rounded-full shadow-sm leading-tight">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight transition ${
                    isSelected ? "text-[#f4f1fe]" : "text-[#f4f1fe]/60"
                  }`}
                >
                  {item.label}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#836ef9] absolute -bottom-0.5 shadow-[0_0_6px_#836ef9]" />
                )}
              </Link>
            );
          })}

          {/* Ranks & Ladder Button */}
          <button
            type="button"
            onClick={() => setShowRankModal(true)}
            data-testid="bottom-nav-ranks"
            className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[#f4f1fe]/70 hover:text-[#f4f1fe] hover:bg-white/5 transition-all group"
          >
            <div className="relative p-1 rounded-xl group-hover:scale-105 transition">
              <LucideCrown size={20} className="text-[#f59e0b]" />
              {rank && (
                <span className="absolute -top-1 -right-1 text-xs">
                  {rank.emoji}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-tight text-[#f4f1fe]/70">
              {rank ? `Lv.${rank.level}` : "Ranks"}
            </span>
          </button>
        </div>
      </nav>

      <RankLadderModal
        activity={activity}
        isOpen={showRankModal}
        onClose={() => setShowRankModal(false)}
      />
    </>
  );
}
