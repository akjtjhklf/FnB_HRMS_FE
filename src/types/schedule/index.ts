/**
 * Schedule Module Types Index
 * Centralized export for all schedule-related types
 */

// Weekly Schedule
export * from "./weekly-schedule.types";

// Shift Type
export * from "./shift-type.types";

// Shift
export * from "./shift.types";

// Employee Availability
export * from "./employee-availability.types";

// Schedule Assignment
export * from "./schedule-assignment.types";

// Schedule Change Request
export * from "./schedule-change-request.types";

// Shift Position Requirement
export * from "./shift-position-requirement.types";

// Common types for Schedule UI
export interface ScheduleStats {
  total_schedules: number;
  draft_schedules: number;
  published_schedules: number;
  finalized_schedules: number;
  total_shifts: number;
  assigned_shifts: number;
  coverage_percentage: number;
  pending_availabilities: number;
  pending_change_requests: number;
}

export interface DashboardStats {
  thisWeek: {
    schedule_id: string | null;
    total_shifts: number;
    assigned_shifts: number;
    coverage: number;
  };
  upcomingSchedules: Array<{
    id: string;
    week_start: string;
    week_end: string;
    status: string;
  }>;
  pendingRequests: {
    availabilities: number;
    change_requests: number;
  };
}
