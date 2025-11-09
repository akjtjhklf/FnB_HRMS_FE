// Auth types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: Role;
  status?: string;
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

export interface Role {
  id: string;
  name: string;
  description?: string;
  admin_access?: boolean;
  app_access?: boolean;
}

export interface Permission {
  id: string;
  role: string | Role;
  collection: string;
  action: string;
  permissions?: Record<string, any>;
  validation?: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  admin_access?: boolean;
  app_access?: boolean;
}
