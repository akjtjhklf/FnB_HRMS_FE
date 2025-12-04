export interface MonthlyPayroll {
  id: string;
  employee_id: string;
  month: string;
  base_salary: number;
  allowances: number;
  bonuses: number;
  overtime_pay: number;
  deductions: number;
  penalties: number;
  gross_salary: number;
  net_salary: number;
  status: "draft" | "pending_approval" | "approved" | "paid";
  approved_by?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  notes?: string | null;
  
  // Expanded fields
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
  };
}

export interface SalaryRequest {
  id: string;
  employee_id: string;
  type: "raise" | "adjustment";
  
  current_scheme_id?: string | null;
  proposed_scheme_id?: string | null;
  current_rate?: number | null;
  proposed_rate?: number | null;
  
  payroll_id?: string | null;
  adjustment_amount?: number | null;
  
  reason?: string | null;
  manager_note?: string | null;
  
  request_date: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: string | null;
  approved_at?: string | null;
  
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
  };
}

export interface SalaryScheme {
  id: string;
  name: string;
  pay_type: "hourly" | "fixed_shift" | "monthly";
  rate: number;
  is_active: boolean;
}
