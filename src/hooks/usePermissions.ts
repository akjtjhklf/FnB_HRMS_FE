/**
 * Permission Hook
 * Dynamic RBAC based on Directus permissions and policies
 */

import { useGetIdentity } from "@refinedev/core";
import { useMemo } from "react";
import type { User } from "@/types/auth";

export type Action = "create" | "read" | "update" | "delete";

interface PermissionCheck {
  collection: string;
  action: Action;
}

/**
 * Hook to check user permissions dynamically
 * Returns helper functions to check permissions for collections/actions
 */
export function usePermissions() {
  const { data: user } = useGetIdentity<User>();

  const permissions = useMemo(() => {
    // Handle role as object or string
    const role = typeof user?.role === "object" ? user.role : null;
    
    // Admin access bypass - có full quyền
    if (role?.admin_access) {
      return {
        isAdmin: true,
        hasPermission: () => true,
        canCreate: () => true,
        canRead: () => true,
        canUpdate: () => true,
        canDelete: () => true,
        canManageSchedule: true,
        canRegisterAvailability: false, // Admin không register availability
      };
    }

    // TODO: Load actual permissions from API
    // For now, use role-based fallback
    const roleName = role?.name?.toLowerCase() || "";
    const isManager = roleName.includes("manager") || roleName.includes("administrator");

    return {
      isAdmin: false,
      hasPermission: (collection: string, action: Action) => {
        // TODO: Check actual permissions from user.role.permissions
        // For now, manager can do everything, employee limited
        if (isManager) return true;
        
        // Employee permissions
        const employeePermissions: Record<string, Action[]> = {
          "employee-availability": ["create", "read", "update"],
          "schedule-change-requests": ["create", "read", "update"],
          "schedule-assignments": ["read"],
          "shifts": ["read"],
          "weekly-schedules": ["read"],
        };

        const allowed = employeePermissions[collection] || [];
        return allowed.includes(action);
      },
      canCreate: (collection: string) => {
        if (isManager) return true;
        return ["employee-availability", "schedule-change-requests"].includes(collection);
      },
      canRead: (collection: string) => {
        return true; // Everyone can read their relevant data
      },
      canUpdate: (collection: string) => {
        if (isManager) return true;
        return ["employee-availability", "schedule-change-requests"].includes(collection);
      },
      canDelete: (collection: string) => {
        return isManager; // Only managers can delete
      },
      canManageSchedule: isManager,
      canRegisterAvailability: !isManager, // Only employees register
    };
  }, [user]);

  return permissions;
}

/**
 * Hook to check specific permission
 */
export function useHasPermission(collection: string, action: Action): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(collection, action);
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { data: user } = useGetIdentity<User>();
  const role = typeof user?.role === "object" ? user.role : null;
  return role?.admin_access === true;
}

/**
 * Hook to check if user can manage schedules (Manager role)
 */
export function useCanManageSchedule(): boolean {
  const { canManageSchedule } = usePermissions();
  return canManageSchedule;
}

/**
 * Hook to check if user can register availability (Employee role)
 */
export function useCanRegisterAvailability(): boolean {
  const { canRegisterAvailability } = usePermissions();
  return canRegisterAvailability;
}
