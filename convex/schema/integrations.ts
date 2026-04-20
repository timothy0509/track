"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const integrations = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.optional(v.id("users")),
  type: v.union(v.literal("googleCalendar"), v.literal("outlookCalendar")),
  accessToken: v.string(),
  refreshToken: v.string(),
  expiresAt: v.number(),
  scopes: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("byWorkspace", ["workspaceId"])
  .index("byUser", ["userId"])
  .index("byType", ["type"]);
