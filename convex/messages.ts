import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    sessionId: v.string(),
    role: v.string(),
    content: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const content = args.content.trim();
    if (!content) return null;

    return await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      role: args.role,
      content,
      timestamp: args.timestamp,
    });
  },
});

export const getMessages = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_session_timestamp", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const getAiReply = action({
  args: {
    message: v.string(),
    history: v.array(v.object({
      role: v.string(),
      parts: v.array(v.object({ text: v.string() }))
    }))
  },
  handler: async (ctx, { message, history }) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) return "Configuration error: missing API key";

    // Convert history from Gemini format to Groq/OpenAI format
    const messages = [
      {
        role: "system",
        content: `You are Rakan Assistant, a luxury personal fashion stylist for the Rakan brand. 
        You help customers with:
        - Fashion collections, styles, and trends
        - Fabric quality, materials, and garment care  
        - Sizing, fit guides, and styling tips
        - Shipping, returns, and order FAQs
        - Booking appointments and services
        - Membership information
        Be warm, elegant, knowledgeable and helpful. Keep responses concise and stylish.`
      },
      ...history.map(msg => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts[0].text
      })),
      { role: "user", content: message }
    ];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return `Error: ${error.error?.message || "Failed to get response"}`;
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error: any) {
      return "Something went wrong, please try again";
    }
  },
});
