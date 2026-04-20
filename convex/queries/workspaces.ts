"use convex";

import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserId, requireUser } from "../lib/auth";

export const list = query({
  handler: async (ctx) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return [];

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .collect();

    const workspaces = [];
    for (const membership of memberships) {
      const workspace = await ctx.db.get(membership.workspaceId);
      if (workspace) {
        workspaces.push({
          ...workspace,
          role: membership.role,
          status: membership.status,
        });
      }
    }

    return workspaces;
  },
});

export const getById = query({
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

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    return {
      ...workspace,
      role: membership.role,
      status: membership.status,
    };
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const authId = await getCurrentUserId(ctx);
    if (!authId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", authId))
      .first();

    if (!user) return null;

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("bySlug", (q) => q.eq("slug", args.slug))
      .first();

    if (!workspace) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", workspace._id).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    return {
      ...workspace,
      role: membership.role,
      status: membership.status,
    };
  },
});

export const getMembers = query({
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

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const membersWithUsers = [];
    for (const member of members) {
      const memberUser = await ctx.db.get(member.userId);
      if (memberUser) {
        membersWithUsers.push({
          ...member,
          user: {
            id: memberUser._id,
            name: memberUser.name,
            email: memberUser.email,
            image: memberUser.image,
          },
        });
      }
    }

    return membersWithUsers;
  },
});

export const getMemberRole = query({
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

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    return {
      role: membership.role,
      status: membership.status,
    };
  },
});
