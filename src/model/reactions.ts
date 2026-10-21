import { Client as XmtpClient, ReactionSchema } from "@xmtp/browser-sdk";
import { Message } from "./db";
import { findConversation, getXMTPConversation } from "./conversations";
import { Mutex } from "async-mutex";
import { clientAddress } from "./conversations";
import { applyReactionLike } from "./message-helpers";

const reactionMutex = new Mutex();

function applyLocal(
  action: "added" | "removed",
  reactionName: string,
  message: Message,
  address: string
): Promise<void> {
  return reactionMutex.runExclusive(() =>
    applyReactionLike(action, {
      reactor: address,
      name: reactionName,
      messageXMTPID: message.xmtpID,
    })
  );
}

export async function addReaction(
  reactionName: string,
  message: Message,
  client: XmtpClient | null
) {
  if (!client) return;
  const address = clientAddress(client);

  // Optimistic first — the pill sticks immediately even if the network send
  // is slow (or fails); the processor dedupes on the composite key.
  await applyLocal("added", reactionName, message, address);

  const conversation = await findConversation(message.conversationTopic);
  if (!conversation) return;

  const xmtpConversation = await getXMTPConversation(client, conversation);
  // Emoji content ⇒ Unicode schema (2 = Shortcode, which broke cross-client decode)
  await xmtpConversation.sendReaction({
    action: 1,
    reference: message.xmtpID,
    referenceInboxId: "",
    content: reactionName,
    schema: ReactionSchema.Unicode,
  } as never);
}

export async function removeReaction(
  reactionName: string,
  message: Message,
  client: XmtpClient | null
) {
  if (!client) return;
  const address = clientAddress(client);

  await applyLocal("removed", reactionName, message, address);

  const conversation = await findConversation(message.conversationTopic);
  if (!conversation) return;

  const xmtpConversation = await getXMTPConversation(client, conversation);
  await xmtpConversation.sendReaction({
    action: 2,
    reference: message.xmtpID,
    referenceInboxId: "",
    content: reactionName,
    schema: ReactionSchema.Unicode,
  } as never);
}
