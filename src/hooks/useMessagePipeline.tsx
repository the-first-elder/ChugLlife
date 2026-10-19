import { useEffect, useState } from "react";
import { Client as XmtpClient, Dm, Group } from "@xmtp/browser-sdk";
import { Conversation } from "../model/db";
import {
  saveConversation,
  saveGroupConversation,
  XmtpDm,
  XmtpGroup,
} from "../model/conversations";
import {
  saveMessageFromNetwork,
  XmtpMessage,
} from "../model/messages";
import db from "../model/db";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Boots the messaging pipeline for a client:
 *  - initial sync of all DMs + previews
 *  - live conversation discovery
 *  - global live message stream into the Dexie db
 */
export function useMessagePipeline(client: XmtpClient | null) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!client) return;
    setReady(false);

    const closers: (() => void)[] = [];

    (async () => {
      try {
        await client.conversations.syncAll();

        // Live conversation discovery
        const conversationStream = await client.conversations.streamDms({
          onValue: async (conversation) => {
            const dm = conversation as Dm<unknown>;
            await saveConversation(client, dm as XmtpDm);
          },
          onError: (e) => console.error("conversation stream error", e),
        });
        closers.push(() => conversationStream.return());

        // Live room (group) discovery
        const groupStream = await client.conversations.streamGroups({
          onValue: async (conversation) => {
            const group = conversation as Group<unknown>;
            await saveGroupConversation(client, group as XmtpGroup);
          },
          onError: (e) => console.error("group stream error", e),
        });
        closers.push(() => groupStream.return());

        // Live messages for every DM
        const messageStream = await client.conversations.streamAllMessages({
          conversationType: "dm" as never,
          consentStates: [1, 0] as never, // Allowed, Unknown
          onValue: async (message) => {
            const conversation =
              await db.conversations
                .where("topic")
                .equals((message as { conversationId: string }).conversationId)
                .first();
            if (!conversation) {
              console.warn(
                "message for unknown conversation",
                (message as { conversationId: string }).conversationId
              );
              return;
            }
            await saveMessageFromNetwork(
              client,
              conversation,
              message as XmtpMessage
            );
          },
          onError: (e) => console.error("message stream error", e),
        });
        closers.push(() => messageStream.return());

        // Live messages for every room
        const groupMessageStream = await client.conversations.streamAllMessages({
          conversationType: "group" as never,
          consentStates: [1, 0] as never,
          onValue: async (message) => {
            const topic = (message as { conversationId: string }).conversationId;
            const conversation = await db.conversations
              .where("topic")
              .equals(topic)
              .first();
            if (!conversation) {
              console.warn("message for unknown room", topic);
              return;
            }
            await saveMessageFromNetwork(
              client,
              conversation,
              message as XmtpMessage
            );
          },
          onError: (e) => console.error("room message stream error", e),
        });
        closers.push(() => groupMessageStream.return());
      } catch (e) {
        console.error("pipeline boot failed", e);
      }
    })();

    return () => {
      closers.forEach((c) => c());
    };
  }, [client]);

  return ready;
}

/**
 * Live list of conversations straight from the db.
 */
export function useConversations(client: XmtpClient | null): Conversation[] {
  useMessagePipeline(client);

  return (
    useLiveQuery(async () => {
      return await db.conversations.reverse().sortBy("updatedAt");
    }) || []
  );
}
