import { Employee } from "./employee";
import { SalaryScheme } from "./salary";

// Monthly Payroll types
export interface MonthlyPayroll {
  id: string;
  employee_id: string | Employee;
  month: string; // format: YYYY-MM
  salary_scheme_id?: string | SalaryScheme | null;
  base_salary: number; // Lương cơ bản
  allowances: number; // Phụ cấp
  bonuses: number; // Thưởng
  overtime_pay: number; // Lương làm thêm
  deductions: number; // Khấu trừ (phạt, tiền đồng phục, etc)
  penalties: number; // Phạt
  gross_salary: number; // Tổng lương
  net_salary: number; // Thực lãnh
  total_work_hours?: number | null;
  overtime_hours?: number | null;
  late_minutes?: number | null;
  absent_days?: number | null;
  notes?: string | null;
  status: "draft" | "pending_approval" | "approved" | "paid";
  approved_by?: string | null;
  approved_at?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreatePayrollDto {
  employee_id: string;
  month: string;
  salary_scheme_id?: string | null;
  base_salary: number;
  allowances?: number;
  bonuses?: number;
  overtime_pay?: number;
  deductions?: number;
  penalties?: number;
  notes?: string | null;
}

export interface UpdatePayrollDto extends Partial<CreatePayrollDto> {
  status?: "draft" | "pending_approval" | "approved" | "paid";
}

// Payroll Detail for modal view
export interface PayrollDetail extends MonthlyPayroll {
  employee?: Employee;
  salary_scheme?: SalaryScheme;
  breakdown?: {
    base_salary: number;
    allowances: PayrollAllowanceItem[];
    bonuses: PayrollBonusItem[];
    overtime_pay: number;
    deductions: PayrollDeductionItem[];
    penalties: PayrollPenaltyItem[];
  };
}

export interface PayrollAllowanceItem {
  type: string;
  amount: number;
  description?: string;
}

export interface PayrollBonusItem {
  type: string;
  amount: number;
  description?: string;
}

export interface PayrollDeductionItem {
  type: string;
  amount: number;
  description?: string;
}

export interface PayrollPenaltyItem {
  type: string;
  amount: number;
  reason?: string;
}

// Payroll statistics
export interface PayrollStats {
  month: string;
  total_employees: number;
  total_gross_salary: number;
  total_net_salary: number;
  total_deductions: number;
  average_salary: number;
  status_breakdown: {
    draft: number;
    pending_approval: number;
    approved: number;
    paid: number;
  };
}
