"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tags = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  color: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("users"),
}).index("byWorkspace", ["workspaceId"])
  .index("byWorkspaceAndName", ["workspaceId", "name"]);
