/**
 * Schedule Assignment Types
 * Based on BE: schedule-assignment.dto.ts
 */

import type { Shift } from "./shift.types";

export type AssignmentStatus = "assigned" | "tentative" | "swapped" | "cancelled";
export type AssignmentSource = "auto" | "manual";

// Position type (simple version - full type is in @/types/employee)
export interface Position {
  id: string;
  name: string;
}

// Note: shift and position are populated via meta fields in queries
export interface ScheduleAssignment {
  id: string;
  schedule_id: string | null;
  shift_id: string;
  employee_id: string;
  position_id: string;
  assigned_by: string | null;
  assigned_at: string | null;
  status: AssignmentStatus;
  source: AssignmentSource;
  note: string | null;
  confirmed_by_employee: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Populated fields (optional - available when using meta fields in queries)
  shift?: Shift;
  position?: Position;
}

export interface CreateScheduleAssignmentDto {
  schedule_id?: string | null;
  shift_id: string;
  employee_id: string;
  position_id: string;
  assigned_by?: string | null;
  assigned_at?: string | null;
  status?: AssignmentStatus;
  source?: AssignmentSource;
  note?: string | null;
  confirmed_by_employee?: boolean | null;
}

export interface UpdateScheduleAssignmentDto extends Partial<CreateScheduleAssignmentDto> {}

export interface AutoScheduleDto {
  scheduleId: string;
  overwriteExisting?: boolean;
  dryRun?: boolean;
}

export interface AutoScheduleResult {
  success: boolean;
  message: string;
  assignments?: ScheduleAssignment[];
  errors?: string[];
}
