import { User } from "./auth";

// Employee types
export interface Employee {
  id: string;
  user_id?: string | User;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  avatar?: string;
  position_id?: string | Position;
  hire_date?: string;
  employment_status?: "active" | "inactive" | "on_leave" | "terminated";
  salary_scheme_id?: string;
  rfid_card_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeeDto {
  user_id?: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  position_id?: string;
  hire_date?: string;
  employment_status?: "active" | "inactive" | "on_leave" | "terminated";
  salary_scheme_id?: string;
  rfid_card_id?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

// Position types
export interface Position {
  id: string;
  name: string;
  description?: string;
  department?: string;
  level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePositionDto {
  name: string;
  description?: string;
  department?: string;
  level?: string;
}

export interface UpdatePositionDto extends Partial<CreatePositionDto> {}

// Contract types
export interface Contract {
  id: string;
  employee_id: string | Employee;
  contract_type: "full_time" | "part_time" | "contract" | "internship";
  start_date: string;
  end_date?: string;
  salary: number;
  terms?: string;
  status: "active" | "expired" | "terminated";
  created_at?: string;
  updated_at?: string;
}

export interface CreateContractDto {
  employee_id: string;
  contract_type: "full_time" | "part_time" | "contract" | "internship";
  start_date: string;
  end_date?: string;
  salary: number;
  terms?: string;
  status?: "active" | "expired" | "terminated";
}

export interface UpdateContractDto extends Partial<CreateContractDto> {}

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

export interface UpdateRfidCardDto extends Partial<CreateRfidCardDto> {}
