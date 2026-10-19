import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfileCard from "./components/ProfileCard";
import CollectionGrid from "./components/CollectionGrid";
import { useAccount } from "wagmi";
import { getOwnedChogs } from "../../model/chog";
import { demoChogList } from "../../model/chog-portal";
import type { ChogNft } from "../../model/db";
import { useClient, useClientStatus } from "../../hooks/useClient";
import { clientAddress } from "../../model/conversations";
import { LucideWallet, LucideSparkles } from "lucide-react";

const Collections: React.FC = () => {
  const { address } = useAccount();
  const client = useClient();
  const { isDemo } = useClientStatus();
  const [chogs, setChogs] = useState<ChogNft[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  const connected = isDemo || !!address;
  const myAddress = client ? clientAddress(client) : address;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!connected) {
        setChogs([]);
        setError("none");
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
          if (owned.length === 0) setError("none");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, client, isDemo, connected]);

  return (
    <main className="justify-center my-8 px-4 sm:px-10 text-[#f4f1fe] max-w-6xl mx-auto pb-16">
      <div className="flex gap-6 max-md:flex-col">
        <aside className="flex flex-col w-full md:w-80 shrink-0">
          <ProfileCard address={myAddress} chogs={chogs} error={error} />
        </aside>
        <section className="flex flex-col grow">
          <div className="flex flex-col justify-center self-stretch">
            <h1 className="text-xl font-extrabold mb-4 text-[#f4f1fe] flex items-center gap-2">
              <span>🐸</span> My Chogs
            </h1>
            {!connected ? (
              <div className="text-center text-sm bg-[#161228] p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#836ef9]/15 rounded-full blur-2xl pointer-events-none" />
                <LucideWallet size={30} className="mx-auto text-[#836ef9]" />
                <p className="font-bold text-[#f4f1fe] mt-3">
                  Sign in to see your Chogs
                </p>
                <p className="text-xs text-[#f4f1fe]/55 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Your profile, stats, and vibe identity load from the Chogs
                  held by your wallet.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-2xl bg-[#836ef9] text-white font-bold text-xs shadow-chog-sm hover:bg-[#9d8dfc] active:scale-95 transition"
                >
                  <LucideSparkles size={14} /> Sign in / Try the demo
                </Link>
              </div>
            ) : (
              <CollectionGrid
                chogs={chogs}
                loading={chogs === null && !error}
                error={error}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Collections;
