/**
 * Schedule Change Request Types
 * Based on BE: schedule-change-request.dto.ts
 */

export type ChangeRequestType = "shift_swap" | "pass_shift" | "day_off";
export type ChangeRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ScheduleChangeRequest {
  id: string;
  requester_id: string;
  type: ChangeRequestType;
  from_shift_id: string | null;
  to_shift_id: string | null;
  target_employee_id: string | null;
  replacement_employee_id: string | null;
  reason: string | null;
  status: ChangeRequestStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateScheduleChangeRequestDto {
  requester_id: string;
  type: ChangeRequestType;
  from_shift_id?: string | null;
  to_shift_id?: string | null;
  target_employee_id?: string | null;
  replacement_employee_id?: string | null;
  reason?: string | null;
  status?: ChangeRequestStatus;
}

export interface UpdateScheduleChangeRequestDto extends Partial<CreateScheduleChangeRequestDto> {}

export interface ApproveChangeRequestDto {
  approved_by: string;
  notes?: string;
}

export interface RejectChangeRequestDto {
  approved_by: string;
  reason?: string;
}
