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
    paymentStatus: v.optional(v.string()),
  }),
  memberships: defineTable({
    name: v.string(),
    email: v.string(),
    tier: v.union(v.literal("monthly"), v.literal("annual")),
    active: v.boolean(),
    paymentStatus: v.optional(v.string()),
  }),
  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
  }),
  messages: defineTable({
    // New fields
    content: v.optional(v.string()),
    role: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    timestamp: v.optional(v.float64()),
    // Old fields (kept for backwards compatibility)
    author: v.optional(v.string()),
    body: v.optional(v.string()),
    createdAt: v.optional(v.float64()),
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
  payments: defineTable({
    type: v.string(), // "membership" or "booking"
    referenceId: v.string(), // bookingId or membershipId
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    amount: v.number(), // cents
    currency: v.string(), // "usd" or "aed"
    status: v.string(), // "pending" | "paid" | "failed" | "refunded"
    customerEmail: v.string(),
    customerName: v.string(),
    planType: v.optional(v.string()), // "monthly" | "yearly"
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  }),
});
