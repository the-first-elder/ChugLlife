import db from "./db";
import { Room, RoomBan, RoomRole } from "./db";
import { getActivity } from "./activity";
import { saveGroupConversation } from "./conversations";
import type { Client } from "@xmtp/browser-sdk";

export type { Room };

export async function getRoom(topic: string): Promise<Room | undefined> {
  return db.rooms.get(topic);
}

export const STARTER_ROOMS: Omit<Room, "createdAt" | "updatedAt">[] = [
  {
    topic: "room-pond-alpha",
    name: "The Frog Pond",
    emoji: "🐸",
    description: "Official community pond. Hang out, say gm, discuss Chogs and vibe.",
    owner: "0x0000000000000000000000000000000000000001",
    archived: false,
    mutedWords: ["scam", "rug", "drainer"],
  },
  {
    topic: "room-monad-lounge",
    name: "Monad Speed Lounge",
    emoji: "⚡",
    description: "10,000 TPS chit-chat. Monad ecosystem alpha, testnet chatter, and devs.",
    owner: "0x0000000000000000000000000000000000000002",
    archived: false,
    mutedWords: ["fud", "exploit"],
  },
  {
    topic: "room-vibe-dating",
    name: "Chog Dating & Traits",
    emoji: "🔥",
    description: "Looking for your match? Compare eyes, jerseys, and find your chogmate.",
    owner: "0x0000000000000000000000000000000000000003",
    archived: false,
  },
];

export async function ensureStarterRooms(): Promise<void> {
  const count = await db.rooms.count();
  if (count === 0) {
    const now = new Date();
    for (const r of STARTER_ROOMS) {
      await db.rooms.put({
        ...r,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

export async function listRooms(ownedBy?: string): Promise<Room[]> {
  await ensureStarterRooms();
  return db.rooms
    .filter(
      (r) => !r.archived && (ownedBy === undefined || r.owner === ownedBy)
    )
    .toArray();
}

export interface CreateRoomSpec {
  name: string;
  emoji: string;
  description: string;
}

export async function createRoom(
  client: Client,
  address: string,
  spec: CreateRoomSpec
): Promise<Room> {
  const activity = await getActivity(address);

  const owned = await db.rooms
    .where("owner")
    .equals(address)
    .filter((r) => !r.archived)
    .count();
  if (owned >= activity.roomSlots) {
    throw new Error(
      `Room cap reached (${owned}/${activity.roomSlots}). Buy more capacity in the Shop.`
    );
  }

  const group = await client.conversations.createGroup([], {
    groupName: `${spec.emoji} ${spec.name}`,
    groupDescription: spec.description,
    permissions: 0,
  });
  await group.sync();

  const now = new Date();
  const room: Room = {
    topic: group.id,
    name: spec.name,
    emoji: spec.emoji,
    description: spec.description,
    owner: address,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };
  await db.rooms.put(room);
  await saveGroupConversation(client, group);
  return room;
}

/* ---------- roles & moderation ---------- */

export function roleKey(topic: string, address: string) {
  return `${topic}-${address}`;
}

export async function assignChogPolice(
  topic: string,
  owner: Room["owner"],
  target: string
): Promise<void> {
  const room = await getRoom(topic);
  if (!room) throw new Error("Room not found");
  if (room.owner !== owner)
    throw new Error("Only the room owner can assign chog police");
  if (target === owner) throw new Error("You're already the boss of this room");

  const role: RoomRole = {
    key: roleKey(topic, target),
    topic,
    address: target,
    role: "chog-police",
    assignedAt: new Date(),
  };
  await db.roomRoles.put(role);
}

export async function revokeChogPolice(topic: string, target: string) {
  await db.roomRoles.delete(roleKey(topic, target));
}

export async function rolesFor(topic: string): Promise<RoomRole[]> {
  return db.roomRoles.where("topic").equals(topic).toArray();
}

export async function isChogPolice(topic: string, address: string) {
  return db.roomRoles.get(roleKey(topic, address)) !== undefined;
}

export async function banUser(
  topic: string,
  by: string,
  target: string
): Promise<RoomBan> {
  const ban: RoomBan = {
    key: roleKey(topic, target),
    topic,
    address: target,
    bannedBy: by,
    bannedAt: new Date(),
  };
  await db.roomBans.put(ban);
  return ban;
}

export async function unbanUser(topic: string, target: string) {
  await db.roomBans.delete(roleKey(topic, target));
}

export async function bansFor(topic: string): Promise<RoomBan[]> {
  return db.roomBans.where("topic").equals(topic).toArray();
}

export async function isBanned(topic: string, address: string) {
  return (await db.roomBans.get(roleKey(topic, address))) !== undefined;
}

/* ---------- word filter ---------- */

export interface RoomPolicy {
  mutedWords: string[];
  roles: RoomRole[];
  bans: RoomBan[];
}

export async function mutedWordsFor(topic: string): Promise<string[]> {
  const list = await db.rooms.get(topic);
  return list?.mutedWords ?? [];
}

export async function setMutedWords(topic: string, words: string[]) {
  await db.rooms.update(topic, { mutedWords: words });
}

export async function checkMutedWords(
  topic: string,
  text: string
): Promise<string[]> {
  const words = await mutedWordsFor(topic);
  const lower = text.toLowerCase();
  return words.filter((w) => w && lower.includes(w.toLowerCase()));
}

export async function archiveRoom(topic: string, by: string) {
  const room = await getRoom(topic);
  if (!room) throw new Error("Room not found");
  if (room.owner !== by) throw new Error("Only the room owner can delete it");
  await db.rooms.update(topic, {
    archived: true,
    updatedAt: new Date(),
  });
  await db.roomRoles.where("topic").equals(topic).delete();
  await db.roomBans.where("topic").equals(topic).delete();
  await db.roomMutes.where("topic").equals(topic).delete();
}

