import { UserIdentity, Permission } from "@/types/auth";

/**
 * Permission Helper Utilities
 * Sử dụng với identity từ useGetIdentity<UserIdentity>()
 */

/**
 * Check if user has specific permission
 * @param identity - User identity from useGetIdentity
 * @param action - Action to check (create, read, update, delete)
 * @param collection - Collection name
 * @returns true if user has permission
 */
export function hasPermission(
  identity: UserIdentity | undefined | null,
  action: string,
  collection: string
): boolean {
  if (!identity) return false;

  // Admin có full access
  if (identity.is_admin) return true;

  // Kiểm tra trong permissions list
  if (!identity.permissions || identity.permissions.length === 0) return false;

  return identity.permissions.some(
    (perm) => perm.action === action && perm.collection === collection
  );
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  identity: UserIdentity | undefined | null,
  requiredPerms: Array<{ action: string; collection: string }>
): boolean {
  if (!identity) return false;
  if (identity.is_admin) return true;

  return requiredPerms.some((req) =>
    hasPermission(identity, req.action, req.collection)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  identity: UserIdentity | undefined | null,
  requiredPerms: Array<{ action: string; collection: string }>
): boolean {
  if (!identity) return false;
  if (identity.is_admin) return true;

  return requiredPerms.every((req) =>
    hasPermission(identity, req.action, req.collection)
  );
}

/**
 * Get permissions for a specific collection
 */
export function getCollectionPermissions(
  identity: UserIdentity | undefined | null,
  collection: string
): Permission[] {
  if (!identity || !identity.permissions) return [];

  return identity.permissions.filter((perm) => perm.collection === collection);
}

/**
 * Get allowed actions for a collection
 */
export function getAllowedActions(
  identity: UserIdentity | undefined | null,
  collection: string
): string[] {
  if (!identity) return [];
  if (identity.is_admin) return ["create", "read", "update", "delete"];

  const perms = getCollectionPermissions(identity, collection);
  const actions = perms.map((p) => p.action);
  return actions.filter((action, index) => actions.indexOf(action) === index);
}

/**
 * Check if user is admin
 */
export function isAdmin(identity: UserIdentity | undefined | null): boolean {
  return identity?.is_admin === true;
}

/**
 * Check if user can access app
 */
export function canAccessApp(identity: UserIdentity | undefined | null): boolean {
  return identity?.can_access_app === true;
}

/**
 * Get user's role name
 */
export function getRoleName(identity: UserIdentity | undefined | null): string {
  if (!identity?.role) return "Unknown";
  return typeof identity.role === "string"
    ? identity.role
    : identity.role.name || "Unknown";
}

/**
 * Get user's employee info
 */
export function getEmployeeInfo(identity: UserIdentity | undefined | null) {
  return identity?.employee || null;
}

/**
 * Check if user is linked to an employee
 */
export function hasEmployeeLink(identity: UserIdentity | undefined | null): boolean {
  return !!identity?.employee_id || !!identity?.employee;
}
