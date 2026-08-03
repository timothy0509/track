import { mutation } from "../_generated/server";

export const check2FARequired = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { required: false, method: null };

    const appUser = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", identity.tokenIdentifier))
      .unique();

    if (!appUser?.has2FA) {
      return { required: false, method: null };
    }

    const totp = await ctx.db
      .query("totpCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    if (totp?.verified) {
      return { required: true, method: "totp" as const };
    }

    const passkey = await ctx.db
      .query("passkeyCredentials")
      .withIndex("byUserId", (q) => q.eq("userId", identity.tokenIdentifier))
      .first();

    if (passkey) {
      return { required: true, method: "passkey" as const };
    }

    return { required: false, method: null };
  },
});
