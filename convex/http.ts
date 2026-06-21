import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http, {
  onSignUp: async (ctx, userId) => {
    // Create app-level user profile after Convex Auth signup
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", identity.subject))
      .unique();

    if (!existing) {
      await ctx.db.insert("users", {
        authId: identity.subject,
        email: identity.email ?? "",
        emailVerified: identity.emailVerified ?? false,
        name: identity.name ?? identity.email?.split("@")[0] ?? "User",
        timezone: "UTC",
        weekStart: "monday",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "24h",
        currency: "USD",
        defaultBillable: false,
        emailNotifications: {
          projectAdded: true,
          teamReminders: true,
          reportScheduled: true,
          budgetAlerts: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response("ok", { status: 200 });
  }),
});

export default http;
