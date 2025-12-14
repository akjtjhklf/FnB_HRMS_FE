import { Employee } from "./employee";

// Salary Scheme types
export interface SalaryScheme {
  id: string;
  name: string;
  base_salary: number;
  allowances?: Record<string, number>;
  deductions?: Record<string, number>;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSalarySchemeDto {
  name: string;
  base_salary: number;
  allowances?: Record<string, number>;
  deductions?: Record<string, number>;
  description?: string;
}

export interface UpdateSalarySchemeDto extends Partial<CreateSalarySchemeDto> {}

// Salary Request types
export interface SalaryRequest {
  id: string;
  employee_id: string | Employee;
  current_scheme_id?: string | null;
  proposed_scheme_id?: string | null;
  current_rate?: number | null;
  proposed_rate?: number | null;
  request_date: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: string | null;
  approved_at?: string | null;
  note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Deduction types
export interface Deduction {
  id: string;
  employee_id: string | Employee;
  deduction_type: "tax" | "insurance" | "loan" | "other";
  amount: number;
  description?: string;
  deduction_date: string;
  status: "pending" | "applied" | "cancelled";
  created_at?: string;
  updated_at?: string;
}
