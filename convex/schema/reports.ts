"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const reports = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  type: v.union(v.literal("summary"), v.literal("detailed"), v.literal("workload"), v.literal("profitability"), v.literal("custom")),
  ownerId: v.id("users"),
  config: v.object({
    dateRange: v.object({
      type: v.union(v.literal("today"), v.literal("yesterday"), v.literal("thisWeek"), v.literal("lastWeek"), v.literal("thisMonth"), v.literal("lastMonth"), v.literal("custom")),
      start: v.number(),
      end: v.number(),
    }),
    filters: v.optional(v.array(v.object({
      property: v.string(),
      condition: v.string(),
      value: v.any(),
      logic: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
    }))),
    groupBy: v.optional(v.array(v.string())),
    chartType: v.optional(v.union(v.literal("bar"), v.literal("stackedBar"), v.literal("groupedBar"), v.literal("donut"), v.literal("table"), v.literal("pivotTable"), v.literal("line"), v.literal("multiLine"))),
    rounding: v.optional(v.object({
      enabled: v.boolean(),
      minutes: v.number(),
      direction: v.union(v.literal("up"), v.literal("down"), v.literal("nearest")),
    })),
    columns: v.optional(v.array(v.string())),
    stacking: v.optional(v.string()),
  }),
  sharedWith: v.optional(v.array(v.id("users"))),
  isPublic: v.boolean(),
  scheduled: v.optional(v.object({
    enabled: v.boolean(),
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    dayOfWeek: v.optional(v.number()),
    dayOfMonth: v.optional(v.number()),
    time: v.string(),
    recipients: v.array(v.string()),
    format: v.union(v.literal("pdf"), v.literal("excel"), v.literal("csv")),
    nextRun: v.optional(v.number()),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("byWorkspace", ["workspaceId"])
  .index("byOwner", ["ownerId"])
  .index("byWorkspaceAndType", ["workspaceId", "type"]);
