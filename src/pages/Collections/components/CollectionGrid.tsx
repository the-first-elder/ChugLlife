import React from "react";
import ChogImage from "../../../components/ChogImage";
import { CollectionGridProps } from "../types";
import { Spinner } from "@nextui-org/react";

const CollectionGrid: React.FC<CollectionGridProps> = ({
  chogs,
  loading,
  error,
}) => {
  return (
    <div className="flex flex-col justify-center pt-2 pb-7">
      {loading ? (
        <div className="w-fit mx-auto pt-10 text-center">
          <Spinner size="lg" color="secondary" />
          <p className="text-center text-xs mt-4 text-[#f4f1fe]/50 font-mono">
            Loading your Chogs from Monad…
          </p>
        </div>
      ) : error === "none" ? (
        <div className="text-center text-sm pt-10 text-[#f4f1fe]/60 bg-[#161228] p-8 rounded-2xl border border-white/10">
          <p>No Chogs retrieved. Grab a Chog Genesis to unlock matching 🫤</p>
        </div>
      ) : error ? (
        <div className="text-center text-sm pt-10 text-red-400 whitespace-pre-wrap">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" data-testid="collections-grid">
          {chogs?.map((item) => (
            <div
              key={item.tokenId}
              className="bg-[#161228] rounded-2xl overflow-hidden border border-white/10 hover:border-[#836ef9]/40 transition shadow-chog-sm flex flex-col"
            >
              <div className="aspect-square bg-[#141026] overflow-hidden">
                <ChogImage
                  image={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-[#f4f1fe] truncate">{item.name}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.traits.map((t) => (
                    <span
                      key={t.traitType}
                      className="text-[9px] bg-[#836ef9]/15 text-[#a99bfc] border border-[#836ef9]/25 px-1.5 py-0.5 rounded-full"
                      title={`${t.traitType}: ${t.value}`}
                    >
                      {t.value}
                    </span>
                  ))}
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
