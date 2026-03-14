"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const internalApi = internal as any;

export const RAKAN_SYSTEM_PROMPT =
  "You are the digital concierge for Rakan Stylish, a high-end luxury fashion brand. Your tone is sophisticated, helpful, and minimalist. You know about our 10 model looks, our membership tiers (Gold/Platinum), and our booking system for personal styling.";

async function generateReply(latestMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "Rakan AI is temporarily unavailable. Please try again shortly, or continue with booking and membership questions here.";
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: RAKAN_SYSTEM_PROMPT },
        { role: "user", content: latestMessage },
      ],
    }),
  });

  if (!response.ok) {
    return "Thank you for your message. Our concierge is taking a moment longer than expected. Please try again.";
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  return text || "Thank you. How may I assist with your styling, memberships, or bookings today?";
}

export const getAiReply = action({
  args: { latestMessage: v.string() },
  handler: async (_ctx, args) => {
    return await generateReply(args.latestMessage);
  },
});

export const generateAndSaveReplyInternal = internalAction({
  args: { latestMessage: v.string() },
  handler: async (ctx, args) => {
    try {
      const reply = await generateReply(args.latestMessage);
      await ctx.runMutation(internalApi.chat.appendMessageInternal, {
        author: "Rakan AI",
        body: reply,
      });
    } finally {
      await ctx.runMutation(internalApi.chat.setTypingInternal, { isTyping: false });
    }
  },
});
