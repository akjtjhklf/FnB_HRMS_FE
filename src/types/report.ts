// Report types
export type ReportType = "employees" | "attendance" | "payroll" | "schedule";
export type ExportFormat = "excel" | "pdf";
export type DateRangeType = "day" | "week" | "month" | "year" | "custom";

export interface ReportConfig {
  type: ReportType;
  dateRangeType: DateRangeType;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeReport {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  inactiveEmployees: number;
  suspendedEmployees?: number;
  byDepartment?: { department: string; count: number }[];
  byPosition?: { position: string; count: number }[];
}

export interface AttendanceReport {
  totalLogs: number;
  onTimeCount: number;
  lateCount: number;
  absentCount: number;
  averageWorkHours: number;
  byEmployee?: { employeeId: string; employeeName: string; totalHours: number; lateCount: number }[];
}

export interface PayrollReport {
  totalEmployees: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalDeductions: number;
  totalBonuses: number;
  averageSalary: number;
  byEmployee?: { employeeId: string; employeeName: string; netSalary: number }[];
}

export interface ScheduleReport {
  totalShifts: number;
  assignedShifts: number;
  unassignedShifts: number;
  coverageRate: number;
  overtimeHours: number;
  byPosition?: { position: string; assignedCount: number; requiredCount: number }[];
}

export type ReportData = EmployeeReport | AttendanceReport | PayrollReport | ScheduleReport;
