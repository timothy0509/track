import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("passkeyCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByCredentialId = internalQuery({
  args: { credentialId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("passkeyCredentials")
      .withIndex("byCredentialId", (q) => q.eq("credentialId", args.credentialId))
      .unique();
  },
});

export const getChallenge = internalQuery({
  args: { challengeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.challengeId as any);
  },
});

export const getAppUser = internalQuery({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", args.authId))
      .unique();
  },
});
