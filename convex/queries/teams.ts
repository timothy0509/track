"use convex";

import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return [];

    const teams = await ctx.db
      .query("teams")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const teamsWithMembers = await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("byTeam", (q) => q.eq("teamId", team._id))
          .collect();

        const membersWithUsers = await Promise.all(
          members.map(async (m) => {
            const memberUser = await ctx.db.get(m.userId);
            return {
              ...m,
              user: memberUser
                ? { name: memberUser.name, email: memberUser.email, image: memberUser.image }
                : null,
            };
          })
        );

        return { ...team, members: membersWithUsers };
      })
    );

    return teamsWithMembers;
  },
});

export const get = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", team.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("byTeam", (q) => q.eq("teamId", team._id))
      .collect();

    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const memberUser = await ctx.db.get(m.userId);
        return {
          ...m,
          user: memberUser
            ? { name: memberUser.name, email: memberUser.email, image: memberUser.image }
            : null,
        };
      })
    );

    return { ...team, members: membersWithUsers };
  },
});
