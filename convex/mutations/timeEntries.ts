"use convex";

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireUser } from "../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    tagIds: v.optional(v.array(v.id("tags"))),
    startTime: v.number(),
    endTime: v.number(),
    billable: v.boolean(),
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

    const duration = args.endTime - args.startTime;
    const now = Date.now();

    const entryId = await ctx.db.insert("timeEntries", {
      workspaceId: args.workspaceId,
      userId: user._id,
      description: args.description,
      projectId: args.projectId,
      taskId: args.taskId,
      tagIds: args.tagIds,
      startTime: args.startTime,
      endTime: args.endTime,
      duration,
      isRunning: false,
      billable: args.billable,
      billableRate: args.billableRate,
      isFavorite: false,
      source: "manual",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: now,
      updatedAt: now,
    });

    return { entryId };
  },
});

export const startTimer = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    tagIds: v.optional(v.array(v.id("tags"))),
    billable: v.boolean(),
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

    const existingRunning = await ctx.db
      .query("timeEntries")
      .withIndex("byUserAndRunning", (q) =>
        q.eq("userId", user._id).eq("isRunning", true)
      )
      .first();

    if (existingRunning) {
      const duration = Date.now() - existingRunning.startTime;
      await ctx.db.patch(existingRunning._id, {
        isRunning: false,
        endTime: Date.now(),
        duration,
        updatedAt: Date.now(),
      });
    }

    const now = Date.now();

    const entryId = await ctx.db.insert("timeEntries", {
      workspaceId: args.workspaceId,
      userId: user._id,
      description: args.description,
      projectId: args.projectId,
      taskId: args.taskId,
      tagIds: args.tagIds,
      startTime: now,
      duration: 0,
      isRunning: true,
      billable: args.billable,
      isFavorite: false,
      source: "timer",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: now,
      updatedAt: now,
    });

    return { entryId };
  },
});

export const stopTimer = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Time entry not found");
    }

    if (entry.userId !== user._id) {
      throw new Error("Cannot stop another user's timer");
    }

    if (!entry.isRunning) {
      throw new Error("Timer is not running");
    }

    const now = Date.now();
    const duration = now - entry.startTime;

    await ctx.db.patch(args.entryId, {
      isRunning: false,
      endTime: now,
      duration,
      updatedAt: now,
    });

    return { entryId: args.entryId, duration };
  },
});

export const update = mutation({
  args: {
    entryId: v.id("timeEntries"),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    tagIds: v.optional(v.array(v.id("tags"))),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    billable: v.optional(v.boolean()),
    billableRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Time entry not found");
    }

    if (entry.userId !== user._id) {
      throw new Error("Cannot update another user's time entry");
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.description !== undefined) updates.description = args.description;
    if (args.projectId !== undefined) updates.projectId = args.projectId;
    if (args.taskId !== undefined) updates.taskId = args.taskId;
    if (args.tagIds !== undefined) updates.tagIds = args.tagIds;
    if (args.billable !== undefined) updates.billable = args.billable;
    if (args.billableRate !== undefined) updates.billableRate = args.billableRate;

    if (args.startTime !== undefined || args.endTime !== undefined) {
      const newStartTime = args.startTime ?? entry.startTime;
      const newEndTime = args.endTime ?? entry.endTime;

      if (newEndTime !== undefined) {
        updates.startTime = newStartTime;
        updates.endTime = newEndTime;
        updates.duration = newEndTime - newStartTime;
      } else if (args.startTime !== undefined) {
        updates.startTime = args.startTime;
        if (entry.endTime) {
          updates.duration = entry.endTime - args.startTime;
        }
      }
    }

    await ctx.db.patch(args.entryId, updates);

    return { success: true };
  },
});

export const deleteEntry = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Time entry not found");
    }

    if (entry.userId !== user._id) {
      throw new Error("Cannot delete another user's time entry");
    }

    await ctx.db.delete(args.entryId);

    return { success: true };
  },
});

export const toggleFavorite = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Time entry not found");
    }

    if (entry.userId !== user._id) {
      throw new Error("Cannot modify another user's time entry");
    }

    await ctx.db.patch(args.entryId, {
      isFavorite: !entry.isFavorite,
      updatedAt: Date.now(),
    });

    return { success: true, isFavorite: !entry.isFavorite };
  },
});

export const share = mutation({
  args: {
    entryId: v.id("timeEntries"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Time entry not found");
    }

    if (entry.userId !== user._id) {
      throw new Error("Cannot share another user's time entry");
    }

    const sharedWith = entry.sharedWith ?? [];
    if (sharedWith.includes(args.userId)) {
      throw new Error("Entry already shared with this user");
    }

    await ctx.db.patch(args.entryId, {
      sharedWith: [...sharedWith, args.userId],
      sharedBy: user._id,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const acceptShare = mutation({
  args: {
    entryId: v.id("timeEntries"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Time entry not found");
    }

    const sharedWith = entry.sharedWith ?? [];
    if (!sharedWith.includes(user._id)) {
      throw new Error("Entry is not shared with you");
    }

    const accepted = entry.sharedAccepted ?? [];
    if (accepted.includes(user._id)) {
      throw new Error("Share already accepted");
    }

    await ctx.db.patch(args.entryId, {
      sharedAccepted: [...accepted, user._id],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const unshare = mutation({
  args: {
    entryId: v.id("timeEntries"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Time entry not found");
    }

    if (entry.userId !== user._id) {
      throw new Error("Cannot unshare another user's time entry");
    }

    const sharedWith = entry.sharedWith ?? [];
    const accepted = entry.sharedAccepted ?? [];

    await ctx.db.patch(args.entryId, {
      sharedWith: sharedWith.filter((id) => id !== args.userId),
      sharedAccepted: accepted.filter((id) => id !== args.userId),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
