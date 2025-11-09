import { Employee } from "./employee";

// Attendance types
export interface AttendanceLog {
  id: string;
  employee_id: string | Employee;
  device_id?: string | Device;
  check_in_time?: string;
  check_out_time?: string;
  status: "present" | "absent" | "late" | "early_leave";
  date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAttendanceLogDto {
  employee_id: string;
  device_id?: string;
  check_in_time?: string;
  check_out_time?: string;
  status: "present" | "absent" | "late" | "early_leave";
  date: string;
  notes?: string;
}

export interface UpdateAttendanceLogDto extends Partial<CreateAttendanceLogDto> {}

// Attendance Shift types
export interface AttendanceShift {
  id: string;
  employee_id: string | Employee;
  shift_id: string | Shift;
  date: string;
  status: "scheduled" | "completed" | "missed" | "cancelled";
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Attendance Adjustment types
export interface AttendanceAdjustment {
  id: string;
  attendance_log_id: string | AttendanceLog;
  employee_id: string | Employee;
  adjustment_type: "add" | "modify" | "delete";
  original_check_in?: string;
  original_check_out?: string;
  adjusted_check_in?: string;
  adjusted_check_out?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_by?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Device types
export interface Device {
  id: string;
  device_name: string;
  device_code: string;
  device_type: "rfid" | "biometric" | "mobile";
  location?: string;
  ip_address?: string;
  status: "active" | "inactive" | "maintenance";
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeviceDto {
  device_name: string;
  device_code: string;
  device_type: "rfid" | "biometric" | "mobile";
  location?: string;
  ip_address?: string;
  status?: "active" | "inactive" | "maintenance";
}

export interface UpdateDeviceDto extends Partial<CreateDeviceDto> {}

// Monthly Employee Stats types
export interface MonthlyEmployeeStat {
  id: string;
  employee_id: string | Employee;
  month: number;
  year: number;
  total_working_days: number;
  total_present_days: number;
  total_absent_days: number;
  total_late_days: number;
  total_early_leave_days: number;
  total_overtime_hours: number;
  created_at?: string;
  updated_at?: string;
}

// Shift types
export interface Shift {
  id: string;
  name: string;
  shift_type_id?: string | ShiftType;
  start_time: string;
  end_time: string;
  break_duration?: number; // minutes
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShiftType {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShiftDto {
  name: string;
  shift_type_id?: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  description?: string;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}
