/**
 * Shift Type Types
 * Based on BE: shift-type.dto.ts
 */

export interface ShiftType {
  id: string;
  name: string;
  start_time: string; // HH:mm:ss format
  end_time: string; // HH:mm:ss format
  cross_midnight: boolean | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateShiftTypeDto {
  name: string;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  cross_midnight?: boolean | null;
  notes?: string | null;
}

export interface UpdateShiftTypeDto extends Partial<CreateShiftTypeDto> {}
