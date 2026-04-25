import { query } from "../_generated/server";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return {
      id: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? identity.email?.split("@")[0] ?? "User",
    };
  },
});
