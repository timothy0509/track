"use convex";

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    estimateHours: v.optional(v.number()),
    billableRate: v.optional(v.number()),
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

    const project = await ctx.db.get(args.projectId);
    if (!project || project.workspaceId !== args.workspaceId) {
      throw new Error("Invalid project");
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      color: args.color,
      archived: false,
      estimateHours: args.estimateHours,
      billableRate: args.billableRate,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { taskId };
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    estimateHours: v.optional(v.number()),
    billableRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", task.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.color !== undefined) updates.color = args.color;
    if (args.estimateHours !== undefined) updates.estimateHours = args.estimateHours;
    if (args.billableRate !== undefined) updates.billableRate = args.billableRate;

    await ctx.db.patch(args.taskId, updates);

    return { success: true };
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", task.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    await ctx.db.delete(args.taskId);

    return { success: true };
  },
});

export const archive = mutation({
  args: {
    taskId: v.id("tasks"),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", task.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    await ctx.db.patch(args.taskId, {
      archived: args.archived,
      archivedAt: args.archived ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const bulkUpdate = mutation({
  args: {
    taskIds: v.array(v.id("tasks")),
    updates: v.object({
      estimateHours: v.optional(v.number()),
      billableRate: v.optional(v.number()),
      color: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    let count = 0;
    for (const taskId of args.taskIds) {
      const task = await ctx.db.get(taskId);
      if (!task) continue;

      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("byWorkspaceAndUser", (q) =>
          q.eq("workspaceId", task.workspaceId).eq("userId", user._id)
        )
        .first();

      if (!membership) continue;

      const patch: Record<string, any> = { updatedAt: Date.now() };
      if (args.updates.estimateHours !== undefined) patch.estimateHours = args.updates.estimateHours;
      if (args.updates.billableRate !== undefined) patch.billableRate = args.updates.billableRate;
      if (args.updates.color !== undefined) patch.color = args.updates.color;

      await ctx.db.patch(taskId, patch);
      count++;
    }

    return { success: true, count };
  },
});
