import React, { useEffect, useState } from "react";
import ProfileCard from "./components/ProfileCard";
import CollectionGrid from "./components/CollectionGrid";
import { useAccount } from "wagmi";
import { getOwnedChogs } from "../../model/chog";
import type { ChogNft } from "../../model/db";
import { useClient } from "../../hooks/useClient";

const Collections: React.FC = () => {
  const { address } = useAccount();
  const client = useClient();
  const [chogs, setChogs] = useState<ChogNft[] | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setChogs(null);
      setError(undefined);
      try {
        const owned = await getOwnedChogs(address);
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
  }, [address, client]);

  return (
    <main className="justify-center my-8 px-4 sm:px-10 text-[#f4f1fe] max-w-6xl mx-auto pb-16">
      <div className="flex gap-6 max-md:flex-col">
        <aside className="flex flex-col w-full md:w-80 shrink-0">
          <ProfileCard address={address} chogs={chogs} error={error} />
        </aside>
        <section className="flex flex-col grow">
          <div className="flex flex-col justify-center self-stretch">
            <h1 className="text-xl font-extrabold mb-4 text-[#f4f1fe] flex items-center gap-2">
              <span>🐸</span> My Chogs
            </h1>
            <CollectionGrid chogs={chogs} loading={chogs === null && !error} error={error} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Collections;
