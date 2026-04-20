"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const projects = defineTable({
  workspaceId: v.id("workspaces"),
  clientId: v.optional(v.id("clients")),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.string(),
  isPrivate: v.boolean(),
  archived: v.boolean(),
  archivedAt: v.optional(v.number()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  estimateHours: v.optional(v.number()),
  budgetAmount: v.optional(v.number()),
  budgetType: v.optional(v.union(v.literal("hours"), v.literal("amount"), v.literal("fixedFee"))),
  fixedFee: v.optional(v.number()),
  recurring: v.optional(
    v.object({
      enabled: v.boolean(),
      frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
      interval: v.number(),
      nextRun: v.optional(v.number()),
    })
  ),
  billableRate: v.optional(v.number()),
  billableRateType: v.optional(v.union(v.literal("workspace"), v.literal("project"), v.literal("custom"))),
  alertThreshold: v.optional(v.number()),
  isTemplate: v.boolean(),
  templateSourceId: v.optional(v.id("projects")),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("users"),
}).index("byWorkspace", ["workspaceId"])
  .index("byWorkspaceAndArchived", ["workspaceId", "archived"])
  .index("byClient", ["clientId"])
  .index("byWorkspaceAndPrivate", ["workspaceId", "isPrivate"])
  .index("byTemplate", ["isTemplate"]);
