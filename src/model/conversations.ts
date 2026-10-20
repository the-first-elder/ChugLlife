import {
  Client as XmtpClient,
  Dm,
  Group,
  IdentifierKind,
} from "@xmtp/browser-sdk";
import { Conversation } from "./db";
import { saveMessageFromNetwork } from "./messages";
import db from "./db";
import { Mutex } from "async-mutex";
import { isAddress } from "viem";

export type XmtpDm = Dm<unknown>;
export type XmtpGroup = Group<unknown>;

// Prevent races when updating the local database
const conversationMutex = new Mutex();
// Serialize DM creation: two concurrent createDm calls on the same client can
// trap the underlying wasm module ("memory access out of bounds").
const dmMutex = new Mutex();

/**
 * Groups we know exist on XMTP, keyed by topic (group id). listGroups() can
 * lag behind createGroup(); without this cache every fallback lookup used to
 * spawn a duplicate group.
 */
const groupCache = new Map<string, XmtpGroup>();

/** Remember a live group so lookups never re-create it. */
export function registerGroup(group: XmtpGroup) {
  groupCache.set(group.id, group);
}

export function clientAddress(client: XmtpClient): string {
  return (client.accountIdentifier?.identifier ?? "").toLowerCase();
}

export function yahooIdentifier(address: string) {
  return {
    identifier: address.toLowerCase(),
    identifierKind: IdentifierKind.Ethereum,
  };
}

/** The XMTP wasm module trapped — the in-memory client can't recover. */
const WASM_TRAP_MESSAGE =
  "Chuglife's chat engine hit a glitch and needs a fresh start. Reload the page (keep just one Choglife tab open) and try again.";

function isWasmTrap(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /memory access out of bounds|RuntimeError|unreachable executed|out of bounds|use after free/i.test(
    msg
  );
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
  if (!room) return undefined;

  // Guarded so concurrent callers don't insert duplicate rows
  return await conversationMutex.runExclusive(async () => {
    const raced = await db.conversations.where("topic").equals(topic).first();
    if (raced) return raced;

    const fresh: Conversation = {
      topic: room.topic,
      title: `${room.emoji} ${room.name}`,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      peerAddress: "",
    };
    fresh.id = await db.conversations.add(fresh);
    return fresh;
  });
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
  // 1) Groups we created / saw this session — always authoritative
  const cached = groupCache.get(conversation.topic);
  if (cached) return cached as unknown as XmtpDm;

  const [dms, groups] = await Promise.all([
    client.conversations.listDms(),
    client.conversations.listGroups(),
  ]);
  const dm = dms.find((d) => d.id === conversation.topic);
  if (dm) return dm as XmtpDm;
  const group = groups.find((g) => g.id === conversation.topic);
  if (group) {
    registerGroup(group as XmtpGroup);
    return group as unknown as XmtpDm;
  }

  // 2) One network sync + retry before giving up. Never optimistically
  //    createGroup() here — that used to duplicate rooms on every send.
  if (conversation.peerAddress === "") {
    await client.conversations.sync();
    const refreshed = (await client.conversations.listGroups()).find(
      (g) => g.id === conversation.topic
    );
    if (refreshed) {
      registerGroup(refreshed as XmtpGroup);
      return refreshed as unknown as XmtpDm;
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
      registerGroup(group);
      return { ...existing, peerAddress: "" };
    }
    registerGroup(group);
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
  const cached = groupCache.get(conversation.topic);
  if (cached) return cached;
  const groups = await client.conversations.listGroups();
  const group = groups.find((g) => g.id === conversation.topic);
  if (!group) {
    throw new Error("room not found on XMTP");
  }
  registerGroup(group as XmtpGroup);
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
  const target = address.trim().toLowerCase();
  if (!isAddress(target, { strict: false })) {
    throw new Error(
      "That doesn't look like a wallet address — paste the full 0x… address."
    );
  }
  if (target === clientAddress(client)) {
    throw new Error("That's your own address, chog — pick someone else.");
  }

  return dmMutex.runExclusive(async () => {
    try {
      const canMessage = await XmtpClient.canMessage([
        { identifier: target, identifierKind: IdentifierKind.Ethereum },
      ]);
      if (!canMessage.get(target)) {
        throw new Error(
          "This wallet isn't on XMTP yet — ask them to open Chuglife first!"
        );
      }

      const dm = await client.conversations.createDmWithIdentifier({
        identifier: target,
        identifierKind: IdentifierKind.Ethereum,
      });

      return await saveConversation(client, dm as XmtpDm);
    } catch (e) {
      if (isWasmTrap(e)) throw new Error(WASM_TRAP_MESSAGE);
      throw e;
    }
  });
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

