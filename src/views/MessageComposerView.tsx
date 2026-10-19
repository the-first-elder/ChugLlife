import { FormEvent, ReactElement, useState } from "react";
import { useClient } from "../hooks/useClient";
import { Conversation } from "../model/db";
import { sendMessage } from "../model/messages";
import { checkMutedWords, isBanned } from "../model/rooms";
import { clientAddress } from "../model/conversations";
import { LucideSend, LucideShieldAlert } from "lucide-react";

export default function MessageComposerView({
  conversation,
}: {
  conversation: Conversation;
}): ReactElement {
  const [sending, setSending] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [modNotice, setModNotice] = useState<string | undefined>();

  const client = useClient();
  const isRoom = conversation.peerAddress === "";

  async function roomGuard(text: string): Promise<boolean> {
    if (!isRoom || !client) return true;
    setModNotice(undefined);
    if (await isBanned(conversation.topic, clientAddress(client))) {
      setModNotice("Chug police has you banned from this room.");
      return false;
    }
    const hits = await checkMutedWords(
      conversation.topic,
      text
    );
    if (hits.length > 0) {
      setModNotice(`🛡️ Chog police: “${hits[0]}” is filtered in this room.`);
      return false;
    }
    return true;
  }

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!client) return;
    const text = textInput.trim();
    if (!text) return;
    if (!(await roomGuard(text))) return;

    setModNotice(undefined);
    setSending(true);
    setTextInput("");
    (async () => {
      try {
        await sendMessage(client, conversation, text);
      } catch {
        // failure logged in the processor
      } finally {
        setSending(false);
      }
    })();
  }

  return (
    <div
      className="sticky left-0 right-0 bottom-0 p-3 sm:p-4 bg-[#141026]/95 backdrop-blur-xl border-t border-[rgba(244,241,254,0.08)]"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {modNotice && (
        <div
          data-testid="composer-mod-notice"
          className="cl-fade-in max-w-3xl mx-auto mb-2.5 px-3 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 horizontal-shake"
        >
          <LucideShieldAlert size={16} className="text-red-400 shrink-0" />
          <span>{modNotice}</span>
        </div>
      )}
      <form
        className="flex items-center gap-2 max-w-3xl mx-auto"
        onSubmit={(e) => void onSubmit(e)}
      >
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            type="text"
            placeholder={
              isRoom
                ? "Send a message to this room…"
                : "Type a chog message…"
            }
            className="cl-input w-full min-h-[46px] rounded-full border-white/10 bg-[#1b1533] px-5 py-3 pr-4 text-[16px] leading-tight placeholder:text-[#f4f1fe]/35 focus:border-[#836ef9]/60 focus:bg-[#1e1838] transition"
            name="text"
            autoComplete="off"
            data-testid="composer-input"
            value={textInput}
            disabled={sending}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSubmit();
              }
            }}
          />
        </div>
        <button
          type="submit"
          className="cl-btn cl-btn-primary flex h-[46px] w-[46px] shrink-0 items-center justify-center !rounded-full p-0 shadow-[0_4px_16px_-4px_rgba(131,110,249,0.6)] disabled:opacity-40 disabled:shadow-none"
          disabled={sending || !textInput.trim()}
          aria-label="Send message"
          title="Send message"
        >
          <LucideSend size={18} className={sending ? "opacity-60" : ""} />
        </button>
      </form>
    </div>
  );
}
