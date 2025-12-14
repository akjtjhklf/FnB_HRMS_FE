// Export all types from separate files
export * from "./common";
export * from "./auth";
export * from "./employee";
export * from "./attendance";
export * from "./salary";
export * from "./schedule";

// Legacy types (keep for backward compatibility if needed)
// User and Authentication types
export interface User {
  id: string;
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
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  action: string;
  collection: string;
  fields?: string;
  permissions?: Record<string, any>;
  validation?: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role?: Role;
  scope?: Record<string, any>;
  created_at: string;
}

// Employee types
export interface Employee {
  id: string;
  user_id?: string;
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
  scheme_id?: string;
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
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// RFID Card types
export interface RfidCard {
  id: string;
  employee_id?: string;
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
  id: string;
  name: string;
  position_id?: string;
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
  id: string;
  card_uid: string;
  rfid_card_id?: string;
  employee_id?: string;
  device_id?: string;
  event_type: "tap" | "clock_in" | "clock_out";
  event_time: string;
  raw_payload?: string;
  processed: boolean;
  match_attempted_at?: string;
  created_at: string;
}

export interface AttendanceShift {
  id: string;
  shift_id?: string;
  schedule_assignment_id?: string;
  employee_id: string;
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
  id: string;
  name: string;
  location?: string;
  device_key: string;
  ip_address?: string;
  mac_address?: string;
  firmware_version?: string;
  last_seen_at?: string;
  status: "online" | "offline" | "decommissioned";
  current_mode: "attendance" | "enroll";
  employee_id_pending?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Posts example type
export interface Post {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  author_id: string;
  created_at: string;
  updated_at: string;
}

