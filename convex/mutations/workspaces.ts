"use convex";

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";
import { checkPermission } from "../lib/permissions";

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    currency: v.optional(v.string()),
    weekStart: v.optional(v.union(v.literal("sunday"), v.literal("monday"))),
    timeFormat: v.optional(v.union(v.literal("12h"), v.literal("24h"))),
    dateFormat: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existingSlug = await ctx.db
      .query("workspaces")
      .withIndex("bySlug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingSlug) {
      throw new Error("Workspace slug already exists");
    }

    const now = Date.now();

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      slug: args.slug,
      ownerId: user._id,
      plan: "free",
      currency: args.currency || "USD",
      weekStart: args.weekStart || "monday",
      timeFormat: args.timeFormat || "24h",
      dateFormat: args.dateFormat || "YYYY-MM-DD",
      defaultBillable: false,
      whoCanCreateProjects: "admin",
      defaultProjectVisibility: "workspace",
      ssoEnabled: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: user._id,
      role: "admin",
      status: "active",
      invitedAt: now,
      invitedBy: user._id,
      joinedAt: now,
    });

    return { workspaceId };
  },
});

export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    currency: v.optional(v.string()),
    weekStart: v.optional(v.union(v.literal("sunday"), v.literal("monday"))),
    timeFormat: v.optional(v.union(v.literal("12h"), v.literal("24h"))),
    dateFormat: v.optional(v.string()),
    defaultBillable: v.optional(v.boolean()),
    whoCanCreateProjects: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("projectManager"),
        v.literal("everyone")
      )
    ),
    defaultProjectVisibility: v.optional(
      v.union(v.literal("private"), v.literal("workspace"))
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const hasPermission = await checkPermission(
      ctx,
      args.workspaceId,
      user.authId,
      "admin"
    );

    if (!hasPermission) {
      throw new Error("Only admins can update workspace settings");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.currency !== undefined) updates.currency = args.currency;
    if (args.weekStart !== undefined) updates.weekStart = args.weekStart;
    if (args.timeFormat !== undefined) updates.timeFormat = args.timeFormat;
    if (args.dateFormat !== undefined) updates.dateFormat = args.dateFormat;
    if (args.defaultBillable !== undefined)
      updates.defaultBillable = args.defaultBillable;
    if (args.whoCanCreateProjects !== undefined)
      updates.whoCanCreateProjects = args.whoCanCreateProjects;
    if (args.defaultProjectVisibility !== undefined)
      updates.defaultProjectVisibility = args.defaultProjectVisibility;

    await ctx.db.patch(args.workspaceId, updates);

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const hasPermission = await checkPermission(
      ctx,
      args.workspaceId,
      user.authId,
      "admin"
    );

    if (!hasPermission) {
      throw new Error("Only admins can delete workspaces");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.workspaceId);

    return { success: true };
  },
});
