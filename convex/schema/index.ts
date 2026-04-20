"use convex";

import { defineSchema } from "convex/server";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { workspaceMembers } from "./workspaceMembers";
import { clients } from "./clients";
import { projects } from "./projects";
import { tasks } from "./tasks";
import { timeEntries } from "./timeEntries";
import { tags } from "./tags";
import { teams, teamMembers } from "./teams";
import { userGroups, userGroupMembers } from "./userGroups";
import { projectMembers } from "./projectMembers";
import { reports } from "./reports";
import { workspaceSettings, userSettings } from "./settings";
import { integrations } from "./integrations";
import { auditLog } from "./auditLog";

export default defineSchema({
  users,
  workspaces,
  workspaceMembers,
  clients,
  projects,
  tasks,
  timeEntries,
  tags,
  teams,
  teamMembers,
  userGroups,
  userGroupMembers,
  projectMembers,
  reports,
  workspaceSettings,
  userSettings,
  integrations,
  auditLog,
});
