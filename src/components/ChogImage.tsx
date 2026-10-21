import { ReactElement, useState } from "react";
import { ipfsGateways } from "../util/monad";

interface ChogImageProps {
  image: string;
  alt?: string;
  className?: string;
}

/**
 * IPFS image with gateway failover (filebase -> pinata -> 4everland).
 */
export default function ChogImage({
  image,
  alt = "",
  className,
}: ChogImageProps): ReactElement {
  const [idx, setIdx] = useState(0);
  const candidates = ipfsGateways(image);
  if (!candidates.length) {
    return <div className={className} />;
  }
  return (
    <img
      src={candidates[idx]}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => {
        if (idx < candidates.length - 1) {
          setIdx(idx + 1);
        }
      }}
    />
  );
}
