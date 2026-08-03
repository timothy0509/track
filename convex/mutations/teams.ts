"use convex";

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
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

    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      color: args.color,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { teamId };
  },
});

export const update = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", team.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("User is not a member of this workspace");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.color !== undefined) updates.color = args.color;

    await ctx.db.patch(args.teamId, updates);

    return { success: true };
  },
});

export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", team.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("User is not a member of this workspace");

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("byTeam", (q) => q.eq("teamId", args.teamId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.teamId);

    return { success: true };
  },
});

export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", team.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("User is not a member of this workspace");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("byTeamAndUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (existing) throw new Error("User is already a member of this team");

    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      workspaceId: team.workspaceId,
      addedAt: Date.now(),
      addedBy: user._id,
    });

    return { success: true };
  },
});

export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", team.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("User is not a member of this workspace");

    const memberRecord = await ctx.db
      .query("teamMembers")
      .withIndex("byTeamAndUser", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (!memberRecord) throw new Error("User is not a member of this team");

    await ctx.db.delete(memberRecord._id);

    return { success: true };
  },
});
