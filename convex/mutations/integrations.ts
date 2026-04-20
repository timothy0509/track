"use convex";

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireUser } from "../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.union(v.literal("googleCalendar"), v.literal("outlookCalendar")),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    scopes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const now = Date.now();

    const existing = await ctx.db
      .query("integrations")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        scopes: args.scopes,
        updatedAt: now,
      });

      return { integrationId: existing._id };
    }

    const integrationId = await ctx.db.insert("integrations", {
      workspaceId: args.workspaceId,
      userId: user._id,
      type: args.type,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      expiresAt: args.expiresAt,
      scopes: args.scopes,
      createdAt: now,
      updatedAt: now,
    });

    return { integrationId };
  },
});

export const disconnect = mutation({
  args: {
    integrationId: v.id("integrations"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const integration = await ctx.db.get(args.integrationId);
    if (!integration) {
      throw new Error("Integration not found");
    }

    if (integration.userId && integration.userId !== user._id) {
      throw new Error("Cannot disconnect another user's integration");
    }

    await ctx.db.delete(args.integrationId);

    return { success: true };
  },
});
