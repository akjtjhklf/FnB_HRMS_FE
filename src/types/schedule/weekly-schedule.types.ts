/**
 * Weekly Schedule Types
 * Based on BE: weekly-schedule.dto.ts
 */

export type WeeklyScheduleStatus = "draft" | "scheduled" | "finalized" | "cancelled";

export interface WeeklySchedule {
  id: string;
  week_start: string; // ISO date format
  week_end: string; // ISO date format
  created_by: string | null;
  status: WeeklyScheduleStatus;
  published_at: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateWeeklyScheduleDto {
  week_start: string;
  week_end: string;
  created_by?: string | null;
  status?: WeeklyScheduleStatus;
  published_at?: string | null;
  notes?: string | null;
}

export interface UpdateWeeklyScheduleDto extends Partial<CreateWeeklyScheduleDto> {}

// Extended types for UI
export interface WeeklyScheduleWithStats extends WeeklySchedule {
  total_shifts?: number;
  total_assignments?: number;
  coverage_percentage?: number;
  employees_count?: number;
}

// Validation Response
export interface ScheduleValidationResponse {
  canPublish: boolean;
  errors: string[];
  warnings: string[];
  totalShifts: number;
  totalRequirements: number;
}

// Readiness Check Response
export interface ScheduleReadinessIssue {
  shiftId: string;
  shiftDate: string;
  shiftType: string;
  positionId: string;
  positionName: string;
  required: number;
  assigned: number;
  missing: number;
}

export interface ScheduleReadinessResponse {
  isReady: boolean;
  canPublish: boolean;
  coverageRate: number;
  totalRequired: number;
  totalAssigned: number;
  missingAssignments: number;
  issues: ScheduleReadinessIssue[];
}

// Schedule Statistics Response
export interface ScheduleStats {
  schedule: WeeklySchedule;
  shifts: {
    total: number;
    byType: Record<string, number>;
    byDay: Record<string, number>;
  };
  employees: {
    registered: number;
    assigned: number;
    available: number;
  };
  availabilities: {
    total: number;
    byStatus: Record<string, number>;
  };
  assignments: {
    total: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
  };
}
