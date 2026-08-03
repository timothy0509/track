import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { TOTP } from "otpauth";

export const generateSecret = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("totpCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    if (existing?.verified) {
      throw new Error("TOTP already configured");
    }

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    const totp = new TOTP({
      issuer: "TimoTrack",
      label: identity.email ?? "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;

    await ctx.db.insert("totpCredentials", {
      userId: identity.tokenIdentifier,
      secret,
      verified: false,
    });

    return {
      secret,
      uri: totp.toString(),
    };
  },
});

export const verify = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const credential = await ctx.db
      .query("totpCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    if (!credential) throw new Error("No TOTP credential found");

    const totp = new TOTP({
      issuer: "TimoTrack",
      label: identity.email ?? "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: credential.secret,
    });

    const delta = totp.validate({ token: args.code, window: 1 });
    if (delta === null) {
      throw new Error("Invalid TOTP code");
    }

    await ctx.db.patch(credential._id, { verified: true });

    const appUser = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", identity.tokenIdentifier))
      .unique();

    if (appUser) {
      await ctx.db.patch(appUser._id, { has2FA: true, updatedAt: Date.now() });
    }

    return { success: true };
  },
});

export const verifyLogin = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const credential = await ctx.db
      .query("totpCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    if (!credential?.verified) {
      throw new Error("TOTP not configured");
    }

    const totp = new TOTP({
      issuer: "TimoTrack",
      label: identity.email ?? "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: credential.secret,
    });

    const delta = totp.validate({ token: args.code, window: 1 });
    if (delta === null) {
      throw new Error("Invalid TOTP code");
    }

    return { success: true };
  },
});

export const remove = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const credential = await ctx.db
      .query("totpCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    if (credential) {
      await ctx.db.delete(credential._id);
    }

    const passkey = await ctx.db
      .query("passkeyCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    const appUser = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", identity.tokenIdentifier))
      .unique();

    if (appUser && !passkey) {
      await ctx.db.patch(appUser._id, { has2FA: false, updatedAt: Date.now() });
    }

    return { success: true };
  },
});
