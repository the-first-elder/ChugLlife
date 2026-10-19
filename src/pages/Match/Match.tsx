import { useEffect, useState } from "react";
import ChogImage from "../../components/ChogImage";
import { Link } from "react-router-dom";
import { Spinner } from "@nextui-org/react";
import { useAccount } from "wagmi";
import { getOwnedChogs } from "../../model/chog";
import { demoChogList } from "../../model/chog-portal";
import type { ChogNft } from "../../model/db";
import { useClientStatus } from "../../hooks/useClient";
import { LucideHeartHandshake } from "lucide-react";
import { chogScanUrl } from "../../model/chog-portal";

const Match: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { isDemo } = useClientStatus();
  const [chogs, setChogs] = useState<ChogNft[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
    <div className="text-[#f4f1fe] max-w-6xl mx-auto p-4 pt-8 min-h-[60vh]">
      <div className="flex items-center gap-3 justify-center mb-2">
        <LucideHeartHandshake className="text-[#836ef9]" size={28} />
        <h1 className="text-2xl font-extrabold text-center tracking-tight">Chog Vibe Match</h1>
      </div>
      <p className="text-center text-[#f4f1fe]/70 text-sm max-w-lg mx-auto">
        Pick one of your Chogs. We'll find other Chog Genesis holders whose
        traits vibe with yours — shared eyes, skins, jerseys — sorted by match
        strength.
      </p>

      {needsWallet && (
        <div className="mt-10 bg-[#161228] border border-white/10 rounded-2xl shadow-chog p-8 max-w-md mx-auto text-center">
          <span className="text-3xl">🐸</span>
          <p className="font-bold mt-2 text-[#f4f1fe]">Connect your Monad wallet</p>
          <p className="text-sm text-[#f4f1fe]/60 mt-1">
            Or hit "Try the Chuglife demo" from the sign-in screen to explore
            with sample data.
          </p>
        </div>
      )}

      {!needsWallet && chogs === null && !error && (
        <div className="w-fit mx-auto mt-16 text-center">
          <Spinner size="lg" color="secondary" />
          <p className="text-center text-xs mt-4 text-[#f4f1fe]/50 font-mono">
            Reading your Chogs from Monad…
          </p>
        </div>
      )}

      {error && error !== "none" && (
        <div className="mt-10 bg-[#161228] border border-red-500/20 rounded-2xl shadow-chog-sm p-6 max-w-lg mx-auto text-center">
          <p className="text-red-400 text-sm font-bold">
            Couldn't read your Chogs
          </p>
          <p className="text-xs text-[#f4f1fe]/60 mt-1 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {error === "none" && (
        <div className="mt-10 bg-[#161228] border border-white/10 rounded-2xl shadow-chog-sm p-6 max-w-lg mx-auto text-center">
          <p className="font-bold text-[#f4f1fe]">No Chogs in this wallet 🫤</p>
          <p className="text-sm text-[#f4f1fe]/60 mt-2">
            Chuglife matches <a href={chogScanUrl("")} className="underline text-[#836ef9] font-bold">Chog Genesis</a> holders.
            Grab one on <a href="https://magiceden.io/chains/monad" target="_blank" rel="noreferrer" className="underline text-[#836ef9] font-bold">Magic Eden</a> (Monad),
            connect that wallet, or use the demo.
          </p>
        </div>
      )}

      {chogs && chogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8" data-testid="my-chogs-grid">
          {chogs.map((chog) => (
            <Link
              to={`/match/${chog.tokenId}`}
              key={chog.tokenId}
              className="group bg-[#161228] rounded-2xl overflow-hidden shadow-chog-sm hover:shadow-chog transition-all hover:-translate-y-0.5 border border-white/10 hover:border-[#836ef9]/50"
            >
              <div className="aspect-square bg-[#141026] flex items-center justify-center overflow-hidden">
                <ChogImage
                  image={chog.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={chog.name}
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate text-[#f4f1fe]">{chog.name}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {chog.traits.slice(0, 3).map((t) => (
                    <span
                      key={t.traitType}
                      className="text-[9px] bg-[#836ef9]/15 text-[#a99bfc] border border-[#836ef9]/30 px-1.5 py-0.5 rounded-full"
                      title={`${t.traitType}: ${t.value}`}
                    >
                      {t.value}
                    </span>
                  ))}
                  {chog.traits.length > 3 && (
                    <span className="text-[9px] text-[#f4f1fe]/40 px-1 py-0.5">
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
