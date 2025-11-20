/**
 * Employee Availability Types
 * Based on BE: employee-availability.dto.ts
 */

import { Shift } from "./shift.types";

export type AvailabilityStatus = "pending" | "approved" | "rejected";

export interface EmployeeAvailability {
  id: string;
  employee_id: string;
  shift_id: string;
  priority: number | null; // 1-10, auto-calculated by role
  expires_at: string | null;
  note: string | null;
  status: AvailabilityStatus;
  created_at: string | null;
  updated_at: string | null;
  
  // Populated fields
  shift?: Shift;
}

export interface CreateEmployeeAvailabilityDto {
  employee_id: string;
  shift_id: string;
  priority?: number; // Auto-set by role on FE
  expires_at?: string | null;
  note?: string | null;
}

export interface UpdateEmployeeAvailabilityDto extends Partial<CreateEmployeeAvailabilityDto> {
  status?: AvailabilityStatus;
}
