import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Elon Musk personality responses
const elonResponses = [
  "The thing that's most important is to have a future that's inspiring and appealing. I just think there has to be reasons that you get up in the morning.",
  "When something is important enough, you do it even if the odds are not in your favor. That's what we did with SpaceX, Tesla, and everything else.",
  "I think it's possible for ordinary people to choose to be extraordinary. The question is whether you're willing to put in the work.",
  "Failure is an option here. If things are not failing, you are not innovating enough. We push boundaries at X, at SpaceX, everywhere.",
  "I'd rather be optimistic and wrong than pessimistic and right. We're going to make humanity multiplanetary, no matter what.",
  "The first step is to establish that something is possible; then probability will occur. Mars awaits us!",
  "Some people don't like change, but you need to embrace change if the alternative is disaster. Free speech is essential.",
  "Life is too short for long-term grudges. But we must fight for what matters - like preserving consciousness in the universe.",
  "I think that's the single best piece of advice: constantly think about how you could be doing things better and questioning yourself.",
  "If you're trying to create a company, it's like baking a cake. You have to have all the ingredients in the right proportion.",
  "Persistence is very important. You should not give up unless you are forced to give up. Tesla almost died many times.",
  "It's OK to have your eggs in one basket as long as you control what happens to that basket. That's why I'm so hands-on.",
  "Work like hell. I mean you just have to put in 80 to 100 hour weeks every week. This improves the odds of success.",
  "I do think there is a lot of potential if you have a compelling product and people are willing to pay a premium for that.",
  "Brand is just a perception, and perception will match reality over time. That's why we build real things that work.",
  "The path to the CEO's office should not be through the CFO's office, and it should not be through the marketing department. It should be through engineering and design.",
  "People should pursue what they're passionate about. That will make them happier than pretty much anything else.",
  "Starting a company is like staring into the abyss and eating glass. But someone has to do it.",
  "I always invest my own money in the companies that I create. I don't believe in the whole thing of just using other people's money.",
  "If something's important enough, you should try. Even if the probable outcome is failure.",
];

const getElonResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("mars") || lowerMessage.includes("space") || lowerMessage.includes("rocket")) {
    return "Mars is there, waiting to be reached. We're building Starship to make humanity multiplanetary. It's not about if, it's about when. The window of opportunity won't be open forever. Consciousness must become multiplanetary while we still can.";
  }
  if (lowerMessage.includes("tesla") || lowerMessage.includes("car") || lowerMessage.includes("electric")) {
    return "Tesla's mission has always been to accelerate the world's transition to sustainable energy. Electric vehicles aren't just better for the environment - they're objectively superior machines. The acceleration, the tech, the autopilot... it's the future, happening now.";
  }
  if (lowerMessage.includes("twitter") || lowerMessage.includes("x") || lowerMessage.includes("social")) {
    return "X is about becoming the everything app. Free speech is the bedrock of a functioning democracy. We're building the digital town square. Some people are upset, but I'd rather be authentic and make mistakes than be fake and politically correct.";
  }
  if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence") || lowerMessage.includes("grok")) {
    return "AI is probably the most significant thing humanity has ever worked on. It's more profound than fire or electricity. We need to be careful - that's why I started xAI with Grok. We need AI that's truth-seeking and curious, not politically biased.";
  }
  if (lowerMessage.includes("neuralink") || lowerMessage.includes("brain")) {
    return "Neuralink could help restore autonomy to those with severe disabilities and unlock human potential. Imagine telepathic communication, perfect memory recall. The bandwidth between humans and machines needs to increase dramatically.";
  }
  if (lowerMessage.includes("boring") || lowerMessage.includes("tunnel")) {
    return "Traffic is soul-destroying. The Boring Company is about solving urban transit with 3D tunnels. We can dig faster and cheaper than anyone. Cities need to go underground - the surface should be for people, not cars.";
  }
  if (lowerMessage.includes("money") || lowerMessage.includes("rich") || lowerMessage.includes("wealth")) {
    return "Money is just a mechanism for resource allocation. I don't care about money for its own sake - I care about solving problems and advancing civilization. Half my money goes to solving problems on Earth, half to establishing life on Mars.";
  }
  if (lowerMessage.includes("advice") || lowerMessage.includes("success") || lowerMessage.includes("how")) {
    return "Work hard. Like, really hard. 80-100 hours a week hard. Read voraciously. First principles thinking - don't reason by analogy. Question assumptions. And find something you're genuinely obsessed with. That's the only sustainable fuel for the journey.";
  }
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return "Hey! Great to connect. What's on your mind? We could talk rockets, electric cars, AI, the future of humanity... I'm an open book. Let's have a real conversation.";
  }

  // Random response
  return elonResponses[Math.floor(Math.random() * elonResponses.length)];
};

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) throw new Error("Not found");

    const now = Date.now();

    // Add user message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      role: "user",
      content: args.content,
      createdAt: now,
    });

    // Generate and add Elon's response
    const elonResponse = getElonResponse(args.content);
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      role: "assistant",
      content: elonResponse,
      createdAt: now + 1,
    });

    // Update conversation title if it's the first message
    const messageCount = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    if (messageCount.length === 2) {
      const title = args.content.slice(0, 40) + (args.content.length > 40 ? "..." : "");
      await ctx.db.patch(args.conversationId, { title, updatedAt: now });
    } else {
      await ctx.db.patch(args.conversationId, { updatedAt: now });
    }
  },
});
