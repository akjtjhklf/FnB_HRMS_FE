// Employee info trong payroll
export interface PayrollEmployee {
  id: string;
  full_name: string;
  employee_code: string;
  department_id?: any;
  position_id?: any;
  avatar?: string;
}

// Monthly Payroll status
export type PayrollStatus = "draft" | "pending_approval" | "approved" | "paid";

// Pay type
export type PayType = "hourly" | "fixed_shift" | "monthly";

// Monthly Payroll interface - based on API response
export interface MonthlyPayroll {
  id: string;
  employee_id: string;
  employee?: PayrollEmployee;
  month: string; // format: YYYY-MM
  salary_scheme_id?: string | null;
  contract_id?: string | null;
  pay_type: PayType;
  hourly_rate?: string | null;
  base_salary: string | number;
  overtime_pay: string | number;
  deductions: string | number;
  penalties: string | number;
  net_salary: string | number;
  total_work_hours: string | number;
  total_work_days: number;
  total_late_minutes: number;
  total_early_leave_minutes: number;
  late_penalty: string | number;
  early_leave_penalty: string | number;
  notes?: string | null;
  status: PayrollStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Legacy/optional fields for backward compatibility
  allowances?: number;
  bonuses?: number;
  gross_salary?: number;
  late_days?: number;
  absent_days?: number;
}

// API Response types
export interface PayrollListResponse {
  success: boolean;
  data: {
    items: MonthlyPayroll[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

// Salary Request types
export type SalaryRequestType = "raise" | "adjustment";
export type SalaryRequestStatus = "pending" | "approved" | "rejected";

export interface SalaryRequest {
  id: string;
  employee_id: string;
  type: SalaryRequestType;
  
  current_scheme_id?: string | null;
  proposed_scheme_id?: string | null;
  current_rate?: number | null;
  proposed_rate?: number | null;
  
  payroll_id?: string | null;
  adjustment_amount?: number | null;
  
  reason?: string | null;
  manager_note?: string | null;
  
  request_date: string;
  status: SalaryRequestStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  
  employee?: PayrollEmployee;
}

// Salary Scheme interface
export interface SalaryScheme {
  id: string;
  name: string;
  pay_type: PayType;
  rate: number;
  is_active: boolean;
}

// Create/Update DTOs
export interface CreatePayrollDto {
  employee_id: string;
  month: string;
  salary_scheme_id?: string | null;
  contract_id?: string | null;
  pay_type?: PayType;
  base_salary: number;
  overtime_pay?: number;
  deductions?: number;
  penalties?: number;
  notes?: string | null;
}

export interface UpdatePayrollDto extends Partial<CreatePayrollDto> {
  status?: PayrollStatus;
}

// Payroll statistics
export interface PayrollStats {
  total: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
}
