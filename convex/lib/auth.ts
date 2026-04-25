"use convex";

import type { Doc } from "../_generated/dataModel";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx =
  | Pick<QueryCtx, "auth">
  | Pick<MutationCtx, "auth">
  | Pick<ActionCtx, "auth">;
type DbCtx = QueryCtx | MutationCtx;

export async function requireAuth(ctx: AuthCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.tokenIdentifier;
}

export async function getCurrentUserId(ctx: AuthCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return identity.tokenIdentifier;
}

export async function requireUser(ctx: DbCtx): Promise<Doc<"users">> {
  const authId = await requireAuth(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("byAuthId", (q) => q.eq("authId", authId))
    .unique();

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}
