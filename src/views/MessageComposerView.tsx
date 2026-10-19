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
          className="max-w-3xl mx-auto mb-2 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 animate-shake"
        >
          <LucideShieldAlert size={16} className="text-red-400 shrink-0" />
          <span>{modNotice}</span>
        </div>
      )}
      <form
        className="flex gap-2 items-center max-w-3xl mx-auto"
        onSubmit={(e) => void onSubmit(e)}
      >
        <div className="flex-grow border border-[rgba(244,241,254,0.12)] rounded-2xl bg-[#161228] shadow-inner px-3 py-2 flex items-center focus-within:border-[#836ef9] focus-within:ring-1 focus-within:ring-[#836ef9]/40 transition">
          <input
            type="text"
            placeholder={
              isRoom
                ? "Send a message to this room (+5 MON)…"
                : "Type a chog message…"
            }
            className="w-full outline-none bg-transparent text-[#f4f1fe] placeholder-[#f4f1fe]/40 text-sm"
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
          className="p-3 rounded-2xl bg-[#836ef9] hover:bg-[#9d8dfc] disabled:opacity-40 disabled:hover:bg-[#836ef9] text-white shadow-chog-sm transition flex items-center justify-center shrink-0"
          disabled={sending || !textInput.trim()}
          title="Send message"
        >
          <LucideSend size={16} />
        </button>
      </form>
    </div>
  );
}
