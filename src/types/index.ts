// Export all types from separate files
export * from "./common";
export * from "./auth";
export * from "./employee";
export * from "./attendance";
export * from "./salary";

// Legacy types (keep for backward compatibility if needed)
// User and Authentication types
export interface User {
  id: number;
  email: string;
  username?: string;
  is_active: boolean;
  last_login?: string;
  preferred_language?: string;
  timezone?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  action: string;
  collection: string;
  fields?: string;
  permissions?: Record<string, any>;
  validation?: Record<string, any>;
}

export interface Policy {
  id: number;
  name: string;
  roles: Role[];
  permissions: Permission[];
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  role?: Role;
  scope?: Record<string, any>;
  created_at: string;
}

// Employee types
export interface Employee {
  id: number;
  user_id?: number;
  employee_code: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  personal_id?: string;
  phone?: string;
  email?: string;
  address?: string;
  hire_date?: string;
  termination_date?: string;
  status?: "active" | "on_leave" | "suspended" | "terminated";
  scheme_id?: number;
  default_work_hours_per_week?: number;
  max_hours_per_week?: number;
  max_consecutive_days?: number;
  min_rest_hours_between_shifts?: number;
  photo_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Position types
export interface Position {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// RFID Card types
export interface RfidCard {
  id: number;
  employee_id?: number;
  card_uid: string;
  issued_at?: string;
  revoked_at?: string;
  status: "active" | "suspended" | "lost" | "revoked";
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Salary Scheme types
export interface SalaryScheme {
  id: number;
  name: string;
  position_id?: number;
  pay_type: "hourly" | "fixed_shift" | "monthly";
  rate: number;
  min_hours?: number;
  overtime_multiplier?: number;
  effective_from?: string;
  effective_to?: string;
  is_active: boolean;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Attendance types
export interface AttendanceLog {
  id: number;
  card_uid: string;
  rfid_card_id?: number;
  employee_id?: number;
  device_id?: number;
  event_type: "tap" | "clock_in" | "clock_out";
  event_time: string;
  raw_payload?: string;
  processed: boolean;
  match_attempted_at?: string;
  created_at: string;
}

export interface AttendanceShift {
  id: number;
  shift_id?: number;
  schedule_assignment_id?: number;
  employee_id: number;
  clock_in?: string;
  clock_out?: string;
  worked_minutes?: number;
  late_minutes?: number;
  early_leave_minutes?: number;
  status: "present" | "absent" | "partial";
  manual_adjusted: boolean;
  created_at: string;
  updated_at: string;
}

// Device types
export interface Device {
  id: number;
  name: string;
  location?: string;
  device_key: string;
  ip_address?: string;
  mac_address?: string;
  firmware_version?: string;
  last_seen_at?: string;
  status: "online" | "offline" | "decommissioned";
  current_mode: "attendance" | "enroll";
  employee_id_pending?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Posts example type
export interface Post {
  id: number;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  author_id: number;
  created_at: string;
  updated_at: string;
}
