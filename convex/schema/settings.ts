"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workspaceSettings = defineTable({
  workspaceId: v.id("workspaces"),
  key: v.string(),
  value: v.any(),
  updatedAt: v.number(),
  updatedBy: v.id("users"),
}).index("byWorkspace", ["workspaceId"])
  .index("byWorkspaceAndKey", ["workspaceId", "key"]);

export const userSettings = defineTable({
  userId: v.id("users"),
  workspaceId: v.optional(v.id("workspaces")),
  key: v.string(),
  value: v.any(),
  updatedAt: v.number(),
}).index("byUser", ["userId"])
  .index("byUserAndKey", ["userId", "key"])
  .index("byUserAndWorkspace", ["userId", "workspaceId"]);
