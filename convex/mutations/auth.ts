import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    return {
      id: existingUser._id,
      email: existingUser.email,
      name: existingUser.name,
    };
  },
});

export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });

    return {
      id: userId,
      email: args.email,
      name: args.name,
    };
  },
});
