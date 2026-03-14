import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookings: defineTable({
    name: v.string(),
    email: v.string(),
    service: v.string(),
    date: v.string(),
    time: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
  }),
  memberships: defineTable({
    name: v.string(),
    email: v.string(),
    tier: v.union(v.literal("monthly"), v.literal("annual")),
    active: v.boolean(),
  }),
  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
  }),
  messages: defineTable({
    author: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
  chatStatus: defineTable({
    key: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
