/* eslint-disable */
/**
 * Generated `api` utility, to be used by this Convex app's query & mutation functions.
 * This is a placeholder that will be replaced by `npx convex dev`.
 */

import type {
  FunctionReference,
  FunctionArgs,
  FunctionReturn,
} from "convex/server";

type Api = {
  queries: {
    timeEntries: {
      list: FunctionReference<"query", "public", { workspaceId: string; startDate?: number; endDate?: number; projectId?: string; taskId?: string; tagIds?: string[]; limit?: number; cursor?: number }, { entries: any[]; hasMore: boolean; nextCursor?: number }>;
      getById: FunctionReference<"query", "public", { id: string }, any>;
      getRunning: FunctionReference<"query", "public", { workspaceId: string }, any>;
      getToday: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getStats: FunctionReference<"query", "public", { workspaceId: string }, { todayTotal: number; weekTotal: number; entryCount: number }>;
      getProjects: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getTasks: FunctionReference<"query", "public", { workspaceId: string; projectId?: string }, any[]>;
      getTags: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getDescriptionSuggestions: FunctionReference<"query", "public", { workspaceId: string; query: string }, string[]>;
      getShared: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getFavorites: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getCalendarEntries: FunctionReference<"query", "public", { workspaceId: string; startDate: number; endDate: number }, any[]>;
    };
    workspaces: {
      list: FunctionReference<"query", "public", Record<string, never>, any[]>;
      getById: FunctionReference<"query", "public", { workspaceId: string }, any>;
      getBySlug: FunctionReference<"query", "public", { slug: string }, any>;
      getMembers: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getMemberRole: FunctionReference<"query", "public", { workspaceId: string }, any>;
    };
    workspaceMembers: {
      list: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getById: FunctionReference<"query", "public", { id: string }, any>;
      getPendingInvites: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
    };
    auth: {
      getCurrentUser: FunctionReference<"query", "public", Record<string, never>, any>;
    };
    clients: {
      list: FunctionReference<"query", "public", { workspaceId: string; archived?: boolean }, any[]>;
      getById: FunctionReference<"query", "public", { id: string }, any>;
      getWithProjectCount: FunctionReference<"query", "public", { workspaceId: string; archived?: boolean }, any[]>;
      search: FunctionReference<"query", "public", { workspaceId: string; query: string }, any[]>;
    };
    projects: {
      list: FunctionReference<"query", "public", { workspaceId: string; archived?: boolean; clientId?: string; includePrivate?: boolean }, any[]>;
      getById: FunctionReference<"query", "public", { id: string }, any>;
      getDashboard: FunctionReference<"query", "public", { id: string }, any>;
      getByClient: FunctionReference<"query", "public", { workspaceId: string; clientId: string }, any[]>;
      getMembers: FunctionReference<"query", "public", { projectId: string }, any[]>;
      getTemplates: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
    };
    tasks: {
      list: FunctionReference<"query", "public", { projectId: string; archived?: boolean }, any[]>;
      getById: FunctionReference<"query", "public", { id: string }, any>;
      getByProject: FunctionReference<"query", "public", { projectId: string; archived?: boolean }, any[]>;
    };
    tags: {
      list: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getById: FunctionReference<"query", "public", { id: string }, any>;
      getByName: FunctionReference<"query", "public", { workspaceId: string; name: string }, any>;
      getSuggestions: FunctionReference<"query", "public", { workspaceId: string; query: string }, any[]>;
    };
    integrations: {
      list: FunctionReference<"query", "public", { workspaceId: string }, any[]>;
      getById: FunctionReference<"query", "public", { id: string }, any>;
      getByType: FunctionReference<"query", "public", { workspaceId: string; type: string }, any>;
    };
  };
  mutations: {
    timeEntries: {
      create: FunctionReference<"mutation", "public", { workspaceId: string; description?: string; projectId?: string; taskId?: string; tagIds?: string[]; startTime: number; endTime: number; billable: boolean; billableRate?: number }, { entryId: string }>;
      startTimer: FunctionReference<"mutation", "public", { workspaceId: string; description?: string; projectId?: string; taskId?: string; tagIds?: string[]; billable: boolean }, { entryId: string }>;
      stopTimer: FunctionReference<"mutation", "public", { entryId: string }, { entryId: string; duration: number }>;
      update: FunctionReference<"mutation", "public", { entryId: string; description?: string; projectId?: string; taskId?: string; tagIds?: string[]; startTime?: number; endTime?: number; billable?: boolean; billableRate?: number }, { success: boolean }>;
      deleteEntry: FunctionReference<"mutation", "public", { entryId: string }, { success: boolean }>;
      toggleFavorite: FunctionReference<"mutation", "public", { entryId: string }, { success: boolean; isFavorite: boolean }>;
      share: FunctionReference<"mutation", "public", { entryId: string; userId: string }, { success: boolean }>;
      acceptShare: FunctionReference<"mutation", "public", { entryId: string }, { success: boolean }>;
      unshare: FunctionReference<"mutation", "public", { entryId: string; userId: string }, { success: boolean }>;
    };
    workspaces: {
      create: FunctionReference<"mutation", "public", { name: string; slug: string; currency?: string; weekStart?: string; timeFormat?: string; dateFormat?: string }, { workspaceId: string }>;
      update: FunctionReference<"mutation", "public", { workspaceId: string; name?: string; currency?: string; weekStart?: string; timeFormat?: string; dateFormat?: string; defaultBillable?: boolean; whoCanCreateProjects?: string; defaultProjectVisibility?: string }, { success: boolean }>;
      remove: FunctionReference<"mutation", "public", { workspaceId: string }, { success: boolean }>;
    };
    workspaceMembers: {
      invite: FunctionReference<"mutation", "public", { workspaceId: string; email: string; role: string }, { success: boolean }>;
      acceptInvite: FunctionReference<"mutation", "public", { inviteToken: string }, { success: boolean }>;
      updateRole: FunctionReference<"mutation", "public", { memberId: string; role: string }, { success: boolean }>;
      remove: FunctionReference<"mutation", "public", { memberId: string }, { success: boolean }>;
    };
    auth: {
      login: FunctionReference<"mutation", "public", { email: string; password: string }, { userId: string }>;
      signup: FunctionReference<"mutation", "public", { email: string; password: string; name: string }, { userId: string }>;
    };
    clients: {
      create: FunctionReference<"mutation", "public", { workspaceId: string; name: string; email?: string; notes?: string }, { clientId: string }>;
      update: FunctionReference<"mutation", "public", { clientId: string; name?: string; email?: string; notes?: string }, { success: boolean }>;
      deleteClient: FunctionReference<"mutation", "public", { clientId: string }, { success: boolean }>;
      archive: FunctionReference<"mutation", "public", { clientId: string; archived: boolean }, { success: boolean }>;
      bulkArchive: FunctionReference<"mutation", "public", { clientIds: string[]; archived: boolean }, { success: boolean }>;
    };
    projects: {
      create: FunctionReference<"mutation", "public", { workspaceId: string; name: string; description?: string; color: string; clientId?: string; isPrivate?: boolean; budgetAmount?: number; estimateHours?: number; billableRate?: number }, { projectId: string }>;
      update: FunctionReference<"mutation", "public", { projectId: string; name?: string; description?: string; color?: string; clientId?: string; isPrivate?: boolean; budgetAmount?: number; estimateHours?: number; billableRate?: number; archived?: boolean }, { success: boolean }>;
      deleteProject: FunctionReference<"mutation", "public", { projectId: string }, { success: boolean }>;
      archive: FunctionReference<"mutation", "public", { projectId: string; archived: boolean }, { success: boolean }>;
      bulkUpdate: FunctionReference<"mutation", "public", { projectIds: string[]; updates: Record<string, any> }, { success: boolean }>;
      bulkArchive: FunctionReference<"mutation", "public", { projectIds: string[]; archived: boolean }, { success: boolean }>;
      addMember: FunctionReference<"mutation", "public", { projectId: string; userId: string; role: string }, { success: boolean }>;
      removeMember: FunctionReference<"mutation", "public", { projectId: string; userId: string }, { success: boolean }>;
    };
    tasks: {
      create: FunctionReference<"mutation", "public", { workspaceId: string; projectId: string; name: string; description?: string; estimateHours?: number; billableRate?: number }, { taskId: string }>;
      update: FunctionReference<"mutation", "public", { taskId: string; name?: string; description?: string; estimateHours?: number; billableRate?: number; archived?: boolean }, { success: boolean }>;
      deleteTask: FunctionReference<"mutation", "public", { taskId: string }, { success: boolean }>;
      archive: FunctionReference<"mutation", "public", { taskId: string; archived: boolean }, { success: boolean }>;
      bulkUpdate: FunctionReference<"mutation", "public", { taskIds: string[]; updates: Record<string, any> }, { success: boolean }>;
    };
    tags: {
      create: FunctionReference<"mutation", "public", { workspaceId: string; name: string; color?: string }, { tagId: string }>;
      update: FunctionReference<"mutation", "public", { tagId: string; name?: string; color?: string }, { success: boolean }>;
      deleteTag: FunctionReference<"mutation", "public", { tagId: string }, { success: boolean }>;
      bulkDelete: FunctionReference<"mutation", "public", { tagIds: string[] }, { success: boolean }>;
    };
    integrations: {
      create: FunctionReference<"mutation", "public", { workspaceId: string; type: string; accessToken: string; refreshToken: string; expiresAt: number; scopes: string[] }, { integrationId: string }>;
      update: FunctionReference<"mutation", "public", { integrationId: string; accessToken?: string; refreshToken?: string; expiresAt?: number }, { success: boolean }>;
      deleteIntegration: FunctionReference<"mutation", "public", { integrationId: string }, { success: boolean }>;
    };
  };
  actions: {
    calendarIntegration: {
      syncGoogleCalendar: FunctionReference<"action", "public", { workspaceId: string }, { success: boolean; imported: number }>;
      syncOutlookCalendar: FunctionReference<"action", "public", { workspaceId: string }, { success: boolean; imported: number }>;
      importEvents: FunctionReference<"action", "public", { workspaceId: string; events: any[] }, { imported: number }>;
    };
  };
};

export const api: Api = {} as unknown as Api;
