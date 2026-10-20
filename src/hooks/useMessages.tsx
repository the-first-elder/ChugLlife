import { useEffect } from "react";
import { useClient } from "./useClient";
import { getXMTPConversation } from "../model/conversations";
import { saveMessageFromNetwork, XmtpMessage } from "../model/messages";
import { XmtpDm } from "../model/conversations";
import db, { Conversation, Message } from "../model/db";
import { useLiveQuery } from "dexie-react-hooks";
import { liveQuery } from "dexie";
import { sfx } from "../util/sfx";

/**
 * Messages of a conversation: loaded from the network on mount, then live.
 */
export function useMessages(conversation: Conversation): Message[] | undefined {
  const client = useClient();

  // Soft ping whenever someone else lands a message in this thread
  useEffect(() => {
    const seen = new Set<string>();
    let primed = false;
    const sub = liveQuery(async () =>
      db.messages
        .where("[conversationTopic+inReplyToID]")
        .equals([conversation.topic, ""])
        .toArray()
    ).subscribe((msgs) => {
      if (!msgs) return;
      for (const m of msgs) {
        if (seen.has(m.xmtpID)) continue;
        seen.add(m.xmtpID);
        if (primed && !m.sentByMe && !m.isSending) sfx.receive();
      }
      primed = true;
    });
    return () => sub.unsubscribe();
  }, [conversation.topic]);

  useEffect(() => {
    if (!client) return;

    let cancelled = false;
    (async () => {
      try {
        const dm: XmtpDm = await getXMTPConversation(client, conversation);
        await dm.sync();

        const messages = await dm.messages();
        for (const message of messages) {
          if (cancelled) return;
          await saveMessageFromNetwork(client, conversation, message as unknown as XmtpMessage);
        }
      } catch (e) {
        console.error("failed to load messages", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, conversation]);

  return useLiveQuery(async () => {
    return await db.messages
      .where("[conversationTopic+inReplyToID]")
      .equals([conversation.topic, ""])
      .sortBy("sentAt");
  }, [conversation?.topic, conversation]);
}
