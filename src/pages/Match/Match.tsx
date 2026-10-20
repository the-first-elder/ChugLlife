import { useEffect, useState } from "react";
import ChogImage from "../../components/ChogImage";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { getOwnedChogs } from "../../model/chog";
import { demoChogList } from "../../model/chog-portal";
import type { ChogNft } from "../../model/db";
import { useClientStatus } from "../../hooks/useClient";
import { LucideHeartHandshake, LucideSparkles, LucideArrowRight } from "lucide-react";
import { chogScanUrl } from "../../model/chog-portal";
import Skeleton from "../../components/Skeleton";
import ChogBackdrop from "../../components/ChogBackdrop";

/** Compact trait chip shared by every chog card. */
const TRAIT_CHIP_CLS =
  "rounded-full border border-[#836ef9]/25 bg-[#836ef9]/15 px-1.5 py-0.5 font-mono text-[9px] text-[#a99bfc]";

const Match: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { isDemo } = useClientStatus();
  const [chogs, setChogs] = useState<ChogNft[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // No wallet and no demo session → nothing to fetch; show the connect CTA only.
      if (!isDemo && !address) {
        setChogs(null);
        setError(undefined);
        return;
      }
      setChogs(null);
      setError(undefined);
      try {
        const owned = isDemo
          ? (await demoChogList()).map((c) => ({
              ...c,
              key: `demo-${c.tokenId}`,
              contractAddress: "demo",
              fetchedAt: new Date(),
            }))
          : await getOwnedChogs(address);
        if (!cancelled) {
          setChogs(owned);
          if (!cancelled && owned.length === 0) setError("none");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, isDemo]);

  const needsWallet = !isConnected && !isDemo;

  return (
    <div className="relative z-10 text-[#f4f1fe] max-w-6xl mx-auto p-4 pt-8 pb-28 min-h-[60vh]">
      <ChogBackdrop seed="match" />
      <header className="cl-fade-in text-center">
        <span className="flex h-12 w-12 items-center justify-center mx-auto mb-4 rounded-2xl border border-[#836ef9]/30 bg-[#836ef9]/15 text-[#836ef9] shadow-chog-sm">
          <LucideHeartHandshake size={24} />
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Chog Vibe Match
        </h1>
        <p className="text-center text-[#f4f1fe]/70 text-sm max-w-lg mx-auto mt-4 leading-relaxed">
          Pick one of your Chogs. We'll find other Chog Genesis holders whose
          traits vibe with yours — shared eyes, skins, jerseys — sorted by match
          strength.
        </p>
        {/* How matching works */}
        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          <span className="cl-chip">
            <LucideSparkles size={12} className="text-[#836ef9]" />
            1 · Pick your Chog
          </span>
          <LucideArrowRight size={12} className="text-[#f4f1fe]/30" />
          <span className="cl-chip">
            <LucideSparkles size={12} className="text-[#5ce68a]" />
            2 · Get vibe matches
          </span>
          <LucideArrowRight size={12} className="text-[#f4f1fe]/30" />
          <span className="cl-chip">
            <LucideSparkles size={12} className="text-[#f59e0b]" />
            3 · Start chatting
          </span>
        </div>
      </header>

      {needsWallet && (
        <div className="cl-card cl-card-glow cl-fade-in mt-8 p-8 max-w-md mx-auto text-center">
          <div className="relative z-10">
            <div className="text-4xl mb-2">🐸</div>
            <p className="font-extrabold text-[#f4f1fe]">
              Connect your Monad wallet
            </p>
            <p className="text-sm text-[#f4f1fe]/60 mt-2 leading-relaxed">
              Sign in with a wallet that holds a Chog Genesis — or explore right
              away with sample data.
            </p>
            <Link to="/login" className="cl-btn cl-btn-primary cl-btn-md mt-4">
              Sign in / Try the demo
            </Link>
          </div>
        </div>
      )}

      {!needsWallet && chogs === null && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl">
              <Skeleton className="aspect-square !rounded-none" rounded="" />
              <div className="p-3 bg-[#0c0c12] border border-t-0 border-white/10 rounded-b-3xl">
                <Skeleton className="h-3.5 w-3/4" rounded="rounded-full" />
                <Skeleton className="h-3 w-1/2 mt-2" rounded="rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && error !== "none" && (
        <div className="cl-card border-red-500/30 p-6 max-w-lg mx-auto text-center mt-8">
          <p className="text-red-400 text-sm font-bold">
            Couldn't read your Chogs
          </p>
          <p className="text-xs text-[#f4f1fe]/60 mt-1 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {error === "none" && !needsWallet && (
        <div className="cl-empty cl-fade-in max-w-lg mx-auto mt-8">
          <div className="text-3xl mb-2">🫤</div>
          <p className="font-extrabold text-[#f4f1fe]">No Chogs in this wallet</p>
          <p className="text-sm text-[#f4f1fe]/60 mt-2 leading-relaxed max-w-sm mx-auto">
            Chuglife matches{" "}
            <a
              href={chogScanUrl("")}
              className="underline text-[#836ef9] font-bold"
            >
              Chog Genesis
            </a>{" "}
            holders. Connect a wallet that holds one, grab one on Magic Eden
            (Monad), or use the demo.
          </p>
          <a
            href="https://magiceden.io/chains/monad"
            target="_blank"
            rel="noreferrer"
            className="cl-btn cl-btn-primary cl-btn-md mt-4"
          >
            Get a Chog on Magic Eden
          </a>
        </div>
      )}

      {chogs && chogs.length > 0 && (
        <div
          className="cl-stagger grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8"
          data-testid="my-chogs-grid"
        >
          {chogs.map((chog) => (
            <Link
              to={`/match/${chog.tokenId}`}
              key={chog.tokenId}
              className="group cl-card overflow-hidden flex flex-col transition duration-200 hover:-translate-y-1 hover:border-[#836ef9]/50 hover:shadow-chog"
            >
              <div className="relative aspect-square bg-[#08080d] flex items-center justify-center overflow-hidden">
                <ChogImage
                  image={chog.image}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  alt={chog.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
                  <span className="cl-chip !bg-[#836ef9]/90 !border-transparent !text-white font-bold">
                    View matches →
                  </span>
                </div>
              </div>
              <div className="p-3 flex flex-col grow">
                <h3 className="font-bold text-sm truncate text-[#f4f1fe]">{chog.name}</h3>
                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {chog.traits.slice(0, 3).map((t) => (
                    <span
                      key={t.traitType}
                      className={TRAIT_CHIP_CLS}
                      title={`${t.traitType}: ${t.value}`}
                    >
                      {t.value}
                    </span>
                  ))}
                  {chog.traits.length > 3 && (
                    <span className="text-[9px] text-[#f4f1fe]/40 px-1 py-0.5 font-mono">
                      +{chog.traits.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Match;
