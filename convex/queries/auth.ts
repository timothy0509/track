import { query } from "../_generated/server";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const appUser = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", identity.subject))
      .unique();

    return {
      id: identity.subject,
      email: identity.email ?? "",
      name: appUser?.name ?? identity.name ?? identity.email?.split("@")[0] ?? "User",
      emailVerified: identity.emailVerified ?? false,
      has2FA: appUser?.has2FA ?? false,
    };
  },
});

export const get2FAStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasTOTP: false, hasPasskey: false };
    }

    const totp = await ctx.db
      .query("totpCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.subject))
      .first();

    const passkey = await ctx.db
      .query("passkeyCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.subject))
      .first();

    return {
      hasTOTP: totp?.verified ?? false,
      hasPasskey: passkey !== null,
    };
  },
});
