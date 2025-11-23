/**
 * Shift Position Requirement Types
 * Based on BE: shift-position-requirement.dto.ts
 */

import { Position } from "../employee";

export interface ShiftPositionRequirement {
  id: string;
  shift_id: string;
  position_id: string;
  required_count: number;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Populated fields
  position?: Position;
}

export interface CreateShiftPositionRequirementDto {
  shift_id: string;
  position_id: string;
  required_count: number;
  notes?: string | null;
}

export interface UpdateShiftPositionRequirementDto extends Partial<CreateShiftPositionRequirementDto> {}
