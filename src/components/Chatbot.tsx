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
import { motion, AnimatePresence } from "framer-motion";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

function getFirstName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return cleaned.split(" ")[0];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<Id<"chatSessions"> | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inactivityTimeoutRef = useRef<number | null>(null);
  const autoCloseTimeoutRef = useRef<number | null>(null);

  const createSession = useMutation(api.chatSessions.createSession);
  const addMessage = useMutation(api.chatSessions.addMessage);
  const getAiReply = useAction(api.messages.getAiReply);

  const displayMessages = useMemo(() => chatMessages, [chatMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isTyping, isOpen]);

  const clearInactivityTimers = () => {
    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
    if (autoCloseTimeoutRef.current) {
      window.clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  };

  const scheduleInactivityClose = () => {
    clearInactivityTimers();
    inactivityTimeoutRef.current = window.setTimeout(async () => {
      if (!sessionId) return;
      const awayMessage =
        "It seems you've stepped away. Feel free to return anytime — Rakan Assistant is always here for you. 👋";

      await addMessage({
        sessionId,
        role: "assistant",
        content: awayMessage,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: awayMessage, timestamp: Date.now() },
      ]);

      autoCloseTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
      }, 5000);
    }, 60000);
  };

  useEffect(() => {
    if (!isOpen) {
      clearInactivityTimers();
    }
    return () => clearInactivityTimers();
  }, [isOpen]);

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
      const firstName = getFirstName(name);
      const welcome =
        `Welcome, ${firstName} 👋 I'm your personal Rakan fashion assistant.\nHow can I help you today?`;
      setChatMessages([{ role: "assistant", content: welcome, timestamp: Date.now() }]);
      await addMessage({
        sessionId: newSessionId,
        role: "assistant",
        content: welcome,
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
    setHasUserInteracted(true);
    clearInactivityTimers();

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
      scheduleInactivityClose();
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
      scheduleInactivityClose();
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <style>{CHATBOT_CSS}</style>
      {!isOpen ? (
        <button
          aria-label="Open Rakan Assistant"
          onClick={() => {
            clearInactivityTimers();
            setIsOpen(true);
          }}
          className="relative h-14 w-14 rounded-full bg-[#111111] border border-[#2b2b2b] text-[#f5d48b] shadow-2xl flex items-center justify-center hover:scale-[1.03] transition-transform"
        >
          <span className="absolute inset-0 rounded-full ring-pulse-gold" aria-hidden />
          <MessageCircle size={22} />
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-[420px] max-w-[94vw] h-[580px] max-h-[82vh] bg-[#0f0f0f] border border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden rounded-md"
          >
            <div className="px-4 py-3 border-b border-[#232323] flex items-center justify-between bg-gradient-to-b from-[#141414] to-[#0f0f0f]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-[11px] tracking-[0.2em] uppercase text-zinc-300">
                    Online
                  </span>
                </div>
                <h3 className="text-sm tracking-[0.18em] uppercase text-[#f5d48b]">
                  Rakan Assistant
                </h3>
              </div>
              <button
                onClick={() => {
                  clearInactivityTimers();
                  setIsOpen(false);
                }}
                aria-label="Close chatbot"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {!sessionId ? (
              <form onSubmit={handleStartChat} className="flex-1 p-5 bg-[#121212] flex flex-col justify-center">
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
                    className="w-full bg-[#171717] border border-[#2e2e2e] text-zinc-100 placeholder:text-zinc-500 px-4 py-3 text-sm outline-none focus:border-[#d5b16b] focus:ring-2 focus:ring-[#d5b16b]/20 transition-colors rounded-full"
                  />
                  <input
                    type="email"
                    required
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-[#171717] border border-[#2e2e2e] text-zinc-100 placeholder:text-zinc-500 px-4 py-3 text-sm outline-none focus:border-[#d5b16b] focus:ring-2 focus:ring-[#d5b16b]/20 transition-colors rounded-full"
                  />
                  <button
                    type="submit"
                    disabled={isStartingChat || !visitorName.trim() || !visitorEmail.trim()}
                    className="w-full py-3 bg-[#d5b16b] text-black text-sm font-medium disabled:opacity-40 transition-opacity rounded-full"
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
                    const t = new Date(m.timestamp);
                    const timeLabel = t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                    return (
                      <motion.div
                        key={`${m.timestamp}-${idx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed border ${
                            isUser
                              ? "bg-[#d5b16b] text-black border-[#d5b16b] rounded-2xl rounded-br-md"
                              : "bg-[#171717] text-zinc-100 border-[#2c2c2c] rounded-2xl rounded-bl-md"
                          }`}
                        >
                          {!isUser && (
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="h-6 w-6 rounded-full bg-[#0f0f0f] border border-[#2c2c2c] flex items-center justify-center text-[#f5d48b] text-[10px] tracking-[0.2em]">
                                R
                              </div>
                              <div className="text-[10px] uppercase tracking-[0.16em] text-[#f5d48b]">
                                Rakan
                              </div>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <div className={`mt-2 text-[10px] ${isUser ? "text-black/70" : "text-zinc-400"} text-right`}>
                            {timeLabel}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[85%] px-3.5 py-2.5 text-sm border bg-[#171717] text-zinc-100 border-[#2c2c2c] rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-6 w-6 rounded-full bg-[#0f0f0f] border border-[#2c2c2c] flex items-center justify-center text-[#f5d48b] text-[10px] tracking-[0.2em]">
                            R
                          </div>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-[#f5d48b]">
                            Rakan
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d5b16b] animate-bounce [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d5b16b] animate-bounce [animation-delay:-0.1s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d5b16b] animate-bounce" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={endRef} />
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-[#232323] flex items-center gap-2 bg-[#0f0f0f]">
                  <div className="flex-1 rounded-full border border-[#2e2e2e] bg-[#121212] px-3 py-2 flex items-center gap-2 focus-within:border-[#d5b16b] focus-within:ring-2 focus-within:ring-[#d5b16b]/20 transition-colors">
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
                      className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-500 text-sm outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !input.trim()}
                      className="h-9 w-9 shrink-0 flex items-center justify-center bg-[#d5b16b] text-black disabled:opacity-40 transition-opacity rounded-full"
                      aria-label="Send message"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// Local styles (premium ring pulse)
const CHATBOT_CSS = `
  @keyframes ringPulseGold {
    0% { transform: scale(1); opacity: 0.22; }
    55% { transform: scale(1.6); opacity: 0.0; }
    100% { transform: scale(1.6); opacity: 0.0; }
  }

  .ring-pulse-gold {
    box-shadow: 0 0 0 0 rgba(213, 177, 107, 0.35);
    border: 1px solid rgba(213, 177, 107, 0.45);
    animation: ringPulseGold 1.8s ease-out infinite;
  }
`;
