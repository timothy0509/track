"use convex";

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireUser } from "../../lib/auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const now = Date.now();
    const clientId = await ctx.db.insert("clients", {
      workspaceId: args.workspaceId,
      name: args.name,
      email: args.email,
      notes: args.notes,
      archived: false,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { clientId };
  },
});

export const update = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", client.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.clientId, updates);

    return { success: true };
  },
});

export const deleteClient = mutation({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", client.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("byWorkspace", (q) => q.eq("workspaceId", client.workspaceId))
      .collect();

    const hasProjects = projects.some((p) => p.clientId === args.clientId);
    if (hasProjects) {
      throw new Error("Cannot delete client with associated projects");
    }

    await ctx.db.delete(args.clientId);

    return { success: true };
  },
});

export const archive = mutation({
  args: {
    clientId: v.id("clients"),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("byWorkspaceAndUser", (q) =>
        q.eq("workspaceId", client.workspaceId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this workspace");
    }

    await ctx.db.patch(args.clientId, {
      archived: args.archived,
      archivedAt: args.archived ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const bulkArchive = mutation({
  args: {
    clientIds: v.array(v.id("clients")),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    let count = 0;
    for (const clientId of args.clientIds) {
      const client = await ctx.db.get(clientId);
      if (!client) continue;

      const membership = await ctx.db
        .query("workspaceMembers")
        .withIndex("byWorkspaceAndUser", (q) =>
          q.eq("workspaceId", client.workspaceId).eq("userId", user._id)
        )
        .first();

      if (!membership) continue;

      await ctx.db.patch(clientId, {
        archived: args.archived,
        archivedAt: args.archived ? Date.now() : undefined,
        updatedAt: Date.now(),
      });
      count++;
    }

    return { success: true, count };
  },
});
