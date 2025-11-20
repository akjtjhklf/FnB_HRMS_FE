/**
 * Shift Types
 * Based on BE: shift.dto.ts
 */

import { ShiftType } from "./shift-type.types";

export interface Shift {
  id: string;
  schedule_id: string | null;
  shift_type_id: string;
  shift_date: string; // ISO date
  start_at: string | null;
  end_at: string | null;
  total_required: number | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Populated fields
  shift_type?: ShiftType;
}

export interface CreateShiftDto {
  schedule_id?: string | null;
  shift_type_id: string;
  shift_date: string;
  start_at?: string | null;
  end_at?: string | null;
  total_required?: number | null;
  notes?: string | null;
  metadata?: Record<string, any> | null;
  created_by?: string | null;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}

// Bulk Create
export interface BulkCreateShiftDto {
  shifts: CreateShiftDto[];
}

export interface BulkCreateShiftResponse {
  total: number;
  shifts: Shift[];
}
