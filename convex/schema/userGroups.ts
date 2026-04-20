"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userGroups = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("users"),
}).index("byWorkspace", ["workspaceId"]);

export const userGroupMembers = defineTable({
  groupId: v.id("userGroups"),
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  addedAt: v.number(),
  addedBy: v.id("users"),
}).index("byGroup", ["groupId"])
  .index("byUser", ["userId"])
  .index("byGroupAndUser", ["groupId", "userId"]);
