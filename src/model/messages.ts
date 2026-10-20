import { Client as XmtpClient, DecodedMessage } from "@xmtp/browser-sdk";
import db, { Conversation, Message } from "./db";
import { Mutex } from "async-mutex";
import { creditMessage } from "./activity";
import {
  clientAddress,
  getXMTPConversation,
  memberAddresses,
  getXMTPGroup,
  updateConversationTimestamp,
} from "./conversations";
import { applyReactionLike } from "./message-helpers";

export type XmtpMessage = DecodedMessage<unknown>;

const messageMutex = new Mutex();

const TEXT_KIND = { authorityId: "", typeId: "text", versionMajor: 1, versionMinor: 0 };
const REPLY_KIND = { authorityId: "", typeId: "reply", versionMajor: 1, versionMinor: 0 };
const REACTION_KIND = { authorityId: "", typeId: "reaction", versionMajor: 1, versionMinor: 0 };
const OTHER_KIND = { authorityId: "", typeId: "unknown", versionMajor: 1, versionMinor: 0 };

function isMe(senderInboxId: string, conversation: Conversation, client: XmtpClient): boolean {
  return senderInboxId === client.inboxId;
}

/**
 * Persists an incoming (or own streamed) message.
 */
export async function saveMessageFromNetwork(
  client: XmtpClient,
  conversation: Conversation,
  decodedMessage: XmtpMessage
): Promise<void> {
  await messageMutex.runExclusive(async () => {
    const existing = await db.messages
      .where("xmtpID")
      .equals(decodedMessage.id)
      .first();

    if (existing) return;

    const typeId = decodedMessage.contentType.typeId;
    const sentByMe = isMe(decodedMessage.senderInboxId, conversation, client);
    let senderAddress = sentByMe
      ? clientAddress(client)
      : conversation.peerAddress;
    if (!sentByMe && !senderAddress) {
      // room chat: resolve the human behind this senderInboxId
      try {
        const group = await getXMTPGroup(client, conversation);
        const members = await memberAddresses(group);
        senderAddress =
          members.find((m) => m.inboxId === decodedMessage.senderInboxId)
            ?.address ?? "";
      } catch {
        senderAddress = "";
      }
    }

    const contentType =
      typeId === "text"
        ? TEXT_KIND
        : typeId === "reply"
          ? REPLY_KIND
          : typeId === "reaction"
            ? REACTION_KIND
            : OTHER_KIND;

    let content: unknown;

    switch (typeId) {
      case "text": {
        content = decodedMessage.content as string;
        break;
      }
      case "reply": {
        const reply = decodedMessage.content as {
          referenceId?: string;
          content?: unknown;
        };
        content = {
          content: (reply?.content as string) ?? "",
          contentTypeId: "text",
        };
        break;
      }
      case "reaction": {
        const reaction = decodedMessage.content as {
          action: number;
          content: string;
          reference: string;
        };
        const action = reaction.action === 2 ? "removed" : "added";
        content = {
          action,
          reference: reaction.reference,
          name: reaction.content,
        };
        // Reactions apply immediately
        await applyReactionLike(action, {
          reactor: sentByMe ? clientAddress(client) : conversation.peerAddress,
          name: reaction.content,
          messageXMTPID: reaction.reference,
        });
        break;
      }
      default:
        // group updates / read receipts etc. are not displayed today
        return;
    }

    const message: Message = {
      conversationTopic: decodedMessage.conversationId,
      inReplyToID:
        typeId === "reply"
          ? ((decodedMessage.content as { referenceId?: string })
              .referenceId ?? "")
          : "",
      xmtpID: decodedMessage.id,
      senderAddress,
      sentByMe,
      sentAt: decodedMessage.sentAt,
      contentType,
      content,
      isSending: false,
    };

    message.id = await db.messages.add(message);
  });

  await updateConversationTimestamp(
    decodedMessage.conversationId,
    decodedMessage.sentAt
  );
}


/** Insert an optimistic "sending" message row; publish in the background. */
export function sendMessage(
  client: XmtpClient,
  conversation: Conversation,
  content: string
): Message {
  const message: Message = {
    conversationTopic: conversation.topic,
    inReplyToID: "",
    xmtpID: "PENDING-" + Date.now(),
    senderAddress: clientAddress(client),
    sentByMe: true,
    sentAt: new Date(),
    contentType: TEXT_KIND,
    content,
    isSending: true,
  };

  (async () => {
    message.id = await messageMutex.runExclusive(async () =>
      db.messages.add(message)
    );
    const pendingId = message.id;

    try {
      const xmtpConversation = await getXMTPConversation(client, conversation);
      const sentId = await xmtpConversation.sendText(content);
      await messageMutex.runExclusive(async () => {
        // The live stream may have already persisted this message — if so,
        // drop our optimistic row instead of duplicating it.
        const streamed = await db.messages
          .where("xmtpID")
          .equals(sentId)
          .first();
        if (streamed && streamed.id !== message.id) {
          await db.messages.delete(pendingId);
        } else {
          await db.messages.update(pendingId, {
            xmtpID: sentId,
            isSending: false,
            sentAt: new Date(),
          });
        }
      });
      await updateConversationTimestamp(conversation.topic, new Date());
      await creditMessage(clientAddress(client));
    } catch (e) {
      console.error("failed to send message", e);
      await db.messages.update(message.id, { isSending: false });
      throw e;
    }
  })();

  return message;
}

export { TEXT_KIND, REPLY_KIND, REACTION_KIND };
