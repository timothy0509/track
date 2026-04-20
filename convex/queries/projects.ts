"use convex";

import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getCurrentUserId } from "../../lib/auth";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    archived: v.optional(v.boolean()),
    clientId: v.optional(v.id("clients")),
    private: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    let projects;
    if (args.archived !== undefined) {
      projects = await ctx.db
        .query("projects")
        .withIndex("byWorkspaceAndArchived", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("archived", args.archived!)
        )
        .collect();
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();
    }

    if (args.clientId !== undefined) {
      projects = projects.filter((p) => p.clientId === args.clientId);
    }

    if (args.private !== undefined) {
      projects = projects.filter((p) => p.isPrivate === args.private);
    }

    const enriched = [];
    for (const project of projects) {
      let client = null;
      if (project.clientId) {
        client = await ctx.db.get(project.clientId);
      }
      enriched.push({ ...project, client });
    }

    return enriched;
  },
});

export const getById = query({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return null;

    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    let client = null;
    if (project.clientId) {
      client = await ctx.db.get(project.clientId);
    }

    return { ...project, client };
  },
});

export const getDashboard = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", project.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", project.workspaceId))
      .collect();

    const projectEntries = entries.filter(
      (e) => e.projectId === args.projectId && !e.isRunning
    );

    const totalTime = projectEntries.reduce((sum, e) => sum + e.duration, 0);

    let client = null;
    if (project.clientId) {
      client = await ctx.db.get(project.clientId);
    }

    const recentEntries = projectEntries
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 5);

    let budgetStatus = null;
    if (project.budgetType === "hours" && project.estimateHours) {
      const hoursUsed = totalTime / (1000 * 60 * 60);
      budgetStatus = {
        used: hoursUsed,
        total: project.estimateHours,
        percentage: (hoursUsed / project.estimateHours) * 100,
      };
    } else if (
      project.budgetType === "amount" &&
      project.budgetAmount
    ) {
      const rate = project.billableRate || 0;
      const amountUsed = (totalTime / (1000 * 60 * 60)) * rate;
      budgetStatus = {
        used: amountUsed,
        total: project.budgetAmount,
        percentage: (amountUsed / project.budgetAmount) * 100,
      };
    }

    return {
      project: { ...project, client },
      totalTime,
      entryCount: projectEntries.length,
      recentEntries,
      budgetStatus,
    };
  },
});

export const getByClient = query({
  args: {
    clientId: v.id("clients"),
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

    const client = await ctx.db.get(args.clientId);
    if (!client) return [];

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", client.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("byClient", (q) => q.eq("clientId", args.clientId))
      .collect();

    if (args.archived !== undefined) {
      return projects.filter((p) => p.archived === args.archived);
    }

    return projects;
  },
});

export const getMembers = query({
  args: {
    projectId: v.id("projects"),
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

    const projectMembers = await ctx.db
      .query("projectMembers")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .collect();

    const enriched = [];
    for (const pm of projectMembers) {
      const memberUser = await ctx.db.get(pm.userId);
      const addedBy = await ctx.db.get(pm.addedBy);
      enriched.push({
        ...pm,
        user: memberUser,
        addedByUser: addedBy,
      });
    }

    return enriched;
  },
});

export const getTemplates = query({
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

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    const templates = await ctx.db
      .query("projects")
      .withIndex("byTemplate", (q) => q.eq("isTemplate", true))
      .collect();

    return templates.filter((t) => t.workspaceId === args.workspaceId);
  },
});
