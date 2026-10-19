import { useEffect, useState } from "react";
import ChogImage from "../../components/ChogImage";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import {
  chogHolderList,
  chogHolderWithMetadata,
  chogScanUrl,
} from "../../model/chog-portal";
import { getChog, vibeBetween, VibeResult } from "../../model/chog";
import { CHOG_NFT_ADDRESS } from "../../util/monad";
import { LucideSparkles } from "lucide-react";

interface MatchCard {
  address: string;
  tokenId: string;
  image: string;
  name: string;
  traits: { traitType: string; value: string }[];
  vibe: VibeResult;
}

const MatchList = () => {
  const { address } = useAccount();
  const { id: tokenId } = useParams();
  const [mine, setMine] = useState<Awaited<ReturnType<typeof getChog>> | null>(null);
  const [cards, setCards] = useState<MatchCard[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCards(null);
      setError(undefined);
      setProgress(0);
      try {
        const myChog = await getChog(CHOG_NFT_ADDRESS, tokenId ?? "1");
        if (cancelled) return;
        setMine(myChog);

        const holders = (await chogHolderList()).filter(
          (h) => h.address !== address?.toLowerCase() && h.tokenId !== tokenId
        );

        // Prefer a random sample so the feed feels fresh
        holders.sort(() => Math.random() - 0.5);
        const sample = holders.slice(0, 36);

        const accumulated: MatchCard[] = [];
        for (const [i, holder] of sample.entries()) {
          try {
            const enriched = await chogHolderWithMetadata(holder);
            if (cancelled) return;
            const vibe = vibeBetween(myChog, enriched.chog);
            accumulated.push({
              address: enriched.address,
              tokenId: enriched.tokenId,
              image: enriched.chog.image,
              name: enriched.chog.name,
              traits: enriched.chog.traits,
              vibe,
            });
          } catch {
            // skipping broken metadata
          }
          setProgress(((i + 1) / sample.length) * 100);
        }
        if (cancelled) return;
        accumulated.sort((a, b) => b.vibe.score - a.vibe.score);
        setCards(accumulated);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenId, address]);

  return (
    <div className="text-[#f4f1fe] max-w-6xl mx-auto p-4 pt-8 pb-28 min-h-[60vh]">
      <h1 className="text-2xl font-extrabold text-center my-6 tracking-tight">
        Chogs who vibe with <span className="text-[#836ef9]">#{tokenId}</span>
      </h1>

      {error && (
        <div className="bg-[#161228] border border-red-500/20 rounded-2xl shadow-chog-sm p-6 max-w-lg mx-auto text-center">
          <p className="text-red-400 text-sm font-bold">Matching unavailable</p>
          <p className="text-xs text-[#f4f1fe]/60 mt-1 whitespace-pre-wrap">{error}</p>
          <p className="text-xs text-[#f4f1fe]/60 mt-2">
            Checking token holders requires a (free) Etherscan API key with
            Monad chain 143 — set <span className="font-mono text-[#836ef9]">VITE_ETHERSCAN_API_KEY</span> in{" "}
            <span className="font-mono text-[#836ef9]">.env</span>, or try the demo data.
          </p>
        </div>
      )}

      {mine && cards === null && !error && (
        <div className="max-w-md mx-auto mt-12">
          <div className="rounded-2xl overflow-hidden shadow-chog-sm bg-[#161228] border border-white/10">
            <ChogImage image={mine.image} alt={mine.name} className="w-full aspect-square object-cover" />
            <div className="p-4">
              <p className="font-bold text-sm text-[#f4f1fe]">{mine.name}</p>
              <div className="h-2 mt-3 bg-[#141026] rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#836ef9] to-[#5ce68a] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                  data-testid="match-progress-bar"
                />
              </div>
              <p className="text-xs text-[#f4f1fe]/50 mt-2 text-center font-mono">
                Scanning Chog holders for vibes… {Math.round(progress)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {cards && cards.length === 0 && (
        <p className="text-center text-[#f4f1fe]/60 mt-10">
          No matches found. Even the chogsters are shy today.
        </p>
      )}

      {cards && cards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6" data-testid="match-cards">
          {cards.map((card) => (
            <div
              key={`${card.address}-${card.tokenId}`}
              className="bg-[#161228] rounded-2xl overflow-hidden shadow-chog-sm border border-white/10 hover:border-[#836ef9]/40 flex flex-col transition"
            >
              <div className="relative aspect-square bg-[#141026]">
                <ChogImage
                  image={card.image}
                  className="w-full aspect-square object-cover"
                  alt={card.name}
                />
                <span
                  className={`absolute top-2 right-2 text-xs font-black px-2 py-1 rounded-full shadow ${
                    card.vibe.score >= 70
                      ? "bg-[#836ef9] text-white"
                      : card.vibe.score >= 40
                        ? "bg-[#5ce68a] text-[#0e0b1a]"
                        : "bg-[#141026] text-[#f4f1fe]/70 border border-white/15"
                  }`}
                  data-testid="vibe-score"
                >
                  <LucideSparkles size={11} className="inline -mt-0.5" /> {card.vibe.score}%
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2 grow">
                <div>
                  <h3 className="font-bold text-sm text-[#f4f1fe]">
                    {card.name} <span className="text-[#f4f1fe]/40">↔ you</span>
                  </h3>
                  <p className="text-[10px] text-[#f4f1fe]/50">{card.vibe.headline}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {card.vibe.shared.slice(0, 4).map((t) => (
                    <span
                      key={t.traitType}
                      className="text-[9px] bg-[#5ce68a]/15 text-[#5ce68a] border border-[#5ce68a]/30 px-1.5 py-0.5 rounded-full"
                      title={`Shared ${t.traitType}: ${t.value}`}
                    >
                      {t.value}
                    </span>
                  ))}
                  {card.vibe.shared.length === 0 && (
                    <span className="text-[9px] text-[#f4f1fe]/40 px-1 py-0.5">
                      no shared traits — chaos match
                    </span>
                  )}
                </div>
                <div className="mt-auto flex gap-2 items-center justify-between pt-2 border-t border-white/5">
                  <a
                    href={chogScanUrl(card.tokenId)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] underline text-[#f4f1fe]/50 hover:text-[#836ef9] font-mono"
                    title={card.address}
                  >
                    {card.address.slice(0, 6)}…{card.address.slice(-4)}
                  </a>
                  <Link
                    to={`/new/${card.address}`}
                    className="bg-[#836ef9] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#9d8dfc] transition"
                  >
                    Chat 🐸
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;
