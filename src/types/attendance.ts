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

// Monthly Timesheet types for comprehensive attendance management
export interface MonthlyTimesheet {
  id: string;
  employee_id: string | Employee;
  month: string; // format: YYYY-MM
  total_work_hours: number;
  total_days: number;
  absent_days: number;
  late_days: number;
  current_salary_rate: number;
  estimated_salary: number;
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Salary Advance Request
export interface SalaryAdvanceRequest {
  id: string;
  employee_id: string | Employee;
  month: string; // format: YYYY-MM
  estimated_salary: number;
  requested_amount: number;
  request_date: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: string;
  approved_at?: string;
  reason?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSalaryAdvanceRequestDto {
  employee_id: string;
  month: string;
  estimated_salary: number;
  requested_amount: number;
  reason?: string;
}

// Attendance Adjustment Request
export interface AttendanceAdjustmentRequest {
  id: string;
  attendance_log_id?: string;
  employee_id: string | Employee;
  date: string;
  adjustment_type: "add" | "modify" | "delete";
  original_check_in?: string;
  original_check_out?: string;
  requested_check_in?: string;
  requested_check_out?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAttendanceAdjustmentRequestDto {
  attendance_log_id?: string;
  employee_id: string;
  date: string;
  adjustment_type: "add" | "modify" | "delete";
  original_check_in?: string;
  original_check_out?: string;
  requested_check_in?: string;
  requested_check_out?: string;
  reason: string;
}

// Attendance Shift types
export interface AttendanceShift {
  id: string;
  employee_id: string | Employee;
  shift_id: string | WorkShift;
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

// WorkShift types (renamed from Shift to avoid conflict with schedule.ts)
export interface WorkShift {
  id: string;
  name: string;
  shift_type_id?: string | WorkShiftType;
  start_time: string;
  end_time: string;
  break_duration?: number; // minutes
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkShiftType {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWorkShiftDto {
  name: string;
  shift_type_id?: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  description?: string;
}

export interface UpdateWorkShiftDto extends Partial<CreateWorkShiftDto> {}
