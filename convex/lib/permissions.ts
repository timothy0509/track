"use convex";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Role = "admin" | "projectManager" | "user";
type WhoCanCreateProjects = "admin" | "projectManager" | "everyone";
type DbCtx = QueryCtx | MutationCtx;

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

export function isProjectManager(role: Role): boolean {
  return role === "projectManager" || role === "admin";
}

export function canCreateProjects(
  role: Role,
  whoCanCreateProjects: WhoCanCreateProjects
): boolean {
  if (whoCanCreateProjects === "everyone") return true;
  if (whoCanCreateProjects === "projectManager") return isProjectManager(role);
  return isAdmin(role);
}

export function canManageMembers(role: Role): boolean {
  return isAdmin(role);
}

export function canDeleteWorkspace(role: Role): boolean {
  return isAdmin(role);
}

export async function getCurrentUser(
  ctx: DbCtx,
  userId: string | null
): Promise<{ _id: Id<"users">; email: string; name: string } | null> {
  if (!userId) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("byAuthId", (q) => q.eq("authId", userId))
    .unique();

  return user;
}

export async function checkPermission(
  ctx: DbCtx,
  workspaceId: Id<"workspaces">,
  userId: string | null,
  requiredRole: Role
): Promise<boolean> {
  if (!userId) return false;

  const user = await getCurrentUser(ctx, userId);
  if (!user) return false;

  const member = await ctx.db
    .query("workspaceMembers")
    .withIndex("byWorkspaceAndUser", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", user._id)
    )
    .unique();

  if (!member || member.status !== "active") return false;

  const roleHierarchy: Record<Role, number> = {
    user: 1,
    projectManager: 2,
    admin: 3,
  };

  return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
}

export async function getMemberRole(
  ctx: DbCtx,
  workspaceId: Id<"workspaces">,
  userId: string | null
): Promise<Role | null> {
  if (!userId) return null;

  const user = await getCurrentUser(ctx, userId);
  if (!user) return null;

  const member = await ctx.db
    .query("workspaceMembers")
    .withIndex("byWorkspaceAndUser", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", user._id)
    )
    .unique();

  if (!member || member.status !== "active") return null;

  return member.role;
}
