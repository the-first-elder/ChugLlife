import { Client as XmtpClient } from "@xmtp/browser-sdk";
import { Message } from "./db";
import { findConversation, getXMTPConversation } from "./conversations";
import { Mutex } from "async-mutex";
import { clientAddress } from "./conversations";
import { applyReactionLike } from "./message-helpers";

const reactionMutex = new Mutex();

export async function addReaction(
  reactionName: string,
  message: Message,
  client: XmtpClient | null
) {
  if (!client) return;

  const conversation = await findConversation(message.conversationTopic);
  if (!conversation) return;

  const xmtpConversation = await getXMTPConversation(client, conversation);
  await xmtpConversation.sendReaction({
    action: 1,
    reference: message.xmtpID,
    referenceInboxId: "",
    content: reactionName,
    schema: 2,
  } as never);

  await reactionMutex.runExclusive(async () => {
    await applyReactionLike("added", {
      reactor: clientAddress(client),
      name: reactionName,
      messageXMTPID: message.xmtpID,
    });
  });
}

export async function removeReaction(
  reactionName: string,
  message: Message,
  client: XmtpClient | null
) {
  if (!client) return;

  const conversation = await findConversation(message.conversationTopic);
  if (!conversation) return;

  const xmtpConversation = await getXMTPConversation(client, conversation);
  await xmtpConversation.sendReaction({
    action: 2,
    reference: message.xmtpID,
    referenceInboxId: "",
    content: reactionName,
    schema: 2,
  } as never);

  await reactionMutex.runExclusive(async () => {
    await applyReactionLike("removed", {
      reactor: clientAddress(client),
      name: reactionName,
      messageXMTPID: message.xmtpID,
    });
  });
}
