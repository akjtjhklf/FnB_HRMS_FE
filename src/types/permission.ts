export interface Permission {
  id: string;
  collection: string;
  action: string;
  permissions?: Record<string, any> | null;
  validation?: Record<string, any> | null;
  presets?: Record<string, any> | null;
  fields?: string | null;
  policy: string; // Policy ID
}

export interface Policy {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  ip_access?: string | null;
  enforce_tfa: boolean;
  admin_access: boolean;
  app_access: boolean;
}

export type CreatePermissionDto = Omit<Permission, "id">;
export type UpdatePermissionDto = Partial<CreatePermissionDto>;

export type CreatePolicyDto = Omit<Policy, "id">;
export type UpdatePolicyDto = Partial<CreatePolicyDto>;

// Common actions for permissions
export const PERMISSION_ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  SHARE: "share",
} as const;

// Common collections
export const COLLECTIONS = {
  EMPLOYEES: "employees",
  ATTENDANCE: "attendance_logs",
  SCHEDULES: "schedule_assignments",
  CONTRACTS: "contracts",
  PAYROLLS: "monthly_payrolls",
  POSITIONS: "positions",
  ROLES: "directus_roles",
  USERS: "directus_users",
} as const;
