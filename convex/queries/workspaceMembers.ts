"use convex";

import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "../lib/auth";

export const list = query({
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

export const getById = query({
  args: {
    memberId: v.id("workspaceMembers"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member) return null;

    const memberUser = await ctx.db.get(member.userId);
    if (!memberUser) return null;

    const inviter = await ctx.db.get(member.invitedBy);

    return {
      ...member,
      user: {
        id: memberUser._id,
        name: memberUser.name,
        email: memberUser.email,
        image: memberUser.image,
      },
      inviter: inviter
        ? {
            id: inviter._id,
            name: inviter.name,
            email: inviter.email,
          }
        : null,
    };
  },
});

export const getPendingInvites = query({
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

    const pendingInvites = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "invited"))
      .collect();

    return pendingInvites;
  },
});
