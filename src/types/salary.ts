import { Employee, Position } from "./employee";
import { Shift } from "./attendance";

// Salary Scheme types
export interface SalaryScheme {
  id: string;
  name: string;
  base_salary: number;
  allowances?: Record<string, number>;
  deductions?: Record<string, number>;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSalarySchemeDto {
  name: string;
  base_salary: number;
  allowances?: Record<string, number>;
  deductions?: Record<string, number>;
  description?: string;
}

export interface UpdateSalarySchemeDto extends Partial<CreateSalarySchemeDto> {}

// Salary Request types
export interface SalaryRequest {
  id: string;
  employee_id: string | Employee;
  request_type: "raise" | "bonus" | "advance" | "adjustment";
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_date: string;
  reviewed_by?: string;
  reviewed_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Deduction types
export interface Deduction {
  id: string;
  employee_id: string | Employee;
  deduction_type: "tax" | "insurance" | "loan" | "other";
  amount: number;
  description?: string;
  deduction_date: string;
  status: "pending" | "applied" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

// Schedule types
export interface WeeklySchedule {
  id: string;
  name: string;
  week_start_date: string;
  week_end_date: string;
  status: "draft" | "published" | "archived";
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleAssignment {
  id: string;
  employee_id: string | Employee;
  shift_id: string | Shift;
  weekly_schedule_id: string | WeeklySchedule;
  date: string;
  position_id?: string | Position;
  status: "scheduled" | "confirmed" | "cancelled";
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleChangeRequest {
  id: string;
  employee_id: string | Employee;
  original_assignment_id: string | ScheduleAssignment;
  requested_shift_id?: string | Shift;
  requested_date?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_date_time: string;
  reviewed_by?: string;
  reviewed_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Shift Position Requirement types
export interface ShiftPositionRequirement {
  id: string;
  shift_id: string | Shift;
  position_id: string | Position;
  required_count: number;
  created_at?: string;
  updated_at?: string;
}

// Employee Availability types
export interface EmployeeAvailability {
  id: string;
  employee_id: string | Employee;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeAvailabilityPosition {
  id: string;
  employee_id: string | Employee;
  position_id: string | Position;
  proficiency_level?: "beginner" | "intermediate" | "advanced" | "expert";
  is_preferred: boolean;
  created_at?: string;
  updated_at?: string;
}
