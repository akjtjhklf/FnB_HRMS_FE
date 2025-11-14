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
  request_type: "raise" | "bonus" | "advance" | "adjustment";
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_date: string;
  reviewed_by?: string;
  reviewed_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
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
