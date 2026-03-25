import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createBooking = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    service: v.string(),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      ...args,
      status: "pending",
      paymentStatus: "unpaid",
    });
  },
});

export const listAllBookings = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
