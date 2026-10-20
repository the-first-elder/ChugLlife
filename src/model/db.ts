/*
  DB.ts

  This file defines the local database schema for our app. Any time we show any
  data in the UI, it should come from the database.
*/

import Dexie from "dexie";

export interface Conversation {
  id?: number;
  topic: string;
  title: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  peerAddress: string;
  peerInboxId?: string;
}

export interface Message {
  id?: number;
  inReplyToID: string;
  conversationTopic: string;
  xmtpID: string;
  senderAddress: string;
  sentByMe: boolean;
  sentAt: Date;
  contentType: {
    authorityId: string;
    typeId: string;
    versionMajor: number;
    versionMinor: number;
  };
  content: unknown;
  metadata?: { [key: string]: [value: string] };
  isSending: boolean;
}

export interface MessageAttachment {
  id?: number;
  messageID: number;
  filename: string;
  mimeType: string;
  data: Uint8Array;
}

export interface MessageReaction {
  id?: number;
  reactor: string;
  messageXMTPID: string;
  name: string;
}

export interface ReadReceipt {
  peerAddress: string;
  timestamp: string;
}

export interface ChogNft {
  /** composite key: <contractAddress>-<tokenId> */
  key: string;
  contractAddress: string;
  tokenId: string;
  name: string;
  image: string;
  description: string;
  traits: { traitType: string; value: string }[];
  fetchedAt: Date;
}

/** Per-identity activity + Chuglife economy ledger (address-keyed). */
export interface Activity {
  /** wallet address / identity key, lowercase */
  key: string;
  /** shop balance (points) */
  points: number;
  /** lifetime chat points */
  chatPoints: number;
  /** lifetime presence points */
  presencePoints: number;
  /** total minutes spent online */
  onlineMinutes: number;
  /** total messages sent */
  messageCount: number;
  /** last productive heartbeat, dedupes within a minute */
  lastPresenceAt: number;
  /** 2x points-for-an-hour power-up from the Shop */
  turboUntil?: number;
  /** room creation capacity (1 by default; raised via Shop packs) */
  roomSlots: number;
  /** Shop item ids this identity owns (cosmetics, badges, packs…) */
  ownedItems?: string[];
  /** one-time starter grant claimed (demo identities start funded) */
  claimedGrant?: boolean;
  purchasedAt: Date;
}

/** A user-created chat room (XMTP group with Chuglife moderation data). */
export interface Room {
  /** XMTP group id (conversation topic) */
  topic: string;
  name: string;
  emoji: string;
  description: string;
  /** creator address */
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  /** archived (deleted) rooms stay out of lists */
  archived: boolean;
  /** words chog police can enforce in this room */
  mutedWords?: string[];
}

export interface RoomRole {
  /** <topic>-<address> */
  key: string;
  topic: string;
  address: string;
  role: "admin" | "chog-police";
  assignedAt: Date;
}

export interface RoomBan {
  /** <topic>-<address> */
  key: string;
  topic: string;
  address: string;
  bannedBy: string;
  bannedAt: Date;
}

export interface RoomMute {
  key: string;
  topic: string;
  address: string;
  mutedBy: string;
  mutedUntil?: number;
}

/**
 * Demo mode runs on a fully separate local database. Chats, points, rooms and
 * shop purchases made in demo never touch the wallet's real session — mode
 * switches reload the page so `db` re-opens under the right name.
 */
export const DEMO_KEY_STORAGE = "_chugDemoPrivateKey";

export function dbModeName(): string {
  try {
    return localStorage.getItem(DEMO_KEY_STORAGE) ? "DB-demo" : "DB";
  } catch {
    return "DB";
  }
}

class DB extends Dexie {
  conversations!: Dexie.Table<Conversation, number>;
  messages!: Dexie.Table<Message, number>;
  attachments!: Dexie.Table<MessageAttachment, number>;
  reactions!: Dexie.Table<MessageReaction, number>;
  readReceipts!: Dexie.Table<ReadReceipt, string>;
  chogs!: Dexie.Table<ChogNft, string>;
  activity!: Dexie.Table<Activity, string>;
  rooms!: Dexie.Table<Room, string>;
  roomRoles!: Dexie.Table<RoomRole, string>;
  roomBans!: Dexie.Table<RoomBan, string>;
  roomMutes!: Dexie.Table<RoomMute, string>;

  constructor() {
    super(dbModeName());
    this.version(2).stores({
      conversations: `
        ++id,
        topic,
        title,
        createdAt,
        updatedAt,
        peerAddress
        `,
      messages: `
        ++id,
        [conversationTopic+inReplyToID],
        inReplyToID,
        conversationTopic,
        xmtpID,
        senderAddress,
        sentByMe,
        sentAt,
        contentType,
        content
        `,
      attachments: `
        ++id,
        messageID,
        filename,
        mimeType,
        data
      `,
      reactions: `
        ++id,
        [messageXMTPID+reactor+name],
        messageXMTPID,
        reactor,
        name
      `,
      readReceipts: `
       ++peerAddress,
       timestamp
    `,
    });
    this.version(3).stores({
      conversations: `
        ++id,
        topic,
        title,
        createdAt,
        updatedAt,
        peerAddress
        `,
      messages: `
        ++id,
        [conversationTopic+inReplyToID],
        inReplyToID,
        conversationTopic,
        xmtpID,
        senderAddress,
        sentByMe,
        sentAt,
        contentType,
        content
      `,
      attachments: `
        ++id,
        messageID,
        filename,
        mimeType,
        data
      `,
      reactions: `
        ++id,
        [messageXMTPID+reactor+name],
        messageXMTPID,
        reactor,
        name
      `,
      readReceipts: `
       ++peerAddress,
       timestamp
    `,
      chogs: `
        key,
        contractAddress,
        tokenId,
        fetchedAt
      `,
    });
    this.version(4).stores({
      activity: `key, points,
        purchasedAt`,
      rooms: `topic, owner, archived, createdAt`,
      roomRoles: `key, topic, address`,
      roomBans: `key, topic, address`,
      roomMutes: `key, topic, address`,
    });

    // v5: add updatedAt index to rooms (RoomsListView sorts by it)
    this.version(5).stores({
      rooms: `topic, owner, archived, createdAt, updatedAt`,
    });

    // v6: activity gains ownedItems / claimedGrant (schemaless fields — no new
    // indexes needed, but bump so old installs upgrade cleanly)
    this.version(6).stores({
      activity: `key, points, purchasedAt`,
    });
  }
}

const db = new DB();
export default db;
