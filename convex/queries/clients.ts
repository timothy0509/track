"use convex";

import { query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { getCurrentUserId } from "../lib/auth";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
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

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    let clients;
    if (args.archived !== undefined) {
      clients = await ctx.db
        .query("clients")
        .withIndex("byWorkspaceAndArchived", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("archived", args.archived!)
        )
        .collect();
    } else {
      clients = await ctx.db
        .query("clients")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();
    }

    return clients;
  },
});

export const getById = query({
  args: {
    id: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return null;

    const client = await ctx.db.get(args.id);
    if (!client) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", client.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    return client;
  },
});

export const getWithProjectCount = query({
  args: {
    workspaceId: v.id("workspaces"),
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

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    let clients;
    if (args.archived !== undefined) {
      clients = await ctx.db
        .query("clients")
        .withIndex("byWorkspaceAndArchived", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("archived", args.archived!)
        )
        .collect();
    } else {
      clients = await ctx.db
        .query("clients")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const result = clients.map((client) => {
      const projectCount = projects.filter(
        (p) => p.clientId === client._id
      ).length;
      return { ...client, projectCount };
    });

    return result;
  },
});

export const search = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
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

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    let clients;
    if (args.archived !== undefined) {
      clients = await ctx.db
        .query("clients")
        .withIndex("byWorkspaceAndArchived", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("archived", args.archived!)
        )
        .collect();
    } else {
      clients = await ctx.db
        .query("clients")
        .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();
    }

    const lowerQuery = args.query.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        (c.email && c.email.toLowerCase().includes(lowerQuery))
    );
  },
});
