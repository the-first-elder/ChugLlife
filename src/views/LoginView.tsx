import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientStatus } from "../hooks/useClient";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LucideChogIcon } from "../components/ChogIcons";
import { useAccount } from "wagmi";
import {
  LucideAlertCircle,
  LucideRefreshCw,
  LucideShieldCheck,
  LucideWallet,
  LucidePenLine,
  LucideMessagesSquare,
  LucideZap,
  LucideLock,
} from "lucide-react";
import { shortAddress } from "../util/shortAddress";

const STEPS = [
  {
    icon: LucideWallet,
    title: "Connect wallet",
    desc: "Your Chog NFT is your identity",
  },
  {
    icon: LucidePenLine,
    title: "Sign once with XMTP",
    desc: "One signature activates your inbox",
  },
  {
    icon: LucideMessagesSquare,
    title: "Start chatting",
    desc: "Match, hang out, climb ranks",
  },
];

const PERKS = [
  { icon: LucideLock, label: "End-to-end encrypted" },
  { icon: LucideZap, label: "Gas-free messages" },
  { icon: LucideShieldCheck, label: "Chog Genesis only" },
];

export default function LoginView(): ReactElement {
  const { client, startDemo, status, error, retryConnect } = useClientStatus();
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (client) navigate("/conversations");
  }, [client, navigate]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 bg-[#000000]">
      <div className="cl-card cl-card-glow p-6 sm:p-10 max-w-lg w-full text-[#f4f1fe]">
        {/* Ambient glow spots */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#836ef9]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-12 w-64 h-64 bg-[#5ce68a]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 cl-stagger">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#836ef9] to-[#a99bfc] text-white flex items-center justify-center shadow-chog text-2xl">
              🐸
            </span>
            <div>
              <span className="cl-chip !rounded-full !text-[#5ce68a] !bg-[#5ce68a]/10 !border-[#5ce68a]/20 !font-bold">
                Chogathon 2026
              </span>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight mt-1.5">
                Chuglife
              </h1>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-lg font-bold text-[#f4f1fe]/90 leading-snug mt-6">
            Match Chogs. Chat in Rooms. Rise through the Ranks.
          </h2>

          {/* Description */}
          <p className="text-sm text-[#f4f1fe]/60 mt-2.5 leading-relaxed">
            Your Chog NFT is your identity on Monad. Chuglife lets you vibe-match with other holders, hang out in moderated community chat rooms, and climb from Hatchling to Legendary on the activity rank ladder.
          </p>

          {/* 3-step visual */}
          <div className="mt-6 space-y-2.5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="cl-card-flat flex items-center gap-3 px-3.5 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#836ef9]/15 border border-[#836ef9]/30 text-[#a99bfc]">
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#f4f1fe]">
                      <span className="font-mono text-[#836ef9] mr-1.5">
                        {i + 1}.
                      </span>
                      {s.title}
                    </div>
                    <div className="text-[10px] text-[#f4f1fe]/50 truncate">
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Perks */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PERKS.map((p) => {
              const Icon = p.icon;
              return (
                <span key={p.label} className="cl-chip">
                  <Icon size={12} className="text-[#5ce68a]" />
                  {p.label}
                </span>
              );
            })}
          </div>

          {/* Connection Error Banner — distinct, not alarming */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-2xl bg-red-500/[0.07] border border-red-400/25 px-4 py-3.5 text-red-100/90 text-xs flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-2.5">
                <LucideAlertCircle size={16} className="text-red-300/90 shrink-0 mt-0.5" />
                <span className="grow break-words leading-relaxed">{error}</span>
              </div>
              <button
                type="button"
                onClick={retryConnect}
                className="cl-btn cl-btn-ghost cl-btn-sm self-end !text-red-100 !border-red-400/30 hover:!bg-red-500/15"
              >
                <LucideRefreshCw size={12} /> Retry XMTP Sign-In
              </button>
            </div>
          )}

          {/* Wallet Connected prompt if connected but XMTP needs activation */}
          {isConnected && address && !client && status !== "connecting" && (
            <div className="cl-card-flat mt-5 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <LucideShieldCheck size={18} className="text-[#5ce68a] shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[#f4f1fe] text-xs">Wallet Connected</div>
                  <div className="font-mono text-[10px] text-[#f4f1fe]/55">
                    {shortAddress(address)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={retryConnect}
                className="cl-btn cl-btn-ghost cl-btn-sm shrink-0 !text-[#a99bfc] !border-[#836ef9]/40"
              >
                Sign into XMTP
              </button>
            </div>
          )}

          {/* Sign-in CTAs */}
          <div className="mt-7 space-y-4">
            <div className="connect-button flex justify-center" data-testid="connect-wallet-wrapper">
              <ConnectButton />
            </div>

            <div className="flex items-center gap-3 text-[#f4f1fe]/30 text-xs font-mono">
              <span className="flex-1 border-t border-[rgba(244,241,254,0.12)]" />
              OR
              <span className="flex-1 border-t border-[rgba(244,241,254,0.12)]" />
            </div>

            <button
              type="button"
              data-testid="start-demo"
              className="cl-btn cl-btn-primary cl-btn-md w-full cl-pulse-ring"
              onClick={() => {
                setStarting(true);
                startDemo();
              }}
            >
              <LucideChogIcon size={18} />
              {starting ? "Getting choggy…" : "Try the Chuglife demo"}
            </button>
            <p className="text-center text-[10px] font-mono text-[#f4f1fe]/40 -mt-1.5">
              no wallet needed · instant demo identity
            </p>
          </div>

          {/* Trust footer */}
          <div className="mt-7 pt-4 border-t border-[rgba(244,241,254,0.08)] flex items-center justify-between text-[11px] text-[#f4f1fe]/40 font-mono">
            <span>🛡️ End-to-end encrypted via XMTP</span>
            <span>⚡ Gas-free offchain chat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
