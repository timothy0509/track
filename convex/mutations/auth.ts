import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();

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
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const userId = await ctx.db.insert("users", {
      authId: `legacy:${args.email}`,
      email: args.email,
      emailVerified: false,
      name: args.name,
      timezone: "UTC",
      weekStart: "monday",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "24h",
      currency: "USD",
      defaultBillable: false,
      emailNotifications: {
        projectAdded: true,
        teamReminders: true,
        reportScheduled: true,
        budgetAlerts: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      id: userId,
      email: args.email,
      name: args.name,
    };
  },
});
