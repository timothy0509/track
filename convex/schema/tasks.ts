"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tasks = defineTable({
  workspaceId: v.id("workspaces"),
  projectId: v.id("projects"),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.optional(v.string()),
  archived: v.boolean(),
  archivedAt: v.optional(v.number()),
  estimateHours: v.optional(v.number()),
  billableRate: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("users"),
}).index("byProject", ["projectId"])
  .index("byWorkspace", ["workspaceId"])
  .index("byProjectAndArchived", ["projectId", "archived"]);
