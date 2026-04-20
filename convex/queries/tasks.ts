"use convex";

import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getCurrentUserId } from "../../lib/auth";

export const list = query({
  args: {
    projectId: v.id("projects"),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    let tasks;
    if (args.archived !== undefined) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("byProjectAndArchived", (q) =>
          q.eq("projectId", args.projectId).eq("archived", args.archived!)
        )
        .collect();
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
        .collect();
    }

    return tasks;
  },
});

export const getById = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return null;

    const task = await ctx.db.get(args.id);
    if (!task) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", task.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    return task;
  },
});

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    let tasks;
    if (args.archived !== undefined) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("byProjectAndArchived", (q) =>
          q.eq("projectId", args.projectId).eq("archived", args.archived!)
        )
        .collect();
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
        .collect();
    }

    return tasks;
  },
});
