import { FormEvent, ReactElement, createRef, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import { startConversation } from "../model/conversations";
import { useClient } from "../hooks/useClient";
import { LucideWallet, LucideRocket } from "lucide-react";

export default function NewConversationView(): ReactElement {
  const client = useClient();
  const { id } = useParams();
  const addressInputRef = createRef<HTMLInputElement>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [autoStarted, setAutoStarted] = useState(false);
  const navigate = useNavigate();

  const autoAddress = id && id.startsWith("0x") ? id : undefined;

  useEffect(() => {
    if (!client || autoStarted || !autoAddress) return;
    setAutoStarted(true);
    (async () => {
      setLoading(true);
      try {
        const conversation = await startConversation(client, autoAddress);
        navigate(`/c/${conversation.topic}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [client, autoStarted, autoAddress, navigate]);

  if (!client) {
    return (
      <div className="text-center py-24">
        <p className="text-lg font-bold text-[#f4f1fe]">Sign in first, chog.</p>
        <Link to="/" className="text-[#836ef9] underline font-mono text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  function validateAddress(): string | undefined {
    const address = addressInputRef.current?.value.trim() || "";

    if (address.length === 0) {
      addressInputRef.current?.classList.add("horizontal-shake");
      setTimeout(() => {
        addressInputRef.current?.classList.remove("horizontal-shake");
      }, 1000);
      addressInputRef.current?.focus();
      return undefined;
    }

    return address;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!client) return;

    const address = autoAddress ?? validateAddress();
    if (!address) return;

    setLoading(true);
    setError(undefined);
    try {
      const conversation = await startConversation(client, address);
      navigate(`/c/${conversation.topic}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 pt-8 min-h-[60vh] max-w-lg mx-auto">
      <div className="bg-[#161228] border border-white/10 rounded-2xl shadow-chog p-8 text-[#f4f1fe]">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-[#836ef9]/20 text-[#836ef9] p-2 rounded-xl">
            <LucideWallet size={22} />
          </span>
          <h1 className="text-xl font-extrabold text-[#f4f1fe]">Start a chug chat</h1>
        </div>
        <p className="text-sm text-[#f4f1fe]/60">
          Enter the Monad wallet address of a Chog holder. If they've opened
          Chuglife before, your secure XMTP chat opens instantly.
        </p>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <input
            autoFocus
            ref={addressInputRef}
            data-testid="address-input"
            type="text"
            defaultValue={autoAddress}
            className="border border-white/15 bg-[#141026] text-[#f4f1fe] p-3 w-full rounded-xl font-mono text-sm outline-none focus:border-[#836ef9] transition"
            placeholder="0x… some chog's wallet address"
          />

          {error && (
            <div
              data-testid="new-conversation-error"
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm w-full"
            >
              {error}
            </div>
          )}

          <div className="flex justify-center items-center gap-3">
            <Button type="submit" disabled={loading}>
              <span className="flex items-center gap-2">
                <LucideRocket size={16} />
                {loading ? "Opening…" : "Start Conversation"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
