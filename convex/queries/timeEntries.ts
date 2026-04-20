"use convex";

import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getCurrentUserId } from "../lib/auth";

async function enrichEntry(ctx: any, entry: any) {
  let project = null;
  if (entry.projectId) {
    project = await ctx.db.get(entry.projectId);
  }

  let task = null;
  if (entry.taskId) {
    task = await ctx.db.get(entry.taskId);
  }

  let tags: any[] = [];
  if (entry.tagIds && entry.tagIds.length > 0) {
    for (const tagId of entry.tagIds) {
      const tag = await ctx.db.get(tagId);
      if (tag) tags.push(tag);
    }
  }

  let sharedWithUsers: any[] = [];
  if (entry.sharedWith && entry.sharedWith.length > 0) {
    for (const userId of entry.sharedWith) {
      const u = await ctx.db.get(userId);
      if (u) sharedWithUsers.push(u);
    }
  }

  return {
    ...entry,
    project,
    task,
    tags,
    sharedWithUsers,
  };
}

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    tagIds: v.optional(v.array(v.id("tags"))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return { entries: [], hasMore: false };

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return { entries: [], hasMore: false };

    let q = ctx.db
      .query("timeEntries")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId));

    if (args.startDate !== undefined) {
      q = q.withIndex("byWorkspaceAndDate", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("startTime", args.startDate!)
      );
    }

    let entries = await q.collect();

    entries = entries.filter((e) => e.userId === user._id);

    if (args.endDate !== undefined) {
      entries = entries.filter((e) => e.startTime <= args.endDate!);
    }

    if (args.projectId !== undefined) {
      entries = entries.filter((e) => e.projectId === args.projectId);
    }

    if (args.taskId !== undefined) {
      entries = entries.filter((e) => e.taskId === args.taskId);
    }

    if (args.tagIds !== undefined && args.tagIds.length > 0) {
      entries = entries.filter(
        (e) =>
          e.tagIds && args.tagIds!.some((tagId) => e.tagIds!.includes(tagId))
      );
    }

    entries.sort((a, b) => b.startTime - a.startTime);

    const limit = args.limit ?? 50;
    const cursor = args.cursor ?? 0;
    const sliced = entries.slice(cursor, cursor + limit);

    const enriched = [];
    for (const entry of sliced) {
      enriched.push(await enrichEntry(ctx, entry));
    }

    return {
      entries: enriched,
      hasMore: cursor + limit < entries.length,
      nextCursor: cursor + limit < entries.length ? cursor + limit : undefined,
    };
  },
});

export const getById = query({
  args: {
    id: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const entry = await ctx.db.get(args.id);
    if (!entry) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user || entry.userId !== user._id) return null;

    return enrichEntry(ctx, entry);
  },
});

export const getRunning = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return null;

    const running = await ctx.db
      .query("timeEntries")
      .withIndex("byUserAndRunning", (q) =>
        q.eq("userId", user._id).eq("isRunning", true)
      )
      .first();

    if (!running) return null;

    return enrichEntry(ctx, running);
  },
});

export const getToday = query({
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

    const now = Date.now();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("byWorkspaceAndDate", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("startTime", startOfDay.getTime())
      )
      .collect();

    const userEntries = entries.filter((e) => e.userId === user._id);
    userEntries.sort((a, b) => b.startTime - a.startTime);

    const enriched = [];
    for (const entry of userEntries) {
      enriched.push(await enrichEntry(ctx, entry));
    }

    return enriched;
  },
});

export const getStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return { todayTotal: 0, weekTotal: 0, entryCount: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return { todayTotal: 0, weekTotal: 0, entryCount: 0 };

    const now = Date.now();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfDay);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("byWorkspaceAndDate", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("startTime", startOfWeek.getTime())
      )
      .collect();

    const userEntries = entries.filter(
      (e) => e.userId === user._id && !e.isRunning
    );

    let todayTotal = 0;
    let weekTotal = 0;

    for (const entry of userEntries) {
      weekTotal += entry.duration;
      if (entry.startTime >= startOfDay.getTime()) {
        todayTotal += entry.duration;
      }
    }

    return {
      todayTotal,
      weekTotal,
      entryCount: userEntries.length,
    };
  },
});

export const getProjects = query({
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

    const projects = await ctx.db
      .query("projects")
      .withIndex("byWorkspaceAndArchived", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("archived", false)
      )
      .collect();

    return projects;
  },
});

export const getTasks = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    let tasks;
    if (args.projectId) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("byProjectAndArchived", (q) =>
          q.eq("projectId", args.projectId!).eq("archived", false)
        )
        .collect();
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();
      tasks = tasks.filter((t) => !t.archived);
    }

    return tasks;
  },
});

export const getTags = query({
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

    const tags = await ctx.db
      .query("tags")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return tags;
  },
});

export const getDescriptionSuggestions = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const userEntries = entries.filter(
      (e) => e.userId === user._id && e.description && e.description.toLowerCase().includes(args.query.toLowerCase())
    );

    const descriptions = [...new Set(userEntries.map((e) => e.description!))];
    return descriptions.slice(0, 10);
  },
});

export const getShared = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return { sharedWithMe: [], sharedByMe: [] };

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return { sharedWithMe: [], sharedByMe: [] };

    const allEntries = await ctx.db
      .query("timeEntries")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const sharedWithMe = allEntries.filter(
      (e) => e.sharedWith && e.sharedWith.includes(user._id) && e.userId !== user._id
    );

    const sharedByMe = allEntries.filter(
      (e) => e.sharedBy === user._id && e.sharedWith && e.sharedWith.length > 0
    );

    const enrichedWithMe = [];
    for (const entry of sharedWithMe) {
      enrichedWithMe.push(await enrichEntry(ctx, entry));
    }

    const enrichedByMe = [];
    for (const entry of sharedByMe) {
      enrichedByMe.push(await enrichEntry(ctx, entry));
    }

    return {
      sharedWithMe: enrichedWithMe,
      sharedByMe: enrichedByMe,
    };
  },
});

export const getFavorites = query({
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

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const favorites = entries.filter(
      (e) => e.userId === user._id && e.isFavorite
    );

    favorites.sort((a, b) => b.startTime - a.startTime);

    const enriched = [];
    for (const entry of favorites) {
      enriched.push(await enrichEntry(ctx, entry));
    }

    return enriched;
  },
});

export const getCalendarEntries = query({
  args: {
    workspaceId: v.id("workspaces"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("byWorkspaceAndDate", (q) =>
        q.eq("workspaceId", args.workspaceId).gte("startTime", args.startDate)
      )
      .collect();

    const filtered = entries.filter(
      (e) => e.userId === user._id && e.startTime <= args.endDate && !e.isRunning
    );

    const enriched = [];
    for (const entry of filtered) {
      enriched.push(await enrichEntry(ctx, entry));
    }

    return enriched;
  },
});
