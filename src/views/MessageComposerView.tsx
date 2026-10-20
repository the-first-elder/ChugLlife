import {
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { useClient } from "../hooks/useClient";
import { Conversation } from "../model/db";
import db from "../model/db";
import { sfx } from "../util/sfx";
import { sendMessage } from "../model/messages";
import { checkMutedWords, isBanned, isChogPolice } from "../model/rooms";
import { clientAddress } from "../model/conversations";
import { LucideSend, LucideShieldAlert } from "lucide-react";

const MAX_LEN = 2000;

export default function MessageComposerView({
  conversation,
}: {
  conversation: Conversation;
}): ReactElement {
  const [textInput, setTextInput] = useState("");
  const [modNotice, setModNotice] = useState<string | undefined>();
  const [focused, setFocused] = useState(false);

  const client = useClient();
  const isRoom = conversation.peerAddress === "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inFlight = useRef(false);

  // Auto-grow the textarea up to ~5 lines; never let it bust the layout.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [textInput]);

  async function roomGuard(text: string): Promise<boolean> {
    if (!isRoom || !client) return true;
    setModNotice(undefined);
    const me = clientAddress(client);
    if (await isBanned(conversation.topic, me)) {
      setModNotice("Chug police has you banned from this room.");
      return false;
    }
    const room = await db.rooms.get(conversation.topic);
    const isOwner = room?.owner === me;
    const police = isOwner || (await isChogPolice(conversation.topic, me));
    if (!police) {
      const hits = await checkMutedWords(conversation.topic, text);
      if (hits.length > 0) {
        setModNotice(`🛡️ Chog police: “${hits[0]}” is filtered in this room.`);
        return false;
      }
    }
    return true;
  }

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!client || inFlight.current) return;
    const text = textInput.trim();
    if (!text) return;
    if (!(await roomGuard(text))) return;

    setModNotice(undefined);
    inFlight.current = true;
    setTextInput("");
    // Keep the caret in the field for rapid-fire chatting.
    textareaRef.current?.focus();
    try {
      sfx.send();
      sendMessage(client, conversation, text);
    } finally {
      inFlight.current = false;
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit();
    }
  }

  const nearLimit = textInput.length > MAX_LEN - 200;

  return (
    <div
      className="sticky bottom-0 z-30 border-t border-[rgba(244,241,254,0.08)] bg-[#08080d]/95 backdrop-blur-xl"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {modNotice && (
        <div
          data-testid="composer-mod-notice"
          className="cl-fade-in max-w-3xl mx-auto mt-2.5 px-3 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2 horizontal-shake"
        >
          <LucideShieldAlert size={16} className="text-red-400 shrink-0" />
          <span>{modNotice}</span>
        </div>
      )}

      <form
        className="mx-auto w-full max-w-3xl px-3 py-2.5"
        onSubmit={(e) => void onSubmit(e)}
      >
        <div
          className={`flex items-center gap-2 rounded-[24px] border bg-[#0d0d13] p-1.5 pl-4 transition-all duration-200 ${
            focused
              ? "border-[#836ef9]/60 bg-[#14141b] shadow-[0_0_0_4px_rgba(131,110,249,0.12)]"
              : "border-white/10"
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={isRoom ? "Message this room…" : "Message your chogmate…"}
            className="flex-1 resize-none bg-transparent py-[10px] text-[16px] leading-[22px] text-[#f4f1fe] outline-none placeholder:text-[#f4f1fe]/35"
            name="text"
            autoComplete="off"
            data-testid="composer-input"
            value={textInput}
            maxLength={MAX_LEN}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button
            type="submit"
            className="cl-btn cl-btn-primary flex h-9 w-9 shrink-0 items-center justify-center self-end !rounded-full p-0 shadow-[0_4px_16px_-4px_rgba(131,110,249,0.6)] transition-transform active:scale-90 disabled:opacity-40 disabled:shadow-none"
            disabled={!textInput.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <LucideSend size={16} className="translate-x-[-1px]" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 h-4">
          <span className="font-mono text-[10px] text-[#f4f1fe]/30">
            {focused && textInput.trim() ? "Enter to send · Shift+Enter for a new line" : ""}
          </span>
          {nearLimit && (
            <span
              className={`font-mono text-[10px] tabular-nums ${
                textInput.length >= MAX_LEN ? "text-red-400" : "text-[#f4f1fe]/40"
              }`}
            >
              {textInput.length}/{MAX_LEN}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
