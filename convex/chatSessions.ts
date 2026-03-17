import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSession = mutation({
  args: {
    visitorName: v.string(),
    visitorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const visitorName = args.visitorName.trim();
    const visitorEmail = args.visitorEmail.trim();
    const now = Date.now();

    const sessionId = await ctx.db.insert("chatSessions", {
      visitorName,
      visitorEmail,
      messages: [],
      startedAt: now,
      lastMessageAt: now,
      messageCount: 0,
    });

    return sessionId;
  },
});

export const addMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    const content = args.content.trim();
    if (!content) return null;

    const timestamp = Date.now();
    const message = {
      role: args.role,
      content,
      timestamp,
    };

    await ctx.db.patch(args.sessionId, {
      messages: [...session.messages, message],
      lastMessageAt: timestamp,
      messageCount: session.messageCount + 1,
    });

    return message;
  },
});

export const getAllSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("chatSessions").collect();
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  },
});

export const getSessionById = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});
