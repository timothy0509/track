"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const clients = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  email: v.optional(v.string()),
  notes: v.optional(v.string()),
  archived: v.boolean(),
  archivedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("users"),
}).index("byWorkspace", ["workspaceId"])
  .index("byWorkspaceAndArchived", ["workspaceId", "archived"]);
