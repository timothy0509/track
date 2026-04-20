import * as React from "react";
import { useAuth } from "@/providers/AuthProvider";

type Role = "admin" | "projectManager" | "user";

interface WorkspaceSettings {
  whoCanCreateProjects: "admin" | "projectManager" | "everyone";
}

export function useWorkspacePermissions(userRole: Role | null, workspaceSettings?: WorkspaceSettings) {
  useAuth();

  const hasPermission = React.useCallback(
    (requiredRole: Role): boolean => {
      if (!userRole) return false;
      const roleHierarchy: Record<Role, number> = {
        user: 1,
        projectManager: 2,
        admin: 3,
      };
      return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    },
    [userRole]
  );

  const isAdmin = React.useMemo(() => hasPermission("admin"), [hasPermission]);
  const isProjectManager = React.useMemo(
    () => hasPermission("projectManager"),
    [hasPermission]
  );
  const isUser = React.useMemo(() => !!userRole, [userRole]);

  const canCreateProjects = React.useMemo((): boolean => {
    if (!workspaceSettings) return false;
    if (workspaceSettings.whoCanCreateProjects === "everyone") return true;
    if (workspaceSettings.whoCanCreateProjects === "projectManager")
      return isProjectManager || isAdmin;
    return isAdmin;
  }, [workspaceSettings, isAdmin, isProjectManager]);

  const canManageMembers = React.useMemo(() => isAdmin, [isAdmin]);

  return {
    userRole,
    hasPermission,
    isAdmin,
    isProjectManager,
    isUser,
    canCreateProjects,
    canManageMembers,
  };
}
