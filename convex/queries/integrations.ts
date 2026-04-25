"use convex";

import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .unique();

    if (!membership || membership.status !== "active") {
      return [];
    }

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
    const user = await requireUser(ctx);

    const integration = await ctx.db.get(args.id);
    if (!integration) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", integration.workspaceId).eq("userId", user._id)
      )
      .unique();

    if (!membership || membership.status !== "active") {
      return null;
    }

    return {
      ...integration,
      accessToken: "[REDACTED]",
      refreshToken: "[REDACTED]",
    };
  },
});

export const getForSync = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .unique();

    if (!membership || membership.status !== "active") {
      throw new Error("User is not an active member of this workspace");
    }

    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.workspaceId !== args.workspaceId) {
      throw new Error("Integration not found");
    }

    if (integration.userId && integration.userId !== user._id) {
      throw new Error("Cannot access another user's integration");
    }

    return integration;
  },
});
