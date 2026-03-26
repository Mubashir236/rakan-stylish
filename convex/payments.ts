import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

async function stripeRequest(endpoint: string, body: Record<string, any>) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") {
      for (const [k, v2] of Object.entries(value as any)) {
        if (v2 === undefined || v2 === null) continue;
        params.append(`${key}[${k}]`, String(v2));
      }
    } else {
      params.append(key, String(value));
    }
  }

  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  return await response.json();
}

async function stripeGet(endpoint: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");

  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  return await response.json();
}

export const createPayment = internalMutation({
  args: {
    type: v.string(),
    referenceId: v.string(),
    stripeSessionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    customerEmail: v.string(),
    customerName: v.string(),
    planType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      ...args,
      createdAt: Date.now(),
      paidAt: undefined,
      stripePaymentIntentId: undefined,
    });
  },
});

export const markPaymentPaid = internalMutation({
  args: {
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("stripeSessionId"), args.stripeSessionId))
      .first();

    if (!payment) return null;

    await ctx.db.patch(payment._id, {
      status: "paid",
      paidAt: Date.now(),
      stripePaymentIntentId: args.stripePaymentIntentId,
    });

    return payment;
  },
});

export const setBookingPaymentStatus = internalMutation({
  args: { bookingId: v.id("bookings"), paymentStatus: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { paymentStatus: args.paymentStatus });
  },
});

export const setMembershipPaymentStatus = internalMutation({
  args: { membershipId: v.id("memberships"), paymentStatus: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.membershipId, { paymentStatus: args.paymentStatus });
  },
});

export const createMembershipCheckout = action({
  args: {
    planType: v.union(v.literal("monthly"), v.literal("yearly")),
    customerName: v.string(),
    customerEmail: v.string(),
    membershipId: v.id("memberships"),
    siteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const PRICES = {
      monthly: { amount: 9900, label: "Rakan Monthly Membership" },
      yearly: { amount: 99900, label: "Rakan Yearly Membership" },
    } as const;

    const siteUrl = args.siteUrl ?? process.env.SITE_URL ?? "http://localhost:8080";
    const price = PRICES[args.planType];

    const session = await stripeRequest("checkout/sessions", {
      "payment_method_types[0]": "card",
      mode: "payment",
      customer_email: args.customerEmail,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": price.label,
      "line_items[0][price_data][unit_amount]": price.amount,
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=membership`,
      cancel_url: `${siteUrl}/membership?cancelled=true`,
      metadata: {
        membershipId: args.membershipId,
        planType: args.planType,
        customerName: args.customerName,
        type: "membership",
      },
    });

    if (!session?.id || !session?.url) {
      throw new Error("Stripe session creation failed");
    }

    await ctx.runMutation(internal.payments.createPayment, {
      type: "membership",
      referenceId: args.membershipId,
      stripeSessionId: session.id,
      amount: price.amount,
      currency: "usd",
      status: "pending",
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      planType: args.planType,
    });

    await ctx.runMutation(internal.payments.setMembershipPaymentStatus, {
      membershipId: args.membershipId,
      paymentStatus: "pending",
    });

    return { checkoutUrl: session.url as string };
  },
});

export const createBookingCheckout = action({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    bookingId: v.id("bookings"),
    serviceType: v.string(),
    amount: v.number(),
    siteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const siteUrl = args.siteUrl ?? process.env.SITE_URL ?? "http://localhost:8080";
    const chargeAmount = args.amount > 0 ? args.amount : 15000;

    const session = await stripeRequest("checkout/sessions", {
      "payment_method_types[0]": "card",
      mode: "payment",
      customer_email: args.customerEmail,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": args.serviceType,
      "line_items[0][price_data][unit_amount]": chargeAmount,
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=booking`,
      cancel_url: `${siteUrl}/booking?cancelled=true`,
      metadata: {
        bookingId: args.bookingId,
        customerName: args.customerName,
        type: "booking",
      },
    });

    if (!session?.id || !session?.url) {
      throw new Error("Stripe session creation failed");
    }

    await ctx.runMutation(internal.payments.createPayment, {
      type: "booking",
      referenceId: args.bookingId,
      stripeSessionId: session.id,
      amount: chargeAmount,
      currency: "usd",
      status: "pending",
      customerEmail: args.customerEmail,
      customerName: args.customerName,
    });

    await ctx.runMutation(internal.payments.setBookingPaymentStatus, {
      bookingId: args.bookingId,
      paymentStatus: "pending",
    });

    return { checkoutUrl: session.url as string };
  },
});

export const markPaymentAsPaid = internalMutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("stripeSessionId"), sessionId))
      .first();

    if (payment) {
      await ctx.db.patch(payment._id, {
        status: "paid",
        paidAt: Date.now(),
      });

      if (payment.type === "booking" && payment.referenceId) {
        const booking = await ctx.db.get(payment.referenceId as any);
        if (booking) {
          await ctx.db.patch(booking._id, { paymentStatus: "paid" });
        }
      }

      if (payment.type === "membership" && payment.referenceId) {
        const membership = await ctx.db.get(payment.referenceId as any);
        if (membership) {
          await ctx.db.patch(membership._id, { paymentStatus: "paid" });
        }
      }
    }
  },
});

export const verifyPayment = action({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const session = await response.json();

    if (
      session.payment_status === "paid" ||
      session.status === "complete"
    ) {
      await ctx.runMutation(internal.payments.markPaymentAsPaid, {
        sessionId,
      });

      return {
        success: true,
        type: session.metadata?.type ?? "",
        referenceId:
          session.metadata?.membershipId ??
          session.metadata?.bookingId ??
          "",
      };
    }

    return { success: false };
  },
});

export const getAllPayments = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();
    return payments.sort((a, b) => b.createdAt - a.createdAt);
  },
});

