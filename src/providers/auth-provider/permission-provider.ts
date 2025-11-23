/**
 * Permission Provider
 * Fetch and cache user permissions from Directus
 */

import axiosClient from "@/axios-config/apiClient";

export interface Permission {
  id: string;
  collection: string;
  action: string;
  permissions?: Record<string, unknown> | null;
  validation?: Record<string, unknown> | null;
  fields?: string | null;
  policy: string;
}

export interface Policy {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  admin_access: boolean;
  app_access: boolean;
}

/**
 * Fetch permissions for current user's role
 */
export async function fetchUserPermissions(roleId: string): Promise<Permission[]> {
  try {
    // TODO: Implement proper API endpoint to get permissions by role
    // This should call BE endpoint: GET /permissions?filter[role][_eq]=${roleId}
    
    const response = await axiosClient.get<ResponseAPI<Permission[]>>(
      `/permissions?filter[role][_eq]=${roleId}`
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
    return [];
  }
}

/**
 * Fetch policies for current user's role
 */
export async function fetchUserPolicies(roleId: string): Promise<Policy[]> {
  try {
    // TODO: Implement proper API endpoint to get policies by role
    // This should call BE endpoint: GET /policies?filter[role][_eq]=${roleId}
    
    const response = await axiosClient.get<ResponseAPI<Policy[]>>(
      `/policies?filter[role][_eq]=${roleId}`
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch policies:", error);
    return [];
  }
}

/**
 * Check if user has specific permission
 */
export function checkPermission(
  permissions: Permission[],
  collection: string,
  action: string
): boolean {
  return permissions.some(
    (p) => p.collection === collection && p.action === action
  );
}

/**
 * Permission cache (in-memory for session)
 */
class PermissionCache {
  private permissions: Map<string, Permission[]> = new Map();
  private policies: Map<string, Policy[]> = new Map();

  async getPermissions(roleId: string): Promise<Permission[]> {
    if (!this.permissions.has(roleId)) {
      const perms = await fetchUserPermissions(roleId);
      this.permissions.set(roleId, perms);
    }
    return this.permissions.get(roleId) || [];
  }

  async getPolicies(roleId: string): Promise<Policy[]> {
    if (!this.policies.has(roleId)) {
      const pols = await fetchUserPolicies(roleId);
      this.policies.set(roleId, pols);
    }
    return this.policies.get(roleId) || [];
  }

  clear() {
    this.permissions.clear();
    this.policies.clear();
  }
}

export const permissionCache = new PermissionCache();
