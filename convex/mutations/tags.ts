"use convex";

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireUser } from "../../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const existing = await ctx.db
      .query("tags")
      .withIndex("byWorkspaceAndName", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .first();

    if (existing) {
      throw new Error("Tag with this name already exists");
    }

    const now = Date.now();
    const tagId = await ctx.db.insert("tags", {
      workspaceId: args.workspaceId,
      name: args.name,
      color: args.color,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { tagId };
  },
});

export const update = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const tag = await ctx.db.get(args.tagId);
    if (!tag) {
      throw new Error("Tag not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", tag.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    if (args.name !== undefined) {
      const existing = await ctx.db
        .query("tags")
        .withIndex("byWorkspaceAndName", (q) =>
          q.eq("workspaceId", tag.workspaceId).eq("name", args.name!)
        )
        .first();

      if (existing && existing._id !== args.tagId) {
        throw new Error("Tag with this name already exists");
      }
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.color !== undefined) updates.color = args.color;

    await ctx.db.patch(args.tagId, updates);

    return { success: true };
  },
});

export const deleteTag = mutation({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const tag = await ctx.db.get(args.tagId);
    if (!tag) {
      throw new Error("Tag not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", tag.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    await ctx.db.delete(args.tagId);

    return { success: true };
  },
});

export const bulkDelete = mutation({
  args: {
    tagIds: v.array(v.id("tags")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    let count = 0;
    for (const tagId of args.tagIds) {
      const tag = await ctx.db.get(tagId);
      if (!tag) continue;

      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("byWorkspaceAndUser", (q) =>
          q.eq("workspaceId", tag.workspaceId).eq("userId", user._id)
        )
        .first();

      if (!membership) continue;

      await ctx.db.delete(tagId);
      count++;
    }

    return { success: true, count };
  },
});
