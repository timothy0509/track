/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_calendarIntegration from "../actions/calendarIntegration.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as mutations_auth from "../mutations/auth.js";
import type * as mutations_clients from "../mutations/clients.js";
import type * as mutations_integrations from "../mutations/integrations.js";
import type * as mutations_projects from "../mutations/projects.js";
import type * as mutations_tags from "../mutations/tags.js";
import type * as mutations_tasks from "../mutations/tasks.js";
import type * as mutations_timeEntries from "../mutations/timeEntries.js";
import type * as mutations_workspaceMembers from "../mutations/workspaceMembers.js";
import type * as mutations_workspaces from "../mutations/workspaces.js";
import type * as queries_auth from "../queries/auth.js";
import type * as queries_clients from "../queries/clients.js";
import type * as queries_integrations from "../queries/integrations.js";
import type * as queries_projects from "../queries/projects.js";
import type * as queries_tags from "../queries/tags.js";
import type * as queries_tasks from "../queries/tasks.js";
import type * as queries_timeEntries from "../queries/timeEntries.js";
import type * as queries_workspaceMembers from "../queries/workspaceMembers.js";
import type * as queries_workspaces from "../queries/workspaces.js";
import type * as schema_auditLog from "../schema/auditLog.js";
import type * as schema_clients from "../schema/clients.js";
import type * as schema_index from "../schema/index.js";
import type * as schema_integrations from "../schema/integrations.js";
import type * as schema_projectMembers from "../schema/projectMembers.js";
import type * as schema_projects from "../schema/projects.js";
import type * as schema_reports from "../schema/reports.js";
import type * as schema_settings from "../schema/settings.js";
import type * as schema_tags from "../schema/tags.js";
import type * as schema_tasks from "../schema/tasks.js";
import type * as schema_teams from "../schema/teams.js";
import type * as schema_timeEntries from "../schema/timeEntries.js";
import type * as schema_userGroups from "../schema/userGroups.js";
import type * as schema_users from "../schema/users.js";
import type * as schema_workspaceMembers from "../schema/workspaceMembers.js";
import type * as schema_workspaces from "../schema/workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/calendarIntegration": typeof actions_calendarIntegration;
  "lib/auth": typeof lib_auth;
  "lib/permissions": typeof lib_permissions;
  "mutations/auth": typeof mutations_auth;
  "mutations/clients": typeof mutations_clients;
  "mutations/integrations": typeof mutations_integrations;
  "mutations/projects": typeof mutations_projects;
  "mutations/tags": typeof mutations_tags;
  "mutations/tasks": typeof mutations_tasks;
  "mutations/timeEntries": typeof mutations_timeEntries;
  "mutations/workspaceMembers": typeof mutations_workspaceMembers;
  "mutations/workspaces": typeof mutations_workspaces;
  "queries/auth": typeof queries_auth;
  "queries/clients": typeof queries_clients;
  "queries/integrations": typeof queries_integrations;
  "queries/projects": typeof queries_projects;
  "queries/tags": typeof queries_tags;
  "queries/tasks": typeof queries_tasks;
  "queries/timeEntries": typeof queries_timeEntries;
  "queries/workspaceMembers": typeof queries_workspaceMembers;
  "queries/workspaces": typeof queries_workspaces;
  "schema/auditLog": typeof schema_auditLog;
  "schema/clients": typeof schema_clients;
  "schema/index": typeof schema_index;
  "schema/integrations": typeof schema_integrations;
  "schema/projectMembers": typeof schema_projectMembers;
  "schema/projects": typeof schema_projects;
  "schema/reports": typeof schema_reports;
  "schema/settings": typeof schema_settings;
  "schema/tags": typeof schema_tags;
  "schema/tasks": typeof schema_tasks;
  "schema/teams": typeof schema_teams;
  "schema/timeEntries": typeof schema_timeEntries;
  "schema/userGroups": typeof schema_userGroups;
  "schema/users": typeof schema_users;
  "schema/workspaceMembers": typeof schema_workspaceMembers;
  "schema/workspaces": typeof schema_workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
