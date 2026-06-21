"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const totpCredentials = defineTable({
  userId: v.string(),
  secret: v.string(),
  verified: v.boolean(),
}).index("byUserId", ["userId"]);
