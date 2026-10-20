import { ReactElement, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../model/db";
import { useClient } from "../../hooks/useClient";
import { clientAddress } from "../../model/conversations";
import { ensureStarterRooms } from "../../model/rooms";
import {
  LucidePlusSquare,
  LucideSearch,
  LucideShield,
  LucideStore,
  LucideUsers,
  LucideChevronRight,
} from "lucide-react";
import Skeleton from "../../components/Skeleton";
import ChogBackdrop from "../../components/ChogBackdrop";

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
    <div className="relative z-10 text-[#f4f1fe] max-w-5xl mx-auto p-4 pt-8 pb-28 min-h-[75vh]">
      <ChogBackdrop seed="rooms" />
      {/* Top Banner / Header */}
      <div className="cl-card cl-card-glow cl-fade-in p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#836ef9]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#836ef9]/20 border border-[#836ef9]/40 text-[#836ef9] flex items-center justify-center shadow-sm">
                <LucideUsers size={22} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chuglife Rooms
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#f4f1fe]/55 mt-3 max-w-xl leading-relaxed">
              Public chatting rooms for the community. Room creators are <strong>Admins</strong>, with the power to assign <strong>Chog Police</strong> moderators, filter banned words, and ban troublemakers.
            </p>
          </div>

          <div className="cl-card-flat px-4 py-4 text-left sm:text-right">
            <div className="cl-section-title">Capacity</div>
            <div className="mt-2 font-mono text-sm">
              <strong className="text-[#5ce68a]">{mine ?? 0}</strong> / {slots} rooms
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap sm:justify-end">
              {isAtCapacity && (
                <Link
                  to="/shop"
                  className="cl-btn cl-btn-ghost cl-btn-sm text-[#f59e0b]"
                  title="Buy more room creation slots"
                >
                  <LucideStore size={13} /> Buy Slots
                </Link>
              )}
              <Link to="/rooms/new">
                <button
                  type="button"
                  data-testid="create-room"
                  className="cl-btn cl-btn-primary cl-btn-sm"
                >
                  <LucidePlusSquare size={14} /> New Room
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Search Bar — sticky so it's always reachable */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-2 bg-[#000000]/85 backdrop-blur-xl border-b border-white/5">
        <div className="relative z-10 flex items-center gap-2">
          <LucideSearch size={16} className="text-[#f4f1fe]/45 shrink-0" />
          <input
            type="text"
            placeholder="Search rooms by name or vibe…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cl-input w-full px-4 py-2.5 text-sm"
            aria-label="Search rooms"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="cl-btn cl-btn-ghost cl-btn-sm shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Section header */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="cl-section-title">All Rooms</h2>
        <span className="font-mono text-[11px] text-[#f4f1fe]/55">
          {visible.length} {visible.length === 1 ? "room" : "rooms"}
        </span>
      </div>

      {/* Rooms Grid */}
      <div className="cl-stagger mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="rooms-grid">
        {rooms === null &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl p-4 bg-[#0c0c12] border border-white/10">
              <div className="flex items-start gap-3">
                <Skeleton className="h-11 w-11 shrink-0" rounded="rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" rounded="rounded-full" />
                  <Skeleton className="h-3 w-full" rounded="rounded-full" />
                  <Skeleton className="h-3 w-1/2" rounded="rounded-full" />
                </div>
              </div>
            </div>
          ))}

        {rooms !== null && visible.length === 0 && (
          <div className="cl-empty col-span-full">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="font-bold text-base text-[#f4f1fe]">
              {search ? "No rooms match your search" : "No rooms yet"}
            </p>
            <p className="text-xs text-[#f4f1fe]/55 mt-2 max-w-sm mx-auto leading-relaxed">
              {search
                ? "Try a different name or vibe."
                : "Create the first custom room — everyone gets 1 free room slot!"}
            </p>
            {!search && (
              <Link
                to="/rooms/new"
                className="cl-btn cl-btn-primary cl-btn-sm mt-4"
              >
                <LucidePlusSquare size={14} /> Create a room
              </Link>
            )}
          </div>
        )}

        {visible.map((room) => {
          const isOwner = room.owner === me;

          return (
            <Link
              key={room.topic}
              to={`/c/${room.topic}`}
              data-testid={`room-${room.topic}`}
              className="cl-card-flat group hover:border-[#836ef9]/50 hover:bg-[#1a1433] transition-all duration-200 p-4 flex items-start gap-3"
            >
              <span className="relative w-11 h-11 shrink-0 text-2xl rounded-2xl bg-[#08080d] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {room.emoji}
                {Date.now() - new Date(room.updatedAt).getTime() < 3_600_000 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
                    title="Active recently"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ce68a] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5ce68a] border-2 border-[#000000]" />
                  </span>
                )}
              </span>

              <div className="min-w-0 grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[15px] text-[#f4f1fe] truncate group-hover:text-[#a99bfc] transition-colors">
                    {room.name}
                  </h3>
                  {isOwner && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 text-[10px] font-bold">
                      👑 Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#f4f1fe]/55 mt-2 line-clamp-2 leading-relaxed">
                  {room.description || "Active community room."}
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="cl-chip">{timeAgo(room.updatedAt)}</span>
                  {isOwner ? (
                    <span className="cl-chip">Your room</span>
                  ) : (
                    <span className="cl-chip text-[#5ce68a]">
                      <LucideShield size={11} /> Police Mod
                    </span>
                  )}
                </div>
              </div>

              <LucideChevronRight
                size={18}
                className="shrink-0 mt-1 text-[#836ef9] transition-transform group-hover:translate-x-1"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
