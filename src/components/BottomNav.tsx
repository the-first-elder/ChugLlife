import { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useClient } from "../hooks/useClient";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../model/db";
import { clientAddress } from "../model/conversations";
import {
  LucideMessageCircle,
  LucideUsers,
  LucideFlame,
  LucideStore,
  LucideGem,
  LucideCompass,
} from "lucide-react";

/**
 * Primary app navigation — a native-style bottom tab bar on every viewport.
 * Every tab is a real page; the header stays a lightweight app bar (logo,
 * rank, wallet) so the two never compete.
 */
const NAV_ITEMS = [
  {
    to: "/conversations",
    label: "Chats",
    icon: LucideMessageCircle,
    authRequired: true,
  },
  {
    to: "/explore",
    label: "Explore",
    icon: LucideCompass,
    authRequired: false,
  },
  {
    to: "/match",
    label: "Match",
    icon: LucideFlame,
    authRequired: false,
  },
  {
    to: "/rooms",
    label: "Rooms",
    icon: LucideUsers,
    authRequired: false,
  },
  {
    to: "/collections",
    label: "My Chogs",
    icon: LucideGem,
    authRequired: false,
  },
  {
    to: "/shop",
    label: "Shop",
    icon: LucideStore,
    authRequired: false,
  },
];

export default function BottomNav(): ReactElement {
  const location = useLocation();
  const client = useClient();

  const myAddress = client ? clientAddress(client) : "";
  const activity = useLiveQuery(
    () => (myAddress ? db.activity.get(myAddress) : undefined),
    [myAddress]
  );

  const active = (path: string) => {
    if (
      path === "/conversations" &&
      (location.pathname === "/conversations" ||
        location.pathname.startsWith("/c/"))
    ) {
      return true;
    }
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
    );
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#131024]/97 backdrop-blur-xl border-t border-[rgba(244,241,254,0.12)] shadow-[0_-8px_30px_rgba(0,0,0,0.55)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around w-full max-w-lg mx-auto px-1">
        {NAV_ITEMS.map((item) => {
          const isSelected = active(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={!client && item.authRequired ? "/login" : item.to}
              data-testid={`bottom-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              aria-current={isSelected ? "page" : undefined}
              className="relative flex-1 flex flex-col items-center justify-center gap-[3px] pt-2 pb-1.5 min-h-[58px]"
            >
              {/* sliding active pill */}
              {isSelected && (
                <motion.span
                  layoutId="tab-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-x-1 top-1 bottom-0.5 rounded-2xl bg-[#836ef9]/18 border border-[#836ef9]/25 shadow-[0_0_16px_rgba(131,110,249,0.25)]"
                />
              )}

              <motion.span
                whileTap={{ scale: 0.82 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="relative"
              >
                <Icon
                  size={22}
                  strokeWidth={isSelected ? 2.5 : 1.8}
                  className={isSelected ? "text-[#a99bfc]" : "text-[#f4f1fe]/55"}
                />
                {item.to === "/shop" && !!activity?.points && (
                  <span className="absolute -top-1 -right-2.5 font-mono text-[8px] font-extrabold bg-[#f59e0b] text-black leading-none px-1 py-[2px] rounded-full shadow">
                    {activity.points > 99 ? "99+" : activity.points}
                  </span>
                )}
              </motion.span>

              <span
                className={`relative text-[9px] font-bold tracking-tight transition-colors duration-150 ${
                  isSelected ? "text-[#f4f1fe]" : "text-[#f4f1fe]/55"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
