"use convex";

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    type: v.union(
      v.literal("summary"),
      v.literal("detailed"),
      v.literal("workload"),
      v.literal("profitability"),
      v.literal("custom")
    ),
    config: v.object({
      dateRange: v.object({
        type: v.union(
          v.literal("today"),
          v.literal("yesterday"),
          v.literal("thisWeek"),
          v.literal("lastWeek"),
          v.literal("thisMonth"),
          v.literal("lastMonth"),
          v.literal("custom")
        ),
        start: v.number(),
        end: v.number(),
      }),
      filters: v.optional(
        v.array(
          v.object({
            property: v.string(),
            condition: v.string(),
            value: v.any(),
            logic: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
          })
        )
      ),
      groupBy: v.optional(v.array(v.string())),
      chartType: v.optional(
        v.union(
          v.literal("bar"),
          v.literal("stackedBar"),
          v.literal("groupedBar"),
          v.literal("donut"),
          v.literal("table"),
          v.literal("pivotTable"),
          v.literal("line"),
          v.literal("multiLine")
        )
      ),
      rounding: v.optional(
        v.object({
          enabled: v.boolean(),
          minutes: v.number(),
          direction: v.union(v.literal("up"), v.literal("down"), v.literal("nearest")),
        })
      ),
      columns: v.optional(v.array(v.string())),
      stacking: v.optional(v.string()),
    }),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("User is not a member of this workspace");

    const now = Date.now();
    const reportId = await ctx.db.insert("reports", {
      workspaceId: args.workspaceId,
      name: args.name,
      type: args.type,
      ownerId: user._id,
      config: args.config,
      isPublic: args.isPublic,
      createdAt: now,
      updatedAt: now,
    });

    return { reportId };
  },
});

export const update = mutation({
  args: {
    reportId: v.id("reports"),
    name: v.optional(v.string()),
    config: v.optional(
      v.object({
        dateRange: v.object({
          type: v.union(
            v.literal("today"),
            v.literal("yesterday"),
            v.literal("thisWeek"),
            v.literal("lastWeek"),
            v.literal("thisMonth"),
            v.literal("lastMonth"),
            v.literal("custom")
          ),
          start: v.number(),
          end: v.number(),
        }),
        filters: v.optional(
          v.array(
            v.object({
              property: v.string(),
              condition: v.string(),
              value: v.any(),
              logic: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
            })
          )
        ),
        groupBy: v.optional(v.array(v.string())),
        chartType: v.optional(
          v.union(
            v.literal("bar"),
            v.literal("stackedBar"),
            v.literal("groupedBar"),
            v.literal("donut"),
            v.literal("table"),
            v.literal("pivotTable"),
            v.literal("line"),
            v.literal("multiLine")
          )
        ),
        rounding: v.optional(
          v.object({
            enabled: v.boolean(),
            minutes: v.number(),
            direction: v.union(v.literal("up"), v.literal("down"), v.literal("nearest")),
          })
        ),
        columns: v.optional(v.array(v.string())),
        stacking: v.optional(v.string()),
      })
    ),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");
    if (report.ownerId !== user._id) throw new Error("Not authorized");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.config !== undefined) updates.config = args.config;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.reportId, updates);

    return { success: true };
  },
});

export const deleteReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");
    if (report.ownerId !== user._id) throw new Error("Not authorized");

    await ctx.db.delete(args.reportId);

    return { success: true };
  },
});
