import { Employee } from "./employee";

// Permission interface
export interface Permission {
  id: string;
  collection: string;
  action: string;
  permissions?: Record<string, any>;
  validation?: Record<string, any>;
  presets?: Record<string, any>;
  fields?: string;
  policy: string; // References directus_policies.id
}

// Policy interface
export interface Policy {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  admin_access?: boolean;
  app_access?: boolean;
  enforce_tfa?: boolean;
  ip_access?: string[];
}

// Policy with permissions
export interface PolicyWithPermissions extends Policy {
  permissions?: Permission[];
}

// Role interface
export interface Role {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  parent?: string;
  admin_access?: boolean;  // ✅ NEW: For backward compatibility with hooks
  permissions?: Permission[];  // ✅ NEW: Quick access to permissions
}

// Role with full permissions structure
export interface RoleWithPermissions extends Role {
  policies?: PolicyWithPermissions[];
  all_permissions?: Permission[];
}

// Base User interface
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: Role | RoleWithPermissions | string; // Can be populated object or just ID
  status?: string;
  employee_id?: string; // Link to employees table
  last_access?: string;
  language?: string;
  theme_light?: string;
  theme_dark?: string;
  created_at?: string;
  updated_at?: string;
}

// Extended User Identity (returned from getIdentity)
export interface UserIdentity extends User {
  // Employee info (populated)
  employee?: Employee;
  
  // Role with full structure
  role?: RoleWithPermissions;
  
  // Flattened permissions array
  permissions?: Permission[];
  
  // Display name
  name?: string;
  
  // Quick access flags
  is_admin?: boolean;
  can_access_app?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refresh_token: string;
    expires: number;
    user: User;
  };
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
  expires: number;
}
