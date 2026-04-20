"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workspaceMembers = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("projectManager"), v.literal("user")),
  status: v.union(v.literal("active"), v.literal("invited"), v.literal("suspended")),
  inviteEmail: v.optional(v.string()),
  inviteToken: v.optional(v.string()),
  joinedAt: v.optional(v.number()),
  invitedAt: v.number(),
  invitedBy: v.id("users"),
}).index("byWorkspace", ["workspaceId"])
  .index("byUser", ["userId"])
  .index("byWorkspaceAndUser", ["workspaceId", "userId"])
  .index("byInviteToken", ["inviteToken"]);
