"use convex";

import { Id } from "../_generated/dataModel";

export async function requireAuth(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

export async function getCurrentUserId(ctx: any): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return identity.subject;
}

export async function requireUser(
  ctx: any
): Promise<{ _id: Id<"users">; email: string; name: string; authId: string }> {
  const authId = await requireAuth(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("byAuthId", (q) => q.eq("authId", authId))
    .first();

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}
