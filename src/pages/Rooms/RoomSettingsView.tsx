import { ReactElement, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import Button from "../../components/Button";
import { useClient } from "../../hooks/useClient";
import { clientAddress, getXMTPGroup, memberAddresses } from "../../model/conversations";
import {
  archiveRoom,
  assignChogPolice,
  banUser,
  bansFor,
  revokeChogPolice,
  rolesFor,
  setMutedWords,
  unbanUser,
} from "../../model/rooms";
import { LucideShield, LucideTrash } from "lucide-react";

export default function RoomSettingsView(): ReactElement {
  const { topic } = useParams<{ topic: string }>();
  const client = useClient();
  const me = client ? clientAddress(client) : "";
  const room = useLiveQuery(
    () => (topic ? dbRoomGet(topic) : Promise.resolve(undefined)),
    [topic]
  );
  const roles = useLiveQuery(
    () => (topic ? rolesFor(topic) : Promise.resolve([])),
    [topic]
  );
  const bans = useLiveQuery(
    () => (topic ? bansFor(topic) : Promise.resolve([])),
    [topic]
  );
  const [members, setMembers] = useState<string[]>([]);
  const [modError, setModError] = useState<string | undefined>();
  const [words, setWords] = useState<string>("");
  const [addAddress, setAddAddress] = useState<string>("");
  const [savingWords, setSavingWords] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!client || !topic) return;
      const [xmtpRoom, conversation] = await Promise.all([
        dbRoomGet(topic),
        dbConversationsGet(topic),
      ]);
      if (!conversation || !xmtpRoom) return;
      setWords(xmtpRoom.mutedWords?.join(", ") ?? "");
      try {
        const group = await getXMTPGroup(client, conversation);
        const list = await memberAddresses(
          group as unknown as Parameters<typeof memberAddresses>[0]
        );
        if (!cancelled)
          setMembers(list.map((m) => m.address).filter((a) => a && a !== me));
      } catch (e) {
        if (!cancelled) setModError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, topic, me]);

  if (!room) {
    return (
      <div className="text-[#f4f1fe] max-w-2xl mx-auto p-4 pt-8 pb-28">
        <div className="cl-empty">
          <p className="text-lg font-bold text-[#f4f1fe]">Room not found.</p>
          <Link to="/rooms" className="cl-btn cl-btn-ghost cl-btn-sm mt-4 text-[#836ef9]">
            back to rooms
          </Link>
        </div>
      </div>
    );
  }

  if (room.owner !== me) {
    return (
      <div className="text-[#f4f1fe] max-w-2xl mx-auto p-4 pt-8 pb-28">
        <div className="cl-empty">
          <div className="text-4xl" aria-hidden>
            🛡️
          </div>
          <p className="text-lg font-bold mt-3">Only the room owner sees the chog dashboard.</p>
          <Link to="/rooms" className="cl-btn cl-btn-ghost cl-btn-sm mt-4 text-[#836ef9]">
            back to rooms
          </Link>
        </div>
      </div>
    );
  }

  async function togglePolice(address: string, isPolice: boolean) {
    if (!topic) return;
    setModError(undefined);
    try {
      if (isPolice) {
        await revokeChogPolice(topic, address);
      } else {
        await assignChogPolice(topic, me, address);
      }
    } catch (e) {
      setModError(e instanceof Error ? e.message : String(e));
    }
  }

  async function doBan(address: string) {
    if (!topic || !client) return;
    setModError(undefined);
    try {
      const conversation = await dbConversationsGet(topic);
      if (!conversation) throw new Error("room missing");
      const group = await getXMTPGroup(client, conversation);
      await group.removeMembersByIdentifiers([
        { identifier: address, identifierKind: 0 } as never,
      ]);
      await banUser(topic, me, address);
      setMembers((m) => m.filter((x) => x !== address));
    } catch (e) {
      setModError(e instanceof Error ? e.message : String(e));
    }
  }

  async function doUnban(address: string) {
    if (!topic) return;
    await unbanUser(topic, address);
  }

  async function saveWords() {
    if (!topic) return;
    setSavingWords(true);
    try {
      const list = words
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);
      await setMutedWords(topic, list);
    } finally {
      setSavingWords(false);
    }
  }

  async function addMember() {
    if (!client || !topic || !addAddress) return;
    setModError(undefined);
    try {
      const conversation = await dbConversationsGet(topic);
      if (!conversation) throw new Error("room missing");
      const group = await getXMTPGroup(client, conversation);
      await group.addMembersByIdentifiers([
        { identifier: addAddress.trim().toLowerCase(), identifierKind: 0 } as never,
      ]);
      setMembers((m) => [...m, addAddress.trim().toLowerCase()]);
      setAddAddress("");
    } catch (e) {
      setModError(e instanceof Error ? e.message : String(e));
    }
  }

  async function doDelete() {
    if (!topic) return;
    try {
      await archiveRoom(topic, me);
    } catch (e) {
      setModError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="text-[#f4f1fe] max-w-4xl mx-auto p-4 pt-8 pb-28 min-h-[75vh]">
      <div className="cl-card p-6 sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl w-12 h-12 rounded-2xl bg-[#141026] border border-white/5 flex items-center justify-center shrink-0" aria-hidden>
                {room.emoji}
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {room.name} · Room Dashboard
                </h1>
                <p className="text-xs text-[#f4f1fe]/55 mt-1">{room.description || "Community Chat Room"}</p>
              </div>
            </div>
          </div>
          <Link
            to={`/c/${topic}`}
            className="cl-btn cl-btn-ghost cl-btn-sm text-[#836ef9]"
          >
            ← Back to Chat
          </Link>
        </div>

        {modError && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs mt-4">
            {modError}
          </div>
        )}

        {/* Members & Roles Section */}
        <section className="mt-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="cl-section-title flex items-center gap-2">
              <LucideShield size={14} className="text-[#5ce68a]" /> Roster ({members.length + 1})
            </h2>
            <span className="text-[11px] text-[#f4f1fe]/55">
              Only Creator (Admin) & Chog Police can moderate
            </span>
          </div>

          <ul className="cl-stagger mt-4 space-y-2" data-testid="room-roster">
            {/* Owner entry */}
            <li className="cl-card-flat flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-[#f4f1fe]">{me} (You)</span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 font-bold">
                  👑 Owner & Admin
                </span>
              </div>
              <span className="text-[11px] text-[#f4f1fe]/55 font-mono">Supreme Boss</span>
            </li>

            {members.map((m) => {
              const isPolice = (roles || []).some(
                (r) => r.address === m && r.topic === topic
              );
              return (
                <li
                  key={m}
                  className="cl-card-flat flex items-center justify-between px-4 py-3 flex-wrap gap-2"
                  data-testid={`roster-${m}`}
                >
                  <span className="font-mono text-xs text-[#f4f1fe]/90">{m}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`police-${m}`}
                      onClick={() => void togglePolice(m, isPolice)}
                      className={`cl-btn cl-btn-sm ${
                        isPolice
                          ? "bg-[#14B8A6] text-white shadow-sm"
                          : "bg-white/5 text-[#f4f1fe]/70 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      🛡️ {isPolice ? "Chog Police ✓" : "Make Chog Police"}
                    </button>
                    <button
                      type="button"
                      data-testid={`ban-${m}`}
                      onClick={() => void doBan(m)}
                      className="cl-btn cl-btn-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                    >
                      Ban User
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Invite Input */}
          <div className="mt-4 flex gap-2" data-testid="add-member-row">
            <input
              data-testid="add-member-input"
              value={addAddress}
              onChange={(e) => setAddAddress(e.target.value)}
              className="cl-input grow p-3 font-mono text-xs"
              placeholder="0x… invite a chog by address"
            />
            <Button
              type="button"
              testId="add-member"
              size="sm"
              onClick={() => void addMember()}
            >
              Invite
            </Button>
          </div>

          {/* Banned Users */}
          {(bans || []).length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10" data-testid="bans-list">
              <h3 className="cl-section-title text-red-300">
                Banned troublemakers ({bans?.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {(bans || []).map((b) => (
                  <li
                    key={b.key}
                    className="flex items-center justify-between gap-2 bg-red-500/5 border border-red-500/15 rounded-2xl px-3 py-2"
                  >
                    <span className="font-mono text-xs text-red-300 line-through truncate">
                      {b.address}
                    </span>
                    <button
                      type="button"
                      onClick={() => void doUnban(b.address)}
                      className="shrink-0 text-xs font-bold underline text-[#5ce68a] hover:text-green-300"
                    >
                      Forgive & Unban
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Word Filter / Auto-Mod */}
        <section className="mt-8 border-t border-white/10 pt-6">
          <div>
            <h2 className="cl-section-title">Muted Words Auto-Mod Filter</h2>
            <p className="text-xs text-[#f4f1fe]/55 mt-2">
              Comma separated words. Messages from non-moderators containing these words will be blocked.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <input
              data-testid="muted-words"
              value={words}
              onChange={(e) => setWords(e.target.value)}
              className="cl-input grow p-3 text-xs"
              placeholder="e.g. scam, rug, fake, drainer"
            />
            <Button
              type="button"
              testId="save-words"
              size="sm"
              onClick={() => void saveWords()}
              disabled={savingWords}
              className="!bg-[#5ce68a] !text-black"
            >
              {savingWords ? "Saving…" : "Save Filter"}
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-8 rounded-2xl border border-red-500/25 bg-red-500/5 p-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="cl-section-title text-red-300">Danger Zone</h2>
            <p className="text-xs text-[#f4f1fe]/55 mt-2">
              Permanently delete this room. Archives room and clears roles and bans.
            </p>
          </div>
          <Button
            type="button"
            testId="delete-room"
            color="secondary"
            size="sm"
            onClick={() => void doDelete()}
            className="!bg-red-500 hover:!bg-red-600 !text-white !border-red-500/50"
          >
            <span className="flex items-center gap-2 font-bold">
              <LucideTrash size={14} />
              Delete Room
            </span>
          </Button>
        </section>
      </div>
    </div>
  );
}

async function dbRoomGet(topic: string) {
  const { getRoom } = await import("../../model/rooms");
  return getRoom(topic);
}

async function dbConversationsGet(topic: string) {
  const db = (await import("../../model/db")).default;
  return db.conversations.where("topic").equals(topic).first();
}
