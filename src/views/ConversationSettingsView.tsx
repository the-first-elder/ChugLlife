import { ReactElement } from "react";
import { Conversation } from "../model/db";
import { XyzTransition } from "@animxyz/react";
import PeerAvatar from "./PeerAvatar";
import { CHOG_NFT_ADDRESS } from "../util/monad";

export default function ConversationSettingsView({
  conversation,
}: {
  conversation: Conversation;
  dismiss: () => void;
}): ReactElement {
  return (
    <XyzTransition appear xyz="fade up-1 ease-out">
      <div className="mt-2 space-y-2 text-xs pl-12 text-[#f4f1fe]/80">
        <h3 className="font-bold text-[#f4f1fe]">Conversation Info</h3>
        <div className="flex items-center gap-2">
          <PeerAvatar address={conversation.peerAddress} size={28} />
          <span>
            Secure 1:1 XMTP chat with{" "}
            <span className="font-mono text-[#836ef9]">{conversation.peerAddress}</span>
          </span>
        </div>
        <p>
          Their Chog:{" "}
          <a
            className="underline text-[#836ef9] hover:text-[#9d8dfc]"
            href={`https://monadscan.com/nft/${CHOG_NFT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
          >
            check their collection on MonadScan
          </a>
        </p>
      </div>
    </XyzTransition>
  );
}
