"use convex";

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireUser } from "../../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    clientId: v.optional(v.id("clients")),
    isPrivate: v.boolean(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    estimateHours: v.optional(v.number()),
    budgetAmount: v.optional(v.number()),
    budgetType: v.optional(v.union(v.literal("hours"), v.literal("amount"), v.literal("fixedFee"))),
    fixedFee: v.optional(v.number()),
    billableRate: v.optional(v.number()),
    billableRateType: v.optional(v.union(v.literal("workspace"), v.literal("project"), v.literal("custom"))),
    alertThreshold: v.optional(v.number()),
    isTemplate: v.boolean(),
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

    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.workspaceId !== args.workspaceId) {
        throw new Error("Invalid client");
      }
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      color: args.color,
      clientId: args.clientId,
      isPrivate: args.isPrivate,
      archived: false,
      startDate: args.startDate,
      endDate: args.endDate,
      estimateHours: args.estimateHours,
      budgetAmount: args.budgetAmount,
      budgetType: args.budgetType,
      fixedFee: args.fixedFee,
      billableRate: args.billableRate,
      billableRateType: args.billableRateType,
      alertThreshold: args.alertThreshold,
      isTemplate: args.isTemplate,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { projectId };
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
    isPrivate: v.optional(v.boolean()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    estimateHours: v.optional(v.number()),
    budgetAmount: v.optional(v.number()),
    budgetType: v.optional(v.union(v.literal("hours"), v.literal("amount"), v.literal("fixedFee"))),
    fixedFee: v.optional(v.number()),
    billableRate: v.optional(v.number()),
    billableRateType: v.optional(v.union(v.literal("workspace"), v.literal("project"), v.literal("custom"))),
    alertThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    if (args.clientId !== undefined) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.workspaceId !== project.workspaceId) {
        throw new Error("Invalid client");
      }
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.color !== undefined) updates.color = args.color;
    if (args.clientId !== undefined) updates.clientId = args.clientId;
    if (args.isPrivate !== undefined) updates.isPrivate = args.isPrivate;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.estimateHours !== undefined) updates.estimateHours = args.estimateHours;
    if (args.budgetAmount !== undefined) updates.budgetAmount = args.budgetAmount;
    if (args.budgetType !== undefined) updates.budgetType = args.budgetType;
    if (args.fixedFee !== undefined) updates.fixedFee = args.fixedFee;
    if (args.billableRate !== undefined) updates.billableRate = args.billableRate;
    if (args.billableRateType !== undefined) updates.billableRateType = args.billableRateType;
    if (args.alertThreshold !== undefined) updates.alertThreshold = args.alertThreshold;

    await ctx.db.patch(args.projectId, updates);

    return { success: true };
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    const members = await ctx.db
      .query("projectMembers")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});

export const archive = mutation({
  args: {
    projectId: v.id("projects"),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    await ctx.db.patch(args.projectId, {
      archived: args.archived,
      archivedAt: args.archived ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const bulkUpdate = mutation({
  args: {
    projectIds: v.array(v.id("projects")),
    updates: v.object({
      clientId: v.optional(v.id("clients")),
      isPrivate: v.optional(v.boolean()),
      billableRate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    let count = 0;
    for (const projectId of args.projectIds) {
      const project = await ctx.db.get(projectId);
      if (!project) continue;

      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("byWorkspaceAndUser", (q) =>
          q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
        )
        .first();

      if (!membership) continue;

      const patch: Record<string, any> = { updatedAt: Date.now() };
      if (args.updates.clientId !== undefined) patch.clientId = args.updates.clientId;
      if (args.updates.isPrivate !== undefined) patch.isPrivate = args.updates.isPrivate;
      if (args.updates.billableRate !== undefined) patch.billableRate = args.updates.billableRate;

      await ctx.db.patch(projectId, patch);
      count++;
    }

    return { success: true, count };
  },
});

export const bulkArchive = mutation({
  args: {
    projectIds: v.array(v.id("projects")),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    let count = 0;
    for (const projectId of args.projectIds) {
      const project = await ctx.db.get(projectId);
      if (!project) continue;

      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("byWorkspaceAndUser", (q) =>
          q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
        )
        .first();

      if (!membership) continue;

      await ctx.db.patch(projectId, {
        archived: args.archived,
        archivedAt: args.archived ? Date.now() : undefined,
        updatedAt: Date.now(),
      });
      count++;
    }

    return { success: true, count };
  },
});

export const addMember = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("manager"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("byProjectAndUser", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("User is already a member of this project");
    }

    await ctx.db.insert("projectMembers", {
      projectId: args.projectId,
      userId: args.userId,
      workspaceId: project.workspaceId,
      role: args.role,
      addedAt: Date.now(),
      addedBy: user._id,
    });

    return { success: true };
  },
});

export const removeMember = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const projectMember = await ctx.db
      .query("projectMembers")
      .withIndex("byProjectAndUser", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();

    if (!projectMember) {
      throw new Error("User is not a member of this project");
    }

    await ctx.db.delete(projectMember._id);

    return { success: true };
  },
});
