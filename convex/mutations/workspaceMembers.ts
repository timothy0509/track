"use convex";

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUser, getCurrentUserId } from "../lib/auth";
import { checkPermission } from "../lib/permissions";

export const invite = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("projectManager"),
      v.literal("user")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const hasPermission = await checkPermission(
      ctx,
      args.workspaceId,
      user.authId,
      "admin"
    );

    if (!hasPermission) {
      throw new Error("Only admins can invite members");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const existingMember = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .first();

    const existingMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    if (existingMember) {
      const alreadyMember = existingMembership.find(
        (m) => m.userId === existingMember._id
      );
      if (alreadyMember) {
        throw new Error("User is already a member of this workspace");
      }
    } else {
      const pendingInvite = existingMembership.find(
        (m) => m.inviteEmail === args.email && m.status === "invited"
      );
      if (pendingInvite) {
        throw new Error("An invite for this email already exists");
      }
    }

    const inviteToken = crypto.randomUUID();

    if (existingMember) {
      await ctx.db.insert("workspaceMembers", {
        workspaceId: args.workspaceId,
        userId: existingMember._id,
        role: args.role,
        status: "invited",
        invitedAt: Date.now(),
        invitedBy: user._id,
        inviteToken,
      });
    } else {
      await ctx.db.insert("workspaceMembers", {
        workspaceId: args.workspaceId,
        userId: user._id,
        role: args.role,
        status: "invited",
        inviteEmail: args.email,
        invitedAt: Date.now(),
        invitedBy: user._id,
        inviteToken,
      });
    }

    return { inviteToken, success: true };
  },
});

export const acceptInvite = mutation({
  args: {
    inviteToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const member = await ctx.db
      .query("workspaceMembers")
      .withIndex("byInviteToken", (q) => q.eq("inviteToken", args.inviteToken))
      .first();

    if (!member) {
      throw new Error("Invalid invite token");
    }

    if (member.status !== "invited") {
      throw new Error("Invite has already been used or expired");
    }

    if (member.inviteEmail && member.inviteEmail !== user.email) {
      throw new Error("This invite is for a different email address");
    }

    await ctx.db.patch(member._id, {
      userId: user._id,
      status: "active",
      joinedAt: Date.now(),
      inviteToken: undefined,
    });

    return { workspaceId: member.workspaceId, success: true };
  },
});

export const updateRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("workspaceMembers"),
    role: v.union(
      v.literal("admin"),
      v.literal("projectManager"),
      v.literal("user")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const hasPermission = await checkPermission(
      ctx,
      args.workspaceId,
      user.authId,
      "admin"
    );

    if (!hasPermission) {
      throw new Error("Only admins can change member roles");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    if (member.workspaceId !== args.workspaceId) {
      throw new Error("Member does not belong to this workspace");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (member.userId === workspace.ownerId) {
      throw new Error("Cannot change the role of the workspace owner");
    }

    await ctx.db.patch(args.memberId, {
      role: args.role,
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("workspaceMembers"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const hasPermission = await checkPermission(
      ctx,
      args.workspaceId,
      user.authId,
      "admin"
    );

    if (!hasPermission) {
      throw new Error("Only admins can remove members");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    if (member.workspaceId !== args.workspaceId) {
      throw new Error("Member does not belong to this workspace");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (member.userId === workspace.ownerId) {
      throw new Error("Cannot remove the workspace owner");
    }

    await ctx.db.delete(args.memberId);

    return { success: true };
  },
});
