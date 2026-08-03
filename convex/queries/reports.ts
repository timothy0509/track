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

    const reports = await ctx.db
      .query("reports")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return reports.filter(
      (r) => r.ownerId === user._id || r.isPublic || (r.sharedWith && r.sharedWith.includes(user._id))
    );
  },
});

export const get = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) return null;

    if (
      report.ownerId !== user._id &&
      !report.isPublic &&
      !(report.sharedWith && report.sharedWith.includes(user._id))
    ) {
      return null;
    }

    return report;
  },
});
