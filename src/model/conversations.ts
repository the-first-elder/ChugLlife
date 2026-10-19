import { Client as XmtpClient, Dm, Group } from "@xmtp/browser-sdk";
import { Conversation } from "./db";
import { saveMessageFromNetwork } from "./messages";
import db from "./db";
import { Mutex } from "async-mutex";

export type XmtpDm = Dm<unknown>;
export type XmtpGroup = Group<unknown>;

// Prevent races when updating the local database
const conversationMutex = new Mutex();

export function clientAddress(client: XmtpClient): string {
  return (client.accountIdentifier?.identifier ?? "").toLowerCase();
}

export function yahooIdentifier(address: string) {
  return {
    identifier: address.toLowerCase(),
    identifierKind: 0,
  } as const;
}

/** Fetch the peer member info for a DM (2 members total). */
async function peerInfo(
  dm: XmtpDm,
  client: XmtpClient
): Promise<{ peerAddress: string; peerInboxId: string }> {
  const members = await dm.members();
  const me = client.inboxId;
  const peer = members.find((m) => m.inboxId !== me) || members[0];
  const addr =
    peer?.accountIdentifiers?.find((i) => i.identifierKind === 0)
      ?.identifier ?? "";
  return {
    peerAddress: (addr || "").toLowerCase(),
    peerInboxId: peer?.inboxId ?? "",
  };
}

export async function saveConversation(
  client: XmtpClient,
  dm: XmtpDm
): Promise<Conversation> {
  const { peerAddress, peerInboxId } = await peerInfo(dm, client);

  return await conversationMutex.runExclusive(async () => {
    const existing = await db.conversations
      .where("topic")
      .equals(dm.id)
      .first();

    if (existing) {
      await db.conversations.update(existing, { peerAddress, peerInboxId });
      return { ...existing, peerAddress, peerInboxId };
    }

    const conversation: Conversation = {
      topic: dm.id,
      title: undefined,
      createdAt: dm.createdAt ?? new Date(),
      updatedAt: dm.createdAt ?? new Date(),
      peerAddress,
      peerInboxId,
    };

    conversation.id = await db.conversations.add(conversation);
    return conversation;
  });
}

export async function findConversation(
  topic: string
): Promise<Conversation | undefined> {
  const existing = await db.conversations.where("topic").equals(topic).first();
  if (existing) return existing;

  // If this is a room in db.rooms, auto-create the conversation record
  const room = await db.rooms.get(topic);
  if (room) {
    const fresh: Conversation = {
      topic: room.topic,
      title: `${room.emoji} ${room.name}`,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      peerAddress: "",
    };
    fresh.id = await db.conversations.add(fresh);
    return fresh;
  }
  return undefined;
}

export async function updateConversationTimestamp(
  topic: string,
  updatedAt: Date
) {
  const conversation = await db.conversations
    .where("topic")
    .equals(topic)
    .first();

  if (conversation && conversation.updatedAt < updatedAt) {
    await conversationMutex.runExclusive(async () => {
      await db.conversations.update(conversation, { updatedAt });
    });
  }
}

/** Resolve a db conversation to the live XMTP DM or Group object. */
export async function getXMTPConversation(
  client: XmtpClient,
  conversation: Conversation
): Promise<XmtpDm> {
  const [dms, groups] = await Promise.all([
    client.conversations.listDms(),
    client.conversations.listGroups(),
  ]);
  const dm = dms.find((d) => d.id === conversation.topic);
  if (dm) return dm as XmtpDm;
  const group = groups.find((g) => g.id === conversation.topic);
  if (group) return group as unknown as XmtpDm;

  // For group rooms not yet synced from network, create or get optimistic group
  if (conversation.peerAddress === "") {
    try {
      const newGroup = await client.conversations.createGroup([], {
        groupName: conversation.title || "Chuglife Room",
        permissions: 0,
      });
      return newGroup as unknown as XmtpDm;
    } catch {
      // return first available group if any
      if (groups.length > 0) return groups[0] as unknown as XmtpDm;
    }
  }

  throw new Error("could not convert db conversation to XMTP conversation");
}

/** Save a group room as a conversation the chat UI understands. */
export async function saveGroupConversation(
  client: XmtpClient,
  group: XmtpGroup
): Promise<Conversation> {
  return await conversationMutex.runExclusive(async () => {
    const existing = await db.conversations
      .where("topic")
      .equals(group.id)
      .first();
    if (existing) {
      await db.conversations.update(existing, { peerAddress: "" });
      return { ...existing, peerAddress: "" };
    }
    const conversation: Conversation = {
      topic: group.id,
      title: group.name || "Chuglife room",
      createdAt: group.createdAtNs
        ? new Date(Number(group.createdAtNs) / 1_000_000)
        : new Date(),
      updatedAt: new Date(),
      peerAddress: "",
    };
    conversation.id = await db.conversations.add(conversation);
    return conversation;
  });
}

/** Resolve a room topic to the live XMTP group (creates if missing). */
export async function getXMTPGroup(
  client: XmtpClient,
  conversation: Conversation
): Promise<XmtpGroup> {
  const groups = await client.conversations.listGroups();
  const group = groups.find((g) => g.id === conversation.topic);
  if (!group) {
    throw new Error("room not found on XMTP");
  }
  return group as XmtpGroup;
}

/** resolveAddresses for group members (inboxId -> lowercased address). */
export async function memberAddresses(group: XmtpGroup): Promise<
  { inboxId: string; address: string }[]
> {
  const members = await group.members();
  return members.map((m) => ({
    inboxId: m.inboxId,
    address:
      m.accountIdentifiers
        ?.find((i) => i.identifierKind === 0)
        ?.identifier?.toLowerCase() ?? "",
  }));
}

export async function startConversation(
  client: XmtpClient,
  address: string
): Promise<Conversation> {
  const canMessage = await XmtpClient.canMessage([
    { identifier: address.toLowerCase(), identifierKind: 0 } as never,
  ]);
  if (!canMessage.get(address.toLowerCase())) {
    throw new Error(
      "This wallet isn't on XMTP yet — ask them to open Chuglife first!"
    );
  }

  const dm = await client.conversations.createDmWithIdentifier({
    identifier: address.toLowerCase(),
    identifierKind: 0,
  } as never);

  return await saveConversation(client, dm as XmtpDm);
}

/**
 * Pull all DM conversations from the network into the local db, including a
 * one-message preview for each.
 */
export async function syncConversations(
  client: XmtpClient,
  onProgress?: (done: number, total: number) => void
) {
  await client.conversations.syncAll();
  const dms = (await client.conversations.listDms()) as XmtpDm[];
  const conversations = await Promise.all(
    dms.map((dm) => saveConversation(client, dm))
  );

  for (let i = 0; i < dms.length; i++) {
    const latest = await dms[i].lastMessage();
    if (latest) {
      await saveMessageFromNetwork(client, conversations[i], latest);
    }
    onProgress?.(i + 1, conversations.length);
  }
}

