import { FormEvent, ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { useClient } from "../../hooks/useClient";
import { clientAddress } from "../../model/conversations";
import { createRoom } from "../../model/rooms";
import { LucideSparkles } from "lucide-react";

const EMOJI_CHOICES = ["🐸", "🔥", "💎", "🎮", "🧠", "🪤", "🫡", "gm"];

export default function CreateRoomView(): ReactElement {
  const client = useClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (!client) {
    return (
      <div className="text-center py-24">
        <p className="text-lg font-bold text-chog-ink">Sign in first, chog.</p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!client || loading) return;
    if (name.trim().length < 2) {
      setError("Room name needs at least 2 characters");
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const room = await createRoom(client, clientAddress(client), {
        name: name.trim(),
        emoji,
        description: description.trim(),
      });
      navigate(`/c/${room.topic}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-[#f4f1fe] max-w-lg mx-auto p-4 pt-8 pb-28 min-h-[75vh]">
      <div className="bg-[#161228] border border-[rgba(244,241,254,0.12)] rounded-3xl shadow-chog-lg p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#836ef9]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#836ef9]/20 text-[#836ef9] p-2.5 rounded-2xl border border-[#836ef9]/30">
              <LucideSparkles size={22} />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Create a Chug Room</h1>
          </div>
          <p className="text-xs text-[#f4f1fe]/60 leading-relaxed">
            You're the admin from second one. Assign chog police, filter banned words, ban troublemakers, and moderate your space.
          </p>

          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-bold font-mono text-[#f4f1fe]/70 uppercase tracking-wider">Room Name</label>
              <input
                autoFocus
                data-testid="room-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border border-white/10 bg-[#141026] text-[#f4f1fe] p-3 w-full rounded-2xl shadow-inner text-sm outline-none focus:border-[#836ef9] focus:ring-1 focus:ring-[#836ef9]"
                placeholder="e.g. Monad Alpha Den"
                maxLength={40}
              />
            </div>

            <div>
              <label className="text-xs font-bold font-mono text-[#f4f1fe]/70 uppercase tracking-wider">Room Badge Emoji</label>
              <div className="flex gap-2 flex-wrap mt-1.5" data-testid="room-emoji-picker">
                {EMOJI_CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setEmoji(choice)}
                    className={`text-xl p-2.5 rounded-2xl border transition ${
                      emoji === choice
                        ? "border-[#836ef9] bg-[#836ef9]/20 shadow-chog-sm"
                        : "border-white/10 bg-[#141026] hover:bg-white/5"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold font-mono text-[#f4f1fe]/70 uppercase tracking-wider">
                Description <span className="text-white/30 lowercase">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 border border-white/10 bg-[#141026] text-[#f4f1fe] p-3 w-full rounded-2xl shadow-inner text-sm outline-none focus:border-[#836ef9] focus:ring-1 focus:ring-[#836ef9]"
                placeholder="What vibes belong in this room?"
                rows={2}
                maxLength={140}
              />
            </div>

            {error && (
              <div
                data-testid="create-room-error"
                className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex flex-col gap-1.5"
              >
                <span>{error}</span>
                {error.includes("cap reached") && (
                  <a
                    href="/shop"
                    className="font-bold underline text-[#f59e0b] hover:text-amber-300"
                  >
                    Visit Chuglife Shop to buy more room creation packs →
                  </a>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <Button type="submit" disabled={loading} className="!w-full !py-3 !rounded-2xl !bg-[#836ef9] hover:!bg-[#9d8dfc]">
                <span className="flex items-center justify-center gap-2 font-bold text-sm">
                  {loading ? "Summoning the room…" : "Open the Doors 🚪"}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
