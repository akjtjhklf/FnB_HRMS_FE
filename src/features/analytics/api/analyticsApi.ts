/**
 * Analytics API Client
 * Handles all analytics-related API calls
 */

import axiosInstance from '@/axios-config/apiClient';
import { ANALYTICS_ENDPOINTS } from '@/axios-config/constants';

export interface OverviewStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
  newEmployeesThisMonth: number;
  totalAttendanceToday: number;
  lateToday: number;
  absentToday: number;
  attendanceRate: number;
  totalShiftsToday: number;
  scheduledEmployeesToday: number;
  scheduleCompletionRate: number;
  pendingRequests: number;
  pendingScheduleChangeRequests: number;
  pendingSalaryRequests: number;
}

export interface EmployeeAnalytics {
  byStatus: Array<{ status: string; count: number; percentage: number }>;
  byGender: Array<{ gender: string; count: number; percentage: number }>;
  totalCount: number;
  activeCount: number;
}

export interface AttendanceAnalytics {
  totalWorkDays: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  attendanceRate: number;
  lateRate: number;
  absentRate: number;
  topPerformers: Array<{
    employeeId: string;
    employeeName: string;
    attendanceRate: number;
    lateCount: number;
    totalShifts: number;
  }>;
}

export interface ScheduleAnalytics {
  totalShiftsAssigned: number;
  totalShiftsCompleted: number;
  totalShiftsInProgress: number;
  totalShiftsPending: number;
  completionRate: number;
  totalSwapRequests: number;
  approvedSwapRequests: number;
  totalChangeRequests: number;
  approvedChangeRequests: number;
  averageShiftsPerEmployee: number;
}

export interface SalaryAnalytics {
  totalPayroll: number;
  averageSalary: number;
  salaryDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  totalBaseSalary: number;
  totalNetPay: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  positionId?: string;
  employeeId?: string;
}

export const analyticsApi = {
  /**
   * Get overview dashboard statistics
   */
  async getOverview(date?: string): Promise<OverviewStats> {
    const params = date ? { date } : {};
    const response = await axiosInstance.get(ANALYTICS_ENDPOINTS.OVERVIEW, { params });
    return response.data.data;
  },

  /**
   * Get employee analytics
   */
  async getEmployees(filters?: AnalyticsFilters): Promise<EmployeeAnalytics> {
    const response = await axiosInstance.get(ANALYTICS_ENDPOINTS.EMPLOYEES, {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get attendance analytics
   */
  async getAttendance(filters?: AnalyticsFilters): Promise<AttendanceAnalytics> {
    const response = await axiosInstance.get(ANALYTICS_ENDPOINTS.ATTENDANCE, {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get schedule analytics
   */
  async getSchedule(filters?: AnalyticsFilters): Promise<ScheduleAnalytics> {
    const response = await axiosInstance.get(ANALYTICS_ENDPOINTS.SCHEDULE, {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get salary analytics
   */
  async getSalary(filters?: AnalyticsFilters): Promise<SalaryAnalytics> {
    const response = await axiosInstance.get(ANALYTICS_ENDPOINTS.SALARY, {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get trends data
   */
  async getTrends(filters?: AnalyticsFilters) {
    const response = await axiosInstance.get(ANALYTICS_ENDPOINTS.TRENDS, {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get employee performance ranking
   */
  async getPerformanceRanking(filters?: AnalyticsFilters & { limit?: number; sortBy?: string; order?: 'asc' | 'desc' }) {
    const response = await axiosInstance.get(ANALYTICS_ENDPOINTS.PERFORMANCE_RANKING, {
      params: filters,
    });
    return response.data.data;
  },
};
