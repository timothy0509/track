"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workspaces = defineTable({
  name: v.string(),
  slug: v.string(),
  ownerId: v.id("users"),
  plan: v.union(v.literal("free"), v.literal("starter"), v.literal("premium"), v.literal("enterprise")),
  currency: v.string(),
  weekStart: v.union(v.literal("sunday"), v.literal("monday")),
  timeFormat: v.union(v.literal("12h"), v.literal("24h")),
  dateFormat: v.string(),
  defaultBillable: v.boolean(),
  defaultBillableRate: v.optional(v.number()),
  timeRounding: v.optional(
    v.object({
      enabled: v.boolean(),
      minutes: v.number(),
      direction: v.union(v.literal("up"), v.literal("down"), v.literal("nearest")),
    })
  ),
  whoCanCreateProjects: v.union(v.literal("admin"), v.literal("projectManager"), v.literal("everyone")),
  defaultProjectVisibility: v.union(v.literal("private"), v.literal("workspace")),
  requiredFields: v.optional(
    v.object({
      description: v.boolean(),
      project: v.boolean(),
      task: v.boolean(),
      tag: v.boolean(),
    })
  ),
  ssoEnabled: v.boolean(),
  ssoProvider: v.optional(v.string()),
  ssoDomain: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("bySlug", ["slug"])
  .index("byOwner", ["ownerId"]);
