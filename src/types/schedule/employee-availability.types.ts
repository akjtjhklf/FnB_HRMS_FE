/**
 * Employee Availability Types
 * Based on BE: employee-availability.dto.ts
 */

import { Shift } from "./shift.types";

export interface EmployeeAvailability {
  id: string;
  employee_id: string;
  shift_id: string;
  priority: number | null; // 1-10, auto-calculated by role
  expires_at: string | null;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateEmployeeAvailabilityDto {
  employee_id: string;
  shift_id: string;
  priority?: number; // Auto-set by role on FE
  expires_at?: string | null;
  note?: string | null;
}

export interface UpdateEmployeeAvailabilityDto extends Partial<CreateEmployeeAvailabilityDto> {}

/**
 * Employee Availability Position Types
 * Junction table linking availability to multiple positions
 */
export interface EmployeeAvailabilityPosition {
  id: string;
  availability_id: string;
  position_id: string;
  preference_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateEmployeeAvailabilityPositionDto {
  availability_id: string;
  position_id: string;
  preference_order?: number | null;
}
