// Schedule types based on BE models

// Shift Type (Loại ca: Sáng, Trưa, Chiều, Tối)
export interface ShiftType {
  id: string;
  name: string;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  cross_midnight?: boolean | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Shift (Ca làm việc cụ thể với ngày)
export interface Shift {
  id: string;
  schedule_id?: string | null;
  shift_type_id: string | ShiftType;
  shift_date: string; // ISO date
  day_of_week: number; // 0 (Sunday) to 6 (Saturday)
  name: string; // Shift name
  description?: string; // Optional shift description
  start_at: string; // Non-nullable start time
  end_at: string; // Non-nullable end time
  total_required?: number | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active: boolean; // Indicates if the shift is active
}

// DTOs for Shift
export interface CreateShiftDto {
  schedule_id?: string | null;
  shift_type_id: string;
  shift_date: string;
  start_at?: string | null;
  end_at?: string | null;
  total_required?: number | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}

// DTOs for ShiftType
export interface CreateShiftTypeDto {
  name: string;
  start_time: string;
  end_time: string;
  cross_midnight?: boolean | null;
  notes?: string | null;
}

export interface UpdateShiftTypeDto extends Partial<CreateShiftTypeDto> {}

// Position types
export interface Position {
  id: string;
  name: string;
  description?: string;
  department?: string;
  level?: string;
  created_at?: string;
  updated_at?: string;
}

// Shift Position Requirements
export interface ShiftPositionRequirement {
  id: string;
  shift_id: string;
  position_id: string | Position;
  required_count: number;
  created_at?: string;
  updated_at?: string;
}

// Employee Availability
export interface EmployeeAvailability {
  id: string;
  employee_id: string;
  shift_id: string | Shift;
  priority: number; // 1-10
  expires_at?: string | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Employee Availability Positions
export interface EmployeeAvailabilityPosition {
  id: string;
  availability_id: string;
  position_id: string | Position;
  preference_order?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Weekly Schedule
export interface WeeklySchedule {
  id: string;
  week_start: string; // ISO date
  week_end: string; // ISO date
  created_by?: string | null;
  status: "draft" | "scheduled" | "finalized" | "cancelled";
  published_at?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Schedule Assignment
export interface ScheduleAssignment {
  id: string;
  schedule_id?: string | null;
  shift_id: string | Shift;
  employee_id: string;
  position_id: string | Position;
  assigned_by?: string | null;
  assigned_at?: string | null;
  status: "assigned" | "tentative" | "swapped" | "cancelled";
  source: "auto" | "manual";
  note?: string | null;
  confirmed_by_employee?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

// DTO types for creating/updating

export interface CreateEmployeeAvailabilityDto {
  employee_id: string;
  shift_id: string;
  priority?: number;
  expires_at?: string | null;
  note?: string | null;
  positions: string[]; // Array of position IDs
}

export interface CreateScheduleAssignmentDto {
  schedule_id?: string | null;
  shift_id: string;
  employee_id: string;
  position_id: string;
  assigned_by?: string | null;
  status?: "assigned" | "tentative" | "swapped" | "cancelled";
  source?: "auto" | "manual";
  note?: string | null;
}

export interface AutoScheduleDto {
  scheduleId: string;
  overwriteExisting?: boolean;
  dryRun?: boolean;
}

export interface SwapScheduleDto {
  assignmentId1: string;
  assignmentId2: string;
  reason?: string;
}

// View models for UI

export interface DaySchedule {
  date: string;
  dayOfWeek: number;
  shifts: ShiftWithAvailability[];
}

export interface ShiftWithAvailability extends Shift {
  requirements: ShiftPositionRequirement[];
  availabilities: EmployeeAvailability[];
  assignments: ScheduleAssignment[];
}

export interface WeeklyScheduleView extends WeeklySchedule {
  days: DaySchedule[];
  totalAssignments: number;
  totalEmployees: number;
  coveragePercentage: number;
}

// Calendar view types
export interface CalendarDay {
  date: string;
  dayOfWeek: number;
  isCurrentWeek: boolean;
  shifts: CalendarShift[];
}

export interface CalendarShift {
  shift: Shift;
  requirements: ShiftPositionRequirement[];
  userAvailability?: EmployeeAvailability;
  userPositions?: EmployeeAvailabilityPosition[];
  totalAvailable: number;
  totalRequired: number;
  assignment?: ScheduleAssignment;
}

// Statistics
export interface ScheduleStats {
  scheduleId: string;
  weekStart: string;
  weekEnd: string;
  totalShifts: number;
  totalPositions: number;
  assignedCount: number;
  unassignedCount: number;
  coveragePercentage: number;
  employeeStats: EmployeeScheduleStats[];
}

export interface EmployeeScheduleStats {
  employeeId: string;
  employeeName: string;
  totalAssignments: number;
  totalHours: number;
  positions: string[];
}
export interface EmployeeAnalytic {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  inactiveEmployees: number;
}