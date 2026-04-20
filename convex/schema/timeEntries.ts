"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const timeEntries = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  description: v.optional(v.string()),
  projectId: v.optional(v.id("projects")),
  taskId: v.optional(v.id("tasks")),
  tagIds: v.optional(v.array(v.id("tags"))),
  startTime: v.number(),
  endTime: v.optional(v.number()),
  duration: v.number(),
  isRunning: v.boolean(),
  billable: v.boolean(),
  billableRate: v.optional(v.number()),
  revenue: v.optional(v.number()),
  laborCost: v.optional(v.number()),
  sharedWith: v.optional(v.array(v.id("users"))),
  sharedBy: v.optional(v.id("users")),
  sharedAccepted: v.optional(v.array(v.id("users"))),
  isFavorite: v.boolean(),
  source: v.union(v.literal("timer"), v.literal("manual"), v.literal("calendar"), v.literal("offline"), v.literal("api")),
  timeZone: v.string(),
  rounded: v.optional(
    v.object({
      originalDuration: v.number(),
      roundedDuration: v.number(),
      minutes: v.number(),
      direction: v.union(v.literal("up"), v.literal("down"), v.literal("nearest")),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("byWorkspace", ["workspaceId"])
  .index("byUser", ["userId"])
  .index("byUserAndStartTime", ["userId", "startTime"])
  .index("byProject", ["projectId"])
  .index("byTask", ["taskId"])
  .index("byWorkspaceAndDate", ["workspaceId", "startTime"])
  .index("byUserAndRunning", ["userId", "isRunning"])
  .index("bySharedWith", ["sharedWith"]);
