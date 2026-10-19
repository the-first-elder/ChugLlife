import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useClientStatus } from "../hooks/useClient";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LucideChogIcon } from "../components/ChogIcons";
import { useAccount } from "wagmi";
import { LucideAlertCircle, LucideRefreshCw, LucideShieldCheck } from "lucide-react";
import { shortAddress } from "../util/shortAddress";

export default function LoginView(): ReactElement {
  const { client, startDemo, status, error, retryConnect } = useClientStatus();
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (client) navigate("/conversations");
  }, [client, navigate]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 bg-[#0e0b1a]">
      <div className="bg-[#161228] border border-[rgba(244,241,254,0.12)] rounded-3xl shadow-chog-lg p-6 sm:p-10 max-w-lg w-full text-[#f4f1fe] relative overflow-hidden">
        {/* Ambient glow spots */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#836ef9]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-12 w-64 h-64 bg-[#5ce68a]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#836ef9] to-[#a99bfc] text-white flex items-center justify-center shadow-chog text-2xl">
              🐸
            </span>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5ce68a] bg-[#5ce68a]/10 px-2 py-0.5 rounded-full border border-[#5ce68a]/20">
                Chogathon 2026
              </span>
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight mt-1">
                Chuglife
              </h1>
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#f4f1fe]/90 leading-snug">
            Match Chogs. Chat in Rooms. Rise through the Ranks.
          </h2>

          <p className="text-xs text-[#f4f1fe]/60 mt-2.5 leading-relaxed">
            Your Chog NFT is your identity on Monad. Chuglife lets you vibe-match with other holders, hang out in moderated community chat rooms, and rank up from Hatchling to Legendary by chatting & staying active.
          </p>

          {/* Connection Error Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <LucideAlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span className="grow break-words">{error}</span>
              </div>
              <button
                type="button"
                onClick={retryConnect}
                className="self-end inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 font-bold text-[11px] transition"
              >
                <LucideRefreshCw size={12} /> Retry XMTP Sign-In
              </button>
            </div>
          )}

          {/* Wallet Connected prompt if connected but XMTP needs activation */}
          {isConnected && address && !client && status !== "connecting" && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#836ef9]/10 border border-[#836ef9]/30 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LucideShieldCheck size={18} className="text-[#5ce68a]" />
                <div>
                  <div className="font-bold text-[#f4f1fe]">Wallet Connected</div>
                  <div className="font-mono text-[10px] text-[#f4f1fe]/60">
                    {shortAddress(address)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={retryConnect}
                className="px-3 py-1.5 rounded-xl bg-[#836ef9] hover:bg-[#9d8dfc] text-white font-bold text-xs transition shadow-chog-sm"
              >
                Sign into XMTP
              </button>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="connect-button flex justify-center" data-testid="connect-wallet-wrapper">
              <ConnectButton />
            </div>

            <div className="flex items-center gap-3 text-[#f4f1fe]/30 text-xs font-mono">
              <span className="flex-1 border-t border-[rgba(244,241,254,0.12)]" />
              OR
              <span className="flex-1 border-t border-[rgba(244,241,254,0.12)]" />
            </div>

            <Button
              type="button"
              testId="start-demo"
              className="!w-full !bg-[#1e183a] !border !border-[#836ef9]/40 hover:!bg-[#836ef9]/20 !text-[#f4f1fe] !shadow-chog-sm"
              onClick={() => {
                setStarting(true);
                startDemo();
              }}
            >
              <span className="flex items-center justify-center gap-2 font-bold">
                <LucideChogIcon size={18} />
                {starting ? "Getting choggy…" : "Try the Chuglife demo"}
              </span>
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(244,241,254,0.08)] flex items-center justify-between text-[11px] text-[#f4f1fe]/40">
            <span>🛡️ End-to-end encrypted via XMTP</span>
            <span>⚡ Gas-free offchain chat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
