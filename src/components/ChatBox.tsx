import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const apiAny = api as any;

export default function ChatBox() {
  const messages = useQuery(apiAny.chat.list, { limit: 40 }) ?? [];
  const aiTyping = useQuery(apiAny.chat.typingStatus) ?? false;
  const send = useMutation(apiAny.chat.send);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const visibleMessages = useMemo(() => messages.slice(-20), [messages]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    try {
      await send({ author: "Customer", body });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,22rem)]">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto block bg-primary text-primary-foreground px-4 py-3 text-xs tracking-[0.2em] uppercase"
        >
          Rakan AI
        </button>
      ) : (
        <div className="border border-border bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-xs tracking-[0.2em] uppercase text-foreground">Rakan AI</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Close
            </button>
          </div>

          <div className="h-72 overflow-y-auto p-3 space-y-2 bg-secondary/30">
            {visibleMessages.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Welcome to Rakan Stylish. Ask about looks, memberships, or booking.
              </p>
            )}

            {visibleMessages.map((m) => {
              const isAi = m.author === "Rakan AI";
              return (
                <div
                  key={m._id}
                  className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                    isAi
                      ? "bg-[#f8f2e8] text-[#7a5a2b] border border-[#e8d8bd] mr-auto"
                      : "bg-primary text-primary-foreground ml-auto"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] mb-1 opacity-80">
                    {m.author}
                  </div>
                  <div>{m.body}</div>
                </div>
              );
            })}

            {aiTyping && (
              <div className="max-w-[85%] px-3 py-2 text-sm bg-[#f8f2e8] text-[#7a5a2b] border border-[#e8d8bd] mr-auto">
                <div className="text-[10px] uppercase tracking-[0.18em] mb-1 opacity-80">Rakan AI</div>
                Typing...
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="p-3 border-t border-border flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask Rakan AI..."
              className="flex-1 border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="px-3 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-[0.15em] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
