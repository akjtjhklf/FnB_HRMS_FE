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
    console.log("🔍 [usePermissions] User:", user);
    console.log("🔍 [usePermissions] Role:", user?.role);

    // Handle role as object or string
    const role = typeof user?.role === "object" ? user.role : null;
    
    // Check for admin access (either via role flag or user flag)
    const isAdmin = role?.admin_access === true;

    // Admin access bypass - có full quyền
    if (isAdmin) {
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

    // ✅ NEW: Parse actual Directus permissions
    const directusPermissions = (role?.permissions || []) as Array<{
      collection: string;
      action: string;
      permissions?: Record<string, any>;
      fields?: string[];
    }>;
    
    const hasPermission = (collection: string, action: Action) => {
      return directusPermissions.some((perm) => {
        return perm.collection === collection && perm.action === action;
      });
    };

    // Check if role name implies manager access
    const isManagerRole = role?.name?.toLowerCase().includes("manager") || 
                          role?.name?.toLowerCase().includes("admin");

    // Derive role-based helpers from actual permissions OR role name
    const canManageSchedule = 
      isManagerRole ||
      hasPermission('schedule_assignments', 'create') ||
      hasPermission('weekly_schedule', 'create');
    
    const canRegisterAvailability = 
      hasPermission('employee_availability', 'create');

    return {
      isAdmin: false,
      hasPermission,
      canCreate: (collection: string) => hasPermission(collection, 'create'),
      canRead: (collection: string) => hasPermission(collection, 'read'),
      canUpdate: (collection: string) => hasPermission(collection, 'update'),
      canDelete: (collection: string) => hasPermission(collection, 'delete'),
      canManageSchedule,
      canRegisterAvailability,
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
  return role?.admin_access === true ;
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
