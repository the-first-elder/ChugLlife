import { ReactElement, useState } from "react";
import { Message, MessageReaction } from "../model/db";
import { useReactions } from "../hooks/useReactions";
import { addReaction, removeReaction } from "../model/reactions";
import { useClient } from "../hooks/useClient";
import { clientAddress } from "../model/conversations";
import classNames from "classnames";
import { LucideThumbsUp } from "lucide-react";

const defaultReactions = ["👍", "👎", "🎉", "❤️", "🐸"] as const;

type ReactionEmoji = (typeof defaultReactions)[number];

function ReactionView({
  myAddress,
  name,
  reactions,
  onAdd,
  onRemove,
}: {
  myAddress: string;
  name: ReactionEmoji;
  reactions: MessageReaction[];
  onAdd: () => void;
  onRemove: () => void;
}): ReactElement {
  const currentUserReacted = reactions
    .map((reaction) => reaction.reactor)
    .includes(myAddress);

  function onClick() {
    if (currentUserReacted) {
      onRemove();
    } else {
      onAdd();
    }
  }

  return (
    <button
      onClick={onClick}
      className={classNames(
        "py-0.5 px-2 border border-chog-mauve/40 rounded-full text-xs text-chog-ink",
        {
          "bg-chog-pink text-white border-chog-pink": currentUserReacted,
        }
      )}
    >
      {name} {reactions.length}
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

  const reactionsByName = reactions.reduce((acc, curr) => {
    if (acc[curr.name]) {
      acc[curr.name]?.push(curr);
    } else {
      acc[curr.name] = [curr];
    }
    return acc;
  }, {} as { [name: string]: MessageReaction[] });

  return (
    <div className="flex space-x-1.5">
      {(Object.keys(reactionsByName) as string[]).map((name) => (
        <ReactionView
          key={name}
          name={name as ReactionEmoji}
          reactions={reactionsByName[name] ?? []}
          myAddress={myAddress}
          onAdd={() => addReaction(name, message, client)}
          onRemove={() => removeReaction(name, message, client)}
        />
      ))}

      {isReacting ? (
        <div className="space-x-1.5">
          {defaultReactions.map((emoji) => {
            if (reactionsByName[emoji]) return null;
            return (
              <button
                onClick={() => {
                  addReaction(emoji, message, client);
                  setIsReacting(false);
                }}
                key={emoji}
                className="py-0.5 px-2 border border-chog-mauve/40 rounded-full text-xs"
              >
                {emoji}
              </button>
            );
          })}

          <button
            className="text-xs text-chog-ink/50"
            onClick={() => setIsReacting(false)}
          >
            cancel
          </button>
        </div>
      ) : (
        <button
          className="text-[10px] text-chog-ink/40 hover:text-chog-pink transition"
          onClick={() => setIsReacting(true)}
          title="React"
        >
          <LucideThumbsUp size={12} strokeWidth={4} />
        </button>
      )}
    </div>
  );
}
