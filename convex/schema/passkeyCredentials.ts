"use convex";

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const passkeyCredentials = defineTable({
  userId: v.string(),
  credentialId: v.string(),
  publicKey: v.bytes(),
  counter: v.int64(),
  name: v.optional(v.string()),
})
  .index("byUserId", ["userId"])
  .index("byCredentialId", ["credentialId"]);
