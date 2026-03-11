import { mutation, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getAdminByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admins")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const login = action({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.runQuery(internal.admin.getAdminByEmail, {
      email: args.email,
    });
    if (!admin || admin.passwordHash !== args.passwordHash) {
      return { success: false };
    }
    return { success: true };
  },
});

export const seedAdmin = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("admins")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { passwordHash: args.passwordHash });
      return { message: "Admin updated" };
    }
    await ctx.db.insert("admins", {
      email: args.email,
      passwordHash: args.passwordHash,
    });
    return { message: "Admin created" };
  },
});
