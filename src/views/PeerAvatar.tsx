import { ReactElement, useEffect, useState } from "react";
import { CHOG_NFT_ADDRESS, ipfsUrl } from "../util/monad";
import { getChog } from "../model/chog";

/**
 * Shows the peer's Chog as an avatar when the holder cache is already
 * available (never triggers the holders fetch itself).
 */
export default function PeerAvatar({
  address,
  size = 40,
}: {
  address?: string;
  size?: number;
}): ReactElement {
  const [src, setSrc] = useState<string | undefined>();

  useEffect(() => {
    if (!address) return;

    let cancelled = false;
    (async () => {
      try {
        const cached = localStorage.getItem("chogOwnersV2");
        if (!cached) return;
        const owners = JSON.parse(cached) as Record<string, string>;
        const tokenId = Object.entries(owners).find(
          ([, owner]) => owner === address.toLowerCase()
        )?.[0];
        if (!tokenId) return;

        const chog = await getChog(CHOG_NFT_ADDRESS, tokenId);
        if (!cancelled && chog.image) setSrc(ipfsUrl(chog.image));
      } catch {
        // never let an avatar break chat
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div
      className="rounded-full overflow-hidden bg-chog-mauve/30 shrink-0 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size }}
      title={address ? `Chog holder ${address}` : "Chogmate"}
    >
      {src ? <img src={src} className="object-cover w-full h-full" alt="Chog avatar" /> : "🐸"}
    </div>
  );
}
