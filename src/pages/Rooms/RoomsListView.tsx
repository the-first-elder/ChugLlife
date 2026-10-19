import { ReactElement, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../model/db";
import { useClient } from "../../hooks/useClient";
import { clientAddress } from "../../model/conversations";
import { ensureStarterRooms } from "../../model/rooms";
import {
  LucideMessageSquare,
  LucidePlusSquare,
  LucideSearch,
  LucideShield,
  LucideStore,
  LucideUsers,
  LucideArrowRight,
} from "lucide-react";

function timeAgo(d: Date) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RoomsListView(): ReactElement {
  const client = useClient();
  const me = client ? clientAddress(client) : "";
  const [search, setSearch] = useState("");

  useEffect(() => {
    void ensureStarterRooms();
  }, []);

  const rooms = useLiveQuery(
    () => db.rooms.orderBy("updatedAt").reverse().toArray(),
    []
  );
  const visible = (rooms || []).filter(
    (r) =>
      !r.archived &&
      (search.trim() === "" ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()))
  );

  const mine = useLiveQuery(
    () =>
      me
        ? db.rooms.where("owner").equals(me).filter((r) => !r.archived).count()
        : Promise.resolve(0),
    [me]
  );
  const slots =
    useLiveQuery(() => (me ? db.activity.get(me) : undefined), [me])
      ?.roomSlots ?? 1;

  const isAtCapacity = (mine ?? 0) >= slots;

  return (
    <div className="text-[#f4f1fe] max-w-5xl mx-auto p-4 pt-8 pb-28 min-h-[75vh]">
      {/* Top Banner / Header */}
      <div className="bg-[#161228] border border-[rgba(244,241,254,0.12)] rounded-3xl p-6 sm:p-8 shadow-chog-lg relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#836ef9]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-[#836ef9]/20 border border-[#836ef9]/40 text-[#836ef9] flex items-center justify-center shadow-sm">
                <LucideUsers size={22} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chuglife Rooms
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#f4f1fe]/60 mt-2 max-w-xl leading-relaxed">
              Public chatting rooms for the community. Room creators are <strong>Admins</strong>, with the power to assign <strong>Chog Police</strong> moderators, filter banned words, and ban troublemakers.
            </p>
          </div>

          <div className="text-left sm:text-right bg-[#141026] border border-white/5 p-3.5 rounded-2xl">
            <div className="font-mono text-xs text-[#f4f1fe]/60">
              Capacity: <strong className="text-[#5ce68a]">{mine ?? 0}</strong> / {slots} rooms
            </div>
            <div className="mt-2 flex items-center gap-2">
              {isAtCapacity && (
                <Link
                  to="/shop"
                  className="px-3 py-1.5 rounded-xl bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 text-[#f59e0b] border border-[#f59e0b]/30 text-xs font-bold transition flex items-center gap-1"
                  title="Buy more room creation slots"
                >
                  <LucideStore size={13} /> Buy Slots
                </Link>
              )}
              <Link to="/rooms/new">
                <button
                  type="button"
                  data-testid="create-room"
                  className="px-4 py-1.5 rounded-xl bg-[#836ef9] hover:bg-[#9d8dfc] text-white text-xs font-bold transition shadow-chog-sm flex items-center gap-1.5"
                >
                  <LucidePlusSquare size={14} /> New Room
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex items-center gap-2 bg-[#141026] border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-inner">
          <LucideSearch size={16} className="text-[#f4f1fe]/40 shrink-0" />
          <input
            type="text"
            placeholder="Search rooms by name or vibe…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-[#f4f1fe] placeholder-[#f4f1fe]/40 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-[#f4f1fe]/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="rooms-grid">
        {(!visible || visible.length === 0) && (
          <div className="col-span-full bg-[#161228] rounded-3xl border border-white/10 p-10 text-center shadow-sm">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="font-bold text-base text-[#f4f1fe]">No rooms found</p>
            <p className="text-xs text-[#f4f1fe]/50 mt-1">
              {search ? "Try a different search term" : "Create the first custom room — everyone gets 1 free room slot!"}
            </p>
          </div>
        )}

        {visible.map((room) => {
          const isOwner = room.owner === me;

          return (
            <Link
              key={room.topic}
              to={`/c/${room.topic}`}
              data-testid={`room-${room.topic}`}
              className="group bg-[#161228] hover:bg-[#1a1433] border border-[rgba(244,241,254,0.1)] hover:border-[#836ef9]/50 p-5 rounded-3xl shadow-sm hover:shadow-chog transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl p-2.5 rounded-2xl bg-[#141026] border border-white/5 group-hover:scale-110 transition-transform duration-200">
                    {room.emoji}
                  </span>
                  <span className="text-[10px] text-[#f4f1fe]/40 font-mono bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                    {timeAgo(room.updatedAt)}
                  </span>
                </div>

                <h2 className="font-extrabold text-base text-[#f4f1fe] mt-3 group-hover:text-[#836ef9] transition-colors truncate">
                  {room.name}
                </h2>
                <p className="text-xs text-[#f4f1fe]/60 mt-1.5 line-clamp-2 leading-relaxed">
                  {room.description || "Active community room."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 text-[10px] font-bold">
                      👑 Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#5ce68a] font-mono font-bold bg-[#5ce68a]/10 px-2 py-0.5 rounded-full border border-[#5ce68a]/20">
                      <LucideShield size={10} /> Police Mod
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-xs text-[#836ef9] font-bold group-hover:translate-x-1 transition-transform">
                  Enter <LucideArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
