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
    sessionId: v.string(),
    role: v.string(),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_session_timestamp", ["sessionId", "timestamp"]),
  chatSessions: defineTable({
    visitorName: v.string(),
    visitorEmail: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
    startedAt: v.number(),
    lastMessageAt: v.number(),
    messageCount: v.number(),
  }),
});
