"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const users = defineTable({
  authId: v.string(),
  email: v.string(),
  emailVerified: v.boolean(),
  name: v.string(),
  image: v.optional(v.string()),
  timezone: v.string(),
  weekStart: v.union(v.literal("sunday"), v.literal("monday")),
  dateFormat: v.string(),
  timeFormat: v.union(v.literal("12h"), v.literal("24h")),
  currency: v.string(),
  defaultBillable: v.boolean(),
  defaultProjectId: v.optional(v.id("projects")),
  defaultTaskId: v.optional(v.id("tasks")),
  timeRounding: v.optional(
    v.object({
      enabled: v.boolean(),
      minutes: v.number(),
      direction: v.union(v.literal("up"), v.literal("down"), v.literal("nearest")),
    })
  ),
  requiredFields: v.optional(
    v.object({
      description: v.boolean(),
      project: v.boolean(),
      task: v.boolean(),
      tag: v.boolean(),
    })
  ),
  emailNotifications: v.object({
    projectAdded: v.boolean(),
    teamReminders: v.boolean(),
    reportScheduled: v.boolean(),
    budgetAlerts: v.boolean(),
  }),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("byAuthId", ["authId"])
  .index("byEmail", ["email"]);
