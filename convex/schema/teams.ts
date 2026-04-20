"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const teams = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("users"),
}).index("byWorkspace", ["workspaceId"]);

export const teamMembers = defineTable({
  teamId: v.id("teams"),
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  addedAt: v.number(),
  addedBy: v.id("users"),
}).index("byTeam", ["teamId"])
  .index("byUser", ["userId"])
  .index("byTeamAndUser", ["teamId", "userId"]);
