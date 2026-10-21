import { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header";
import { Footer } from "./Footer";
import BottomNav from "./BottomNav";

/** Marketing/entry screens (landing, sign-in) don't get the in-app tab bar. */
const ENTRY_ROUTES = ["/", "/login"];

/** Standard app shell: header, animated page outlet, footer (landing only), mobile tab bar. */
export default function AppShell(): ReactElement {
  const location = useLocation();
  const isEntry = ENTRY_ROUTES.includes(location.pathname);

  return (
    <>
      <Header />
      {/* Cross-fade (no mode="wait") — the new page animates in while the old
          one leaves, so navigation never blocks on an exit animation. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.1, ease: "easeOut" } }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      {/* Footer is marketing chrome — landing page only, never inside the app */}
      {location.pathname === "/" && <Footer bottomInset={false} />}
      {!isEntry && <BottomNav />}
    </>
  );
}

/** Chat shell: header + conversation only — no footer/tab bar. */
export function ChatShell(): ReactElement {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
