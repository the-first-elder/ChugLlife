import React, { useEffect, useMemo, useState } from "react";
import ChogImage from "../../components/ChogImage";
import { Link } from "react-router-dom";
import { Spinner } from "@nextui-org/react";
import { LucideRefreshCw, LucideSearch, LucideX } from "lucide-react";
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
  traits: { traitType: string; value: string }[];
}

/** Trait types worth faceting — skips ultra-rare noise. */
const FACET_TYPES = ["Background", "Eyes", "Skin", "Mouth", "Tier", "Body"];

/** Compact trait chip shared by every chog card. */
const TRAIT_CHIP_CLS =
  "rounded-full border border-[#836ef9]/25 bg-[#836ef9]/15 px-1.5 py-0.5 font-mono text-[9px] text-[#a99bfc]";

const Explore = () => {
  const { address } = useAccount();
  const [holders, setHolders] = useState<HolderCard[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [activeType, setActiveType] = useState<string>("Background");
  const [activeValue, setActiveValue] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setHolders(null);
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
            cards.push({
              address: enriched.address,
              tokenId: enriched.tokenId,
              image: enriched.chog.image,
              name: enriched.chog.name,
              traits: enriched.chog.traits,
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
  }, [address, reloadKey]);

  /** Real facet values derived from the loaded cards for the active trait type. */
  const facetValues = useMemo(() => {
    if (!holders) return [];
    const counts = new Map<string, number>();
    for (const card of holders) {
      const trait = card.traits.find((t) => t.traitType === activeType);
      if (!trait) continue;
      counts.set(trait.value, (counts.get(trait.value) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [holders, activeType]);

  const facetTypes = useMemo(() => {
    if (!holders) return FACET_TYPES;
    const present = new Set(holders.flatMap((c) => c.traits.map((t) => t.traitType)));
    return FACET_TYPES.filter((t) => present.has(t));
  }, [holders]);

  const visible = useMemo(() => {
    if (!holders) return [];
    const q = query.trim().toLowerCase();
    return holders.filter((c) => {
      if (
        activeValue !== "All" &&
        !c.traits.some((t) => t.traitType === activeType && t.value === activeValue)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.tokenId.includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.traits.some(
          (t) =>
            t.value.toLowerCase().includes(q) ||
            t.traitType.toLowerCase().includes(q)
        )
      );
    });
  }, [holders, activeType, activeValue, query]);

  const hasFilters = activeValue !== "All" || query.trim().length > 0;

  return (
    <div className="text-[#f4f1fe] min-h-[60vh] pb-28">
      {/* Search + facets toolbar */}
      <div
        className="sticky z-30 pt-4 pb-3 bg-[#0e0b1a]/85 backdrop-blur-xl border-b border-white/5"
        style={{ top: "calc(3.5rem + env(safe-area-inset-top))" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="flex items-center gap-2">
            <label className="relative flex-1 min-w-0">
              <LucideSearch
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f4f1fe]/35"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, token or trait…"
                className="cl-input w-full !rounded-full pl-10 pr-9 py-2.5 text-[13px]"
                aria-label="Search Chogs"
                autoComplete="off"
              />
              {query  && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#f4f1fe]/40 hover:bg-white/10 hover:text-white transition"
                >
                  <LucideX size={14} />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="cl-btn cl-btn-ghost cl-btn-sm !rounded-full shrink-0 p-2.5"
              title="Shuffle the sample"
              aria-label="Shuffle holders"
            >
              <LucideRefreshCw
                size={15}
                className={holders === null ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar min-w-0">
            {facetTypes.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={activeType === t}
                onClick={() => {
                  setActiveType(t);
                  setActiveValue("All");
                }}
                className={`cl-chip shrink-0 whitespace-nowrap transition ${
                  activeType === t
                    ? "border-[#836ef9]/60 bg-[#836ef9]/15 text-[#f4f1fe]"
                    : "hover:border-[#836ef9]/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {facetValues.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar min-w-0">
              <button
                type="button"
                aria-pressed={activeValue === "All"}
                onClick={() => setActiveValue("All")}
                className="cl-chip shrink-0"
              >
                All
              </button>
              {facetValues.map(([value, count]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={activeValue === value}
                  onClick={() => setActiveValue(value)}
                  className="cl-chip shrink-0 max-w-[120px] sm:max-w-none truncate"
                >
                  {value} <span className="opacity-60">· {count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {holders === null && !error ? (
          <div className="cl-card-flat cl-fade-in w-fit mx-auto px-10 py-10 text-center">
            <Spinner size="lg" color="secondary" />
            <p className="text-xs text-[#f4f1fe]/50 text-center mt-4 font-mono">
              Scanning Chog holders…
            </p>
          </div>
        ) : error ? (
          <div className="cl-card border-red-500/30 p-6 max-w-lg mx-auto text-center">
            <p className="text-red-400 text-sm font-bold">
              Holder discovery unavailable
            </p>
            <p className="text-xs text-[#f4f1fe]/60 mt-1 whitespace-pre-wrap">
              {error}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="cl-btn cl-btn-ghost cl-btn-sm"
              >
                <LucideRefreshCw size={12} /> retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="cl-chip">
                <span className="font-bold text-[#5ce68a]">{visible.length}</span>
                <span>of {holders?.length ?? 0} chogs</span>
                {activeValue !== "All" && (
                  <span className="text-[#a99bfc]">
                    · {activeValue} {activeType.toLowerCase()}
                  </span>
                )}
                {query.trim() && (
                  <span className="text-[#a99bfc]">· “{query.trim()}”</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveValue("All");
                      setQuery("");
                    }}
                    className="cl-btn cl-btn-ghost cl-btn-sm"
                  >
                    <LucideX size={12} /> clear
                  </button>
                )}
                <a
                  className="text-[11px] font-mono text-[#836ef9] hover:text-[#9d8dfc] underline"
                  href={`https://monadscan.com/nft/${CHOG_NFT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  full collection →
                </a>
              </div>
            </div>

            <div
              className="cl-fade-in grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
              data-testid="explore-grid"
            >
              {visible.map((card) => (
                <div
                  key={`${card.address}-${card.tokenId}`}
                  className="group cl-card overflow-hidden flex flex-col transition duration-200 hover:-translate-y-1 hover:border-[#836ef9]/40 hover:shadow-chog"
                >
                  <div className="aspect-square bg-[#141026] overflow-hidden">
                    <ChogImage
                      image={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 flex flex-col grow">
                    <h3 className="font-bold text-sm text-[#f4f1fe] truncate">
                      {card.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {card.traits.slice(0, 3).map((t) => (
                        <span
                          key={t.traitType}
                          className={TRAIT_CHIP_CLS}
                          title={`${t.traitType}: ${t.value}`}
                        >
                          {t.value}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-white/5">
                      <a
                        href={chogScanUrl(card.tokenId)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#f4f1fe]/50 hover:text-[#836ef9] font-mono truncate"
                        title={card.address}
                      >
                        #{card.tokenId} · {card.address.slice(0, 4)}…
                        {card.address.slice(-3)}
                      </a>
                      <Link
                        to={`/new/${card.address}`}
                        className="cl-btn cl-btn-primary cl-btn-sm shrink-0"
                      >
                        Chat
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {visible.length === 0 && (
                <div className="cl-empty col-span-full">
                  <p className="text-sm text-[#f4f1fe]/60">
                    {hasFilters
                      ? "No chogs match those filters."
                      : "No sampled holders available."}
                  </p>
                  {hasFilters && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveValue("All");
                          setQuery("");
                        }}
                        className="cl-btn cl-btn-ghost cl-btn-sm"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
