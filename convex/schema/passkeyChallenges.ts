"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const passkeyChallenges = defineTable({
  userId: v.string(),
  challenge: v.string(),
  type: v.union(v.literal("registration"), v.literal("authentication")),
  expiresAt: v.number(),
}).index("byUserId", ["userId"]);
