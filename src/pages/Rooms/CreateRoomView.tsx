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
      <div className="text-[#f4f1fe] max-w-lg mx-auto p-4 pt-8 pb-28">
        <div className="cl-empty">
          <span className="text-4xl block mb-3" aria-hidden>🔐</span>
          <p className="text-lg font-bold text-[#f4f1fe]">Sign in first, chog.</p>
        </div>
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
      <div className="cl-card cl-card-glow p-6 sm:p-8">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#836ef9]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="bg-[#836ef9]/20 text-[#836ef9] p-3 rounded-2xl border border-[#836ef9]/30">
              <LucideSparkles size={22} />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Create a Chug Room</h1>
          </div>
          <p className="text-xs text-[#f4f1fe]/55 mt-4 leading-relaxed">
            You're the admin from second one. Assign chog police, filter banned words, ban troublemakers, and moderate your space.
          </p>

          <form onSubmit={onSubmit} className="cl-stagger space-y-4 mt-6">
            <div>
              <label className="text-xs font-bold font-mono text-[#f4f1fe]/70 uppercase tracking-wider">Room Name</label>
              <input
                autoFocus
                data-testid="room-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="cl-input mt-2 w-full p-3 text-sm"
                placeholder="e.g. Monad Alpha Den"
                maxLength={40}
              />
            </div>

            <div>
              <label className="text-xs font-bold font-mono text-[#f4f1fe]/70 uppercase tracking-wider">Room Badge Emoji</label>
              <div className="flex gap-2 flex-wrap mt-2" data-testid="room-emoji-picker">
                {EMOJI_CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    aria-pressed={emoji === choice}
                    onClick={() => setEmoji(choice)}
                    className="cl-pill text-lg"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold font-mono text-[#f4f1fe]/70 uppercase tracking-wider">
                Description <span className="text-[#f4f1fe]/40 lowercase">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="cl-input mt-2 w-full p-3 text-sm"
                placeholder="What vibes belong in this room?"
                rows={2}
                maxLength={140}
              />
            </div>

            {error && (
              <div
                data-testid="create-room-error"
                className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex flex-col gap-2"
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
              <Button type="submit" disabled={loading} className="w-full py-3 text-sm">
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
