import { internalQuery, internalMutation } from "../_generated/server";
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

export const storeChallenge = internalMutation({
  args: {
    userId: v.string(),
    challenge: v.string(),
    type: v.union(v.literal("registration"), v.literal("authentication")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("passkeyChallenges" as any, {
      userId: args.userId,
      challenge: args.challenge,
      type: args.type,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
  },
});

export const deleteChallenge = internalMutation({
  args: { challengeId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.challengeId as any);
  },
});

export const storeCredential = internalMutation({
  args: {
    userId: v.string(),
    credentialId: v.string(),
    publicKey: v.bytes(),
    counter: v.int64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("passkeyCredentials", {
      userId: args.userId,
      credentialId: args.credentialId,
      publicKey: args.publicKey,
      counter: args.counter,
      name: "Passkey",
    });
  },
});

export const updateCounter = internalMutation({
  args: {
    credentialId: v.string(),
    counter: v.int64(),
  },
  handler: async (ctx, args) => {
    const cred = await ctx.db
      .query("passkeyCredentials")
      .withIndex("byCredentialId", (q) => q.eq("credentialId", args.credentialId))
      .unique();
    if (cred) {
      await ctx.db.patch(cred._id, { counter: args.counter });
    }
  },
});

export const updateUser2FA = internalMutation({
  args: {
    userId: v.id("users"),
    has2FA: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { has2FA: args.has2FA, updatedAt: Date.now() });
  },
});
