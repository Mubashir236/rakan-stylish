import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const internalApi = internal as any;

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return rows.reverse();
  },
});

export const typingStatus = query({
  handler: async (ctx) => {
    const status = await ctx.db
      .query("chatStatus")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return status?.isTyping ?? false;
  },
});

export const send = mutation({
  args: {
    author: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.body.trim();
    if (!trimmed) return null;

    await ctx.db.insert("messages", {
      author: args.author,
      body: trimmed,
      createdAt: Date.now(),
    });

    if (args.author === "Customer") {
      await ctx.runMutation(internalApi.chat.setTypingInternal, { isTyping: true });
      await ctx.scheduler.runAfter(0, internalApi.openai.generateAndSaveReplyInternal, {
        latestMessage: trimmed,
      });
    }

    return { ok: true };
  },
});

export const appendMessageInternal = internalMutation({
  args: {
    author: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      author: args.author,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});

export const setTypingInternal = internalMutation({
  args: { isTyping: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chatStatus")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
        updatedAt: Date.now(),
      });
      return;
    }
    await ctx.db.insert("chatStatus", {
      key: "main",
      isTyping: args.isTyping,
      updatedAt: Date.now(),
    });
  },
});
