"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const projectMembers = defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  role: v.union(v.literal("manager"), v.literal("member")),
  addedAt: v.number(),
  addedBy: v.id("users"),
}).index("byProject", ["projectId"])
  .index("byUser", ["userId"])
  .index("byProjectAndUser", ["projectId", "userId"]);
