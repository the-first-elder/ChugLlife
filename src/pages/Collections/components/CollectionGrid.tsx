import React from "react";
import ChogImage from "../../../components/ChogImage";
import { CollectionGridProps } from "../types";
import Skeleton from "../../../components/Skeleton";

/** Compact trait chip shared by every chog card. */
const TRAIT_CHIP_CLS =
  "rounded-full border border-[#836ef9]/25 bg-[#836ef9]/15 px-1.5 py-0.5 font-mono text-[9px] text-[#a99bfc]";

const CollectionGrid: React.FC<CollectionGridProps> = ({
  chogs,
  loading,
  error,
}) => {
  return (
    <div className="flex flex-col justify-center pt-2 pb-7">
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl">
              <Skeleton className="aspect-square !rounded-none" rounded="" />
              <div className="p-3 bg-[#161228] border border-t-0 border-white/10 rounded-b-3xl">
                <Skeleton className="h-3.5 w-3/4" rounded="rounded-full" />
                <Skeleton className="h-3 w-1/2 mt-2" rounded="rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error === "none" ? (
        <div className="cl-empty cl-fade-in text-sm text-[#f4f1fe]/60">
          No Chogs retrieved. Grab a Chog Genesis to unlock matching 🫤
        </div>
      ) : error ? (
        <div className="cl-card border-red-500/30 p-6 text-center text-sm text-red-400 whitespace-pre-wrap">
          {error}
        </div>
      ) : (
        <div
          className="cl-stagger grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-testid="collections-grid"
        >
          {chogs?.map((item) => (
            <div
              key={item.tokenId}
              className="group cl-card overflow-hidden flex flex-col transition duration-200 hover:-translate-y-1 hover:border-[#836ef9]/40 hover:shadow-chog"
            >
              <div className="aspect-square bg-[#141026] overflow-hidden">
                <ChogImage
                  image={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3 flex flex-col grow">
                <h3 className="font-bold text-sm text-[#f4f1fe] truncate">{item.name}</h3>
                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {item.traits.slice(0, 3).map((t) => (
                    <span
                      key={t.traitType}
                      className={TRAIT_CHIP_CLS}
                      title={`${t.traitType}: ${t.value}`}
                    >
                      {t.value}
                    </span>
                  ))}
                  {item.traits.length > 3 && (
                    <span className="text-[9px] text-[#f4f1fe]/40 px-1 py-0.5 font-mono">
                      +{item.traits.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionGrid;
