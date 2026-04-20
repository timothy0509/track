"use convex";

import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "../lib/auth";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    const integrations = await ctx.db
      .query("integrations")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return integrations.map((i) => ({
      ...i,
      accessToken: "[REDACTED]",
      refreshToken: "[REDACTED]",
    }));
  },
});

export const getById = query({
  args: {
    id: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const integration = await ctx.db.get(args.id);
    if (!integration) return null;

    return {
      ...integration,
      accessToken: "[REDACTED]",
      refreshToken: "[REDACTED]",
    };
  },
});
