/*
LOCALHOST TESTING CHECKLIST:
✅ 1. Run: npx convex dev (in a separate terminal)
✅ 2. Add GEMINI_API_KEY in Convex dashboard env vars
✅ 3. Run: npm run dev
✅ 4. Open http://localhost:3000 and click the chat button
✅ 5. Send a message and confirm Gemini responds
✅ 6. Refresh page — confirm chat history reloads from Convex
✅ 7. Open Convex dashboard and verify messages are being stored
*/

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

const WELCOME_TEXT =
  "Welcome to Rakan 👋 I'm your personal fashion assistant. How can I help you today?";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<Id<"chatSessions"> | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const createSession = useMutation(api.chatSessions.createSession);
  const addMessage = useMutation(api.chatSessions.addMessage);
  const getAiReply = useAction(api.messages.getAiReply);

  const displayMessages = useMemo(() => chatMessages, [chatMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isTyping, isOpen]);

  const handleStartChat = async (e: FormEvent) => {
    e.preventDefault();
    const name = visitorName.trim();
    const email = visitorEmail.trim();
    if (!name || !email || isStartingChat) return;

    setIsStartingChat(true);
    try {
      const newSessionId = await createSession({
        visitorName: name,
        visitorEmail: email,
      });
      setSessionId(newSessionId);
      setChatMessages([
        {
          role: "assistant",
          content: WELCOME_TEXT,
          timestamp: Date.now(),
        },
      ]);
      await addMessage({
        sessionId: newSessionId,
        role: "assistant",
        content: WELCOME_TEXT,
      });
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!sessionId) return;

    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    const now = Date.now();

    await addMessage({
      sessionId,
      role: "user",
      content: text,
    });
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: now },
    ]);

    setIsTyping(true);
    try {
      const historyPayload = chatMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const reply = (await getAiReply({
        message: text,
        history: historyPayload,
      })) as string | undefined;

      const aiText =
        reply?.trim() ||
        "I’m sorry — I’m having trouble right now. Please try again in a moment.";

      await addMessage({
        sessionId,
        role: "assistant",
        content: aiText,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiText, timestamp: Date.now() },
      ]);
    } catch (error) {
      console.error("Convex AI action error:", error);
      const fallbackMessage =
        "Something went wrong, please try again. If this keeps happening, please contact support.";
      await addMessage({
        sessionId,
        role: "assistant",
        content: fallbackMessage,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallbackMessage, timestamp: Date.now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {!isOpen ? (
        <button
          aria-label="Open Rakan Assistant"
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#111111] border border-[#2b2b2b] text-[#f5d48b] shadow-2xl flex items-center justify-center hover:scale-[1.03] transition-transform"
        >
          <MessageCircle size={22} />
        </button>
      ) : (
        <div className="w-[380px] max-w-[92vw] h-[520px] max-h-[82vh] bg-[#0f0f0f] border border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden rounded-sm">
          <div className="px-4 py-3 border-b border-[#232323] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm tracking-[0.18em] uppercase text-[#f5d48b]">
                Rakan Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {!sessionId ? (
            <form onSubmit={handleStartChat} className="flex-1 p-4 bg-[#121212] flex flex-col justify-center">
              <h4 className="text-[#f5d48b] text-lg mb-1">Before we begin...</h4>
              <p className="text-zinc-400 text-sm mb-5">
                Share your details so we can save your conversation.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[#171717] border border-[#2e2e2e] text-zinc-100 placeholder:text-zinc-500 px-3 py-2 text-sm outline-none focus:border-[#d5b16b]"
                />
                <input
                  type="email"
                  required
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-[#171717] border border-[#2e2e2e] text-zinc-100 placeholder:text-zinc-500 px-3 py-2 text-sm outline-none focus:border-[#d5b16b]"
                />
                <button
                  type="submit"
                  disabled={isStartingChat || !visitorName.trim() || !visitorEmail.trim()}
                  className="w-full py-2.5 bg-[#d5b16b] text-black text-sm font-medium disabled:opacity-40 transition-opacity"
                >
                  {isStartingChat ? "Starting..." : "Start Chatting \u2192"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#121212]">
                {displayMessages.map((m, idx) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={`${m.timestamp}-${idx}`}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed border ${
                          isUser
                            ? "bg-[#d5b16b] text-black border-[#d5b16b]"
                            : "bg-[#1a1a1a] text-zinc-100 border-[#2c2c2c]"
                        }`}
                      >
                        {!isUser && (
                          <div className="text-[10px] uppercase tracking-[0.16em] text-[#f5d48b] mb-1">
                            Rakan
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] px-3 py-2 text-sm border bg-[#1a1a1a] text-zinc-100 border-[#2c2c2c]">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#f5d48b] mb-1">
                        Rakan
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.1s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-[#232323] flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Ask about style, sizing, shipping..."
                  className="flex-1 bg-[#171717] border border-[#2e2e2e] text-zinc-100 placeholder:text-zinc-500 px-3 py-2 text-sm outline-none focus:border-[#d5b16b]"
                />
                <button
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="h-10 w-10 shrink-0 flex items-center justify-center bg-[#d5b16b] text-black disabled:opacity-40 transition-opacity"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
