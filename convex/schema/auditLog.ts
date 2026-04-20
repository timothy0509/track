"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const auditLog = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  action: v.string(),
  entityType: v.string(),
  entityId: v.string(),
  changes: v.optional(v.any()),
  timestamp: v.number(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
}).index("byWorkspace", ["workspaceId"])
  .index("byUser", ["userId"])
  .index("byWorkspaceAndTimestamp", ["workspaceId", "timestamp"]);
