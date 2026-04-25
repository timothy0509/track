"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const syncGoogleCalendar = action({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.type !== "googleCalendar") {
      throw new Error("Google Calendar integration not found");
    }

    const accessToken = integration.accessToken;
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date(args.startDate).toISOString()}&timeMax=${new Date(args.endDate).toISOString()}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items ?? [];
  },
});

export const syncOutlookCalendar = action({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.type !== "outlookCalendar") {
      throw new Error("Outlook Calendar integration not found");
    }

    const accessToken = integration.accessToken;
    const url = `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${new Date(args.startDate).toISOString()}&endDateTime=${new Date(args.endDate).toISOString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Outlook Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value ?? [];
  },
});

export const importEvents = action({
  args: {
    workspaceId: v.id("workspaces"),
    events: v.array(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        startTime: v.number(),
        endTime: v.number(),
        source: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const imported = [];

    for (const event of args.events) {
      const entryId = await ctx.db.insert("timeEntries", {
        workspaceId: args.workspaceId,
        userId: user._id,
        description: event.title ?? event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        duration: event.endTime - event.startTime,
        isRunning: false,
        billable: false,
        isFavorite: false,
        source: "calendar",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      imported.push({ entryId, event });
    }

    return { imported, count: imported.length };
  },
});
