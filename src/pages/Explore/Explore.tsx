import React, { useEffect, useState } from "react";
import ChogImage from "../../components/ChogImage";
import { Link } from "react-router-dom";
import { Spinner } from "@nextui-org/react";
import { LucideCompass } from "lucide-react";
import {
  chogHolderList,
  chogHolderWithMetadata,
  chogScanUrl,
} from "../../model/chog-portal";
import { CHOG_NFT_ADDRESS } from "../../util/monad";
import { useAccount } from "wagmi";

interface HolderCard {
  address: string;
  tokenId: string;
  image: string;
  name: string;
  keyTrait?: string;
}

const Explore = () => {
  const { address } = useAccount();
  const [holders, setHolders] = useState<HolderCard[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [traitFilter] = useState<string>("All");

  const traitBuckets = ["All", "Origin", "Aqua", "Frogtown", "Night", "Crayon"];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(undefined);
      try {
        const list = (await chogHolderList()).filter(
          (h) => h.address !== address?.toLowerCase()
        );
        // Show 16 random holders; metadata comes from cache so this is cheap
        const shuffled = list.sort(() => Math.random() - 0.5).slice(0, 16);
        const cards: HolderCard[] = [];
        for (const holder of shuffled) {
          try {
            const enriched = await chogHolderWithMetadata(holder);
            if (cancelled) return;
            const bg = enriched.chog.traits.find(
              (t) => t.traitType === "Background"
            );
            cards.push({
              address: enriched.address,
              tokenId: enriched.tokenId,
              image: enriched.chog.image,
              name: enriched.chog.name,
              keyTrait: bg?.value,
            });
          } catch {
            // skip
          }
        }
        if (!cancelled) setHolders(cards);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="text-[#f4f1fe] min-h-[60vh] pb-16">
      <div className="bg-[#141026] py-10 text-center text-[#f4f1fe] border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#836ef9]/20 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center justify-center gap-2 relative z-10">
          <LucideCompass className="text-[#836ef9]" /> Explore the Chog World Order
        </h1>
        <p className="text-[#f4f1fe]/60 text-sm mt-2 relative z-10">
          Every Chog holder on Monad is a potential chugmate.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-48 shrink-0">
          <h2 className="mb-3 font-bold text-sm text-[#f4f1fe]/80 uppercase tracking-wider font-mono">Background</h2>
          <div className="flex md:flex-col flex-wrap gap-2">
            {traitBuckets.map((t) => (
              <button
                key={t}
                disabled
                className={`text-left text-xs font-semibold px-3 py-2 rounded-xl transition ${
                  traitFilter === t
                    ? "bg-[#836ef9] text-white shadow-chog-sm"
                    : "bg-[#161228] text-[#f4f1fe]/60 border border-white/10 hover:border-[#836ef9]/30"
                }`}
                title="Filters light up once holder metadata is scanned"
              >
                {t}
              </button>
            ))}
            <a
              className="text-xs text-[#836ef9] hover:text-[#9d8dfc] underline mt-3 font-mono block"
              href={`https://monadscan.com/nft/${CHOG_NFT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              full collection →
            </a>
          </div>
        </div>

        <div className="grow">
          {holders === null && !error ? (
            <div className="w-fit mx-auto pt-16 text-center">
              <Spinner size="lg" color="secondary" />
              <p className="text-xs text-[#f4f1fe]/50 text-center mt-4 font-mono">
                Scanning Chog holders…
              </p>
            </div>
          ) : error ? (
            <div className="bg-[#161228] border border-red-500/20 rounded-2xl shadow-chog-sm p-6 max-w-lg mx-auto text-center">
              <p className="text-red-400 text-sm font-bold">
                Holder discovery unavailable
              </p>
              <p className="text-xs text-[#f4f1fe]/60 mt-1 whitespace-pre-wrap">
                {error}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" data-testid="explore-grid">
              {holders?.map((card) => (
                <div
                  key={`${card.address}-${card.tokenId}`}
                  className="bg-[#161228] rounded-2xl overflow-hidden shadow-chog-sm border border-white/10 hover:-translate-y-0.5 hover:border-[#836ef9]/40 hover:shadow-chog transition-all flex flex-col"
                >
                  <div className="aspect-square bg-[#141026] overflow-hidden">
                    <ChogImage
                      image={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex flex-col grow">
                    <h3 className="font-bold text-sm text-[#f4f1fe] truncate">{card.name}</h3>
                    {card.keyTrait && (
                      <p className="text-[10px] text-[#f4f1fe]/50">
                        {card.keyTrait} background
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                      <a
                        href={chogScanUrl(card.tokenId)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#f4f1fe]/50 hover:text-[#836ef9] font-mono"
                        title={card.address}
                      >
                        {card.address.slice(0, 6)}…{card.address.slice(-4)}
                      </a>
                      <Link
                        to={`/new/${card.address}`}
                        className="bg-[#836ef9] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#9d8dfc] transition"
                      >
                        Chat
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
