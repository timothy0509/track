"use node";

import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

export const syncGoogleCalendar = action({
  args: {
    workspaceId: v.id("workspaces"),
    integrationId: v.id("integrations"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.runQuery(
      internal.queries.integrations.getForSync,
      {
        workspaceId: args.workspaceId,
        integrationId: args.integrationId,
      }
    );

    if (integration.type !== "googleCalendar") {
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

    const data = (await response.json()) as { items?: unknown[] };
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
    const integration = await ctx.runQuery(
      internal.queries.integrations.getForSync,
      {
        workspaceId: args.workspaceId,
        integrationId: args.integrationId,
      }
    );

    if (integration.type !== "outlookCalendar") {
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

    const data = (await response.json()) as { value?: unknown[] };
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
  handler: async (
    ctx,
    args
  ): Promise<{
    imported: Array<{
      entryId: Id<"timeEntries">;
      event: {
        title?: string;
        description?: string;
        startTime: number;
        endTime: number;
        source: string;
      };
    }>;
    count: number;
  }> => {
    return await ctx.runMutation(api.mutations.timeEntries.importFromCalendar, {
      workspaceId: args.workspaceId,
      events: args.events,
    });
  },
});
