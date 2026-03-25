import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    tier: v.union(v.literal("monthly"), v.literal("annual")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memberships", {
      ...args,
      active: true,
      paymentStatus: "unpaid",
    });
  },
});

export const listAllMemberships = query({
  handler: async (ctx) => {
    return await ctx.db.query("memberships").order("desc").collect();
  },
});
