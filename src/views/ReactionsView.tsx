import { ReactElement, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Message, MessageReaction } from "../model/db";
import db from "../model/db";
import { useReactions } from "../hooks/useReactions";
import { addReaction, removeReaction } from "../model/reactions";
import { useClient } from "../hooks/useClient";
import { clientAddress } from "../model/conversations";
import { ownsItem } from "../model/activity";
import { sfx } from "../util/sfx";
import { LucideSmilePlus } from "lucide-react";

const defaultReactions = ["👍", "❤️", "🎉", "🐸", "😂"] as const;
/** Unlocked by the Chog Reaction Pack in the Shop. */
const megaReactions = ["🚀", "💎", "🔥", "👑", "🐸"] as const;

function ReactionPill({
  myAddress,
  name,
  reactions,
  onAdd,
  onRemove,
}: {
  myAddress: string;
  name: string;
  reactions: MessageReaction[];
  onAdd: () => void;
  onRemove: () => void;
}): ReactElement {
  const mine = reactions.map((r) => r.reactor).includes(myAddress);

  return (
    <button
      type="button"
      onClick={() => {
        sfx.react();
        mine ? onRemove() : onAdd();
      }}
      aria-pressed={mine}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] font-bold leading-none transition active:scale-90 ${
        mine
          ? "border-[#836ef9]/60 bg-[#836ef9]/20 text-[#f4f1fe]"
          : "border-white/10 bg-black/25 text-[#f4f1fe]/70 hover:border-[#836ef9]/40 hover:bg-black/40"
      }`}
      title={mine ? "Remove your reaction" : "Add reaction"}
    >
      <span className="text-[12px]">{name}</span>
      <span className="tabular-nums opacity-80">{reactions.length}</span>
    </button>
  );
}

export default function ReactionsView({
  message,
}: {
  message: Message;
}): ReactElement {
  const client = useClient();
  const myAddress = client ? clientAddress(client) : "";
  const reactions = useReactions(message) || [];
  const [isReacting, setIsReacting] = useState(false);

  const myActivity = useLiveQuery(
    () => (myAddress ? db.activity.get(myAddress) : undefined),
    [myAddress]
  );
  const picker = ownsItem(myActivity, "mega-reactions")
    ? [...defaultReactions, ...megaReactions]
    : defaultReactions;

  const reactionsByName = reactions.reduce((acc, curr) => {
    if (acc[curr.name]) {
      acc[curr.name]?.push(curr);
    } else {
      acc[curr.name] = [curr];
    }
    return acc;
  }, {} as { [name: string]: MessageReaction[] });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {(Object.keys(reactionsByName) as string[]).map((name) => (
        <ReactionPill
          key={name}
          name={name}
          reactions={reactionsByName[name] ?? []}
          myAddress={myAddress}
          onAdd={() => addReaction(name, message, client)}
          onRemove={() => removeReaction(name, message, client)}
        />
      ))}

      {isReacting ? (
        <div className="cl-pop flex items-center gap-1.5 rounded-full border border-[#836ef9]/30 bg-[#0d0d13] px-2 py-1">
          {picker.map((emoji) => {
            if (reactionsByName[emoji]) return null;
            return (
              <button
                type="button"
                key={emoji}
                onClick={() => {
                  sfx.react();
                  addReaction(emoji as string, message, client);
                  setIsReacting(false);
                }}
                className="text-[16px] leading-none transition hover:scale-125 active:scale-95"
                aria-label={`React ${emoji}`}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsReacting(true)}
          className="inline-flex items-center gap-1 rounded-full border border-transparent px-1.5 py-[3px] text-[11px] font-bold text-[#f4f1fe]/45 transition hover:border-[#836ef9]/30 hover:bg-[#836ef9]/10 hover:text-[#836ef9]"
          title="Add a reaction"
          aria-label="Add a reaction"
        >
          <LucideSmilePlus size={13} />
        </button>
      )}
    </div>
  );
}
