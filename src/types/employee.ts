import { User } from "./auth";

// Employee types
// Role type
export interface Role {
  id: string;
  name: string;
}

// User type FE
export interface UserWithRole extends User {
  role?: Role;
  policies?: any[];
}
// Employee types
export interface Employee {
  id: string;

  user_id: string | null;

  // populated từ BE
  user?: UserWithRole | null;

  employee_code: string;

  first_name: string | null;
  last_name: string | null;
  full_name: string | null;

  dob: string | null;
  gender: "male" | "female" | "other" | null;

  personal_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;

  hire_date: string | null;
  termination_date: string | null;

  status: "active" | "on_leave" | "suspended" | "terminated";

  scheme_id: string | null;
  position_id: string | null; // Added position_id

  default_work_hours_per_week: number | null;
  max_hours_per_week: number | null;
  max_consecutive_days: number | null;
  min_rest_hours_between_shifts: number | null;

  photo_url: string | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;

  notes: string | null;

  metadata: Record<string, any> | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface CreateEmployeeDto {
  user_id?: string | null;
  employee_code: string;

  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;

  dob?: string | null;
  gender?: "male" | "female" | "other" | null;

  personal_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;

  hire_date?: string | null;
  termination_date?: string | null;

  status?: "active" | "on_leave" | "suspended" | "terminated";

  scheme_id?: string | null;

  default_work_hours_per_week?: number | null;
  max_hours_per_week?: number | null;
  max_consecutive_days?: number | null;
  min_rest_hours_between_shifts?: number | null;

  photo_url?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;

  notes?: string | null;

  metadata?: Record<string, any> | null;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> { }

// Position types
export interface Position {
  id: string;
  name: string;
  description?: string;
  department?: string;
  level?: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePositionDto {
  name: string;
  description?: string;
  department?: string;
  level?: string;
  priority?: number;
}

export interface UpdatePositionDto extends Partial<CreatePositionDto> { }

// Contract types
export interface Contract {
  id: string;


  employee_id?: (Employee & { user?: UserWithRole | null }) | null;

  contract_type: "full_time" | "part_time" | "casual" | "probation" | null;

  start_date: string;
  end_date: string;

  base_salary: number | null;
  salary_scheme_id?: string | { id: string; name: string;[key: string]: any } | null;

  probation_end_date: string | null;

  signed_doc_url: string | null;

  is_active: boolean | null;

  notes: string | null;
  terms?: string | null;

  created_at: string | null;
  updated_at: string | null;
}

// Create / Update DTO vẫn giữ employee_id uuid
export interface CreateContractDto {
  employee_id: string;

  contract_type?: "full_time" | "part_time" | "casual" | "probation" | null;

  start_date?: string | null;
  end_date?: string | null;

  base_salary?: number | null;
  salary_scheme_id?: string | null;

  probation_end_date?: string | null;

  signed_doc_url?: string | null;

  is_active?: boolean | null;

  notes?: string | null;
  terms?: string | null;
}

export interface UpdateContractDto extends Partial<CreateContractDto> { }

// RFID Card types
export interface RfidCard {
  id: string;
  card_number: string;
  employee_id?: string | Employee;
  status: "active" | "inactive" | "lost";
  issued_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRfidCardDto {
  card_number: string;
  employee_id?: string;
  status?: "active" | "inactive" | "lost";
  issued_date?: string;
}

export interface UpdateRfidCardDto extends Partial<CreateRfidCardDto> { }
