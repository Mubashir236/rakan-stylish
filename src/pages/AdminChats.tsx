import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ChevronDown, ChevronUp, Mail, MessageSquare, Search, User } from "lucide-react";
import { api } from "../../convex/_generated/api";

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default function AdminChats() {
  const sessions = useQuery(api.chatSessions.getAllSessions);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (session) =>
        session.visitorName.toLowerCase().includes(q) ||
        session.visitorEmail.toLowerCase().includes(q)
    );
  }, [search, sessions]);

  const toggleExpanded = (sessionId: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  if (!sessions) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-md border border-border p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl text-foreground">Chat Sessions</h3>
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium tracking-[0.12em] uppercase border border-border text-muted-foreground bg-secondary/50">
              {filteredSessions.length}
            </span>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md border border-border p-16 text-center">
          <MessageSquare size={40} className="mx-auto mb-4 text-border" />
          <h3 className="font-display text-xl text-foreground mb-2">No Chat Sessions Found</h3>
          <p className="text-muted-foreground text-sm">
            Chat sessions will appear here once visitors start conversations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const firstUserMessage =
              session.messages.find((m) => m.role === "user")?.content ?? "No user message yet.";
            const isExpanded = !!expandedIds[session._id];

            return (
              <div key={session._id} className="bg-white/70 backdrop-blur-md border border-border">
                <div className="p-5 md:p-6 border-b border-border/70">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-foreground">
                          <User size={14} className="text-muted-foreground" />
                          <p className="font-medium text-sm md:text-base">{session.visitorName}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
                          <Mail size={13} />
                          {session.visitorEmail}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs md:text-sm text-foreground">
                          {formatDateTime(session.startedAt)}
                        </p>
                        <p className="text-[11px] md:text-xs text-muted-foreground mt-1 tracking-[0.12em] uppercase">
                          {session.messageCount} messages
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{firstUserMessage}</p>

                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleExpanded(session._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} /> Hide Conversation
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> View Conversation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 md:p-6 bg-secondary/20">
                    <div className="space-y-3">
                      {session.messages.map((message, idx) => {
                        const isUser = message.role === "user";
                        return (
                          <div
                            key={`${message.timestamp}-${idx}`}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[90%] md:max-w-[75%] px-3 py-2 text-sm border ${
                                isUser
                                  ? "bg-[#d5b16b] text-black border-[#d5b16b]"
                                  : "bg-[#1a1a1a] text-zinc-100 border-[#2c2c2c]"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <p
                                className={`mt-2 text-[10px] ${
                                  isUser ? "text-black/75" : "text-zinc-400"
                                }`}
                              >
                                {formatDateTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
