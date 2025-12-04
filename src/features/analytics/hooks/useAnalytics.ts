/**
 * useAnalytics Hook
 * Fetch analytics data using Refine's dataProvider + React Query
 */

import { useDataProvider } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import { ANALYTICS_ENDPOINTS } from "@/axios-config/constants";
import type { 
  OverviewStats, 
  EmployeeAnalytics, 
  AttendanceAnalytics, 
  ScheduleAnalytics, 
  SalaryAnalytics, 
  AnalyticsFilters 
} from "../api/analyticsApi";

export function useOverviewStats(date?: string) {
  const dataProvider = useDataProvider();
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', 'overview', date],
    queryFn: async () => {
      const dp = dataProvider();
      if (!dp.custom) throw new Error("DataProvider does not support custom method");
      
      const response = await dp.custom({
        url: ANALYTICS_ENDPOINTS.OVERVIEW,
        method: "get",
        query: date ? { date } : undefined,
      });
      return response.data as OverviewStats;
    },
    enabled: true,
  });

  return { 
    data: data || null, 
    loading: isLoading, 
    error: isError ? (error as any)?.message || "Không thể tải dữ liệu" : null, 
    refresh: refetch 
  };
}

export function useEmployeeAnalytics(filters?: AnalyticsFilters) {
  const dataProvider = useDataProvider();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', 'employees', filters],
    queryFn: async () => {
      const dp = dataProvider();
      if (!dp.custom) throw new Error("DataProvider does not support custom method");

      const response = await dp.custom({
        url: ANALYTICS_ENDPOINTS.EMPLOYEES,
        method: "get",
        query: filters,
      });
      return response.data as EmployeeAnalytics;
    },
    enabled: true,
  });

  return { 
    data: data || null, 
    loading: isLoading, 
    error: isError ? (error as any)?.message || "Không thể tải dữ liệu nhân viên" : null, 
    refresh: refetch 
  };
}

export function useAttendanceAnalytics(filters?: AnalyticsFilters) {
  const dataProvider = useDataProvider();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', 'attendance', filters],
    queryFn: async () => {
      const dp = dataProvider();
      if (!dp.custom) throw new Error("DataProvider does not support custom method");

      const response = await dp.custom({
        url: ANALYTICS_ENDPOINTS.ATTENDANCE,
        method: "get",
        query: filters,
      });
      return response.data as AttendanceAnalytics;
    },
    enabled: true,
  });

  return { 
    data: data || null, 
    loading: isLoading, 
    error: isError ? (error as any)?.message || "Không thể tải dữ liệu chấm công" : null, 
    refresh: refetch 
  };
}

export function useScheduleAnalytics(filters?: AnalyticsFilters) {
  const dataProvider = useDataProvider();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', 'schedule', filters],
    queryFn: async () => {
      const dp = dataProvider();
      if (!dp.custom) throw new Error("DataProvider does not support custom method");

      const response = await dp.custom({
        url: ANALYTICS_ENDPOINTS.SCHEDULE,
        method: "get",
        query: filters,
      });
      return response.data as ScheduleAnalytics;
    },
    enabled: true,
  });

  return { 
    data: data || null, 
    loading: isLoading, 
    error: isError ? (error as any)?.message || "Không thể tải dữ liệu lịch làm" : null, 
    refresh: refetch 
  };
}

export function useSalaryAnalytics(filters?: AnalyticsFilters) {
  const dataProvider = useDataProvider();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', 'salary', filters],
    queryFn: async () => {
      const dp = dataProvider();
      if (!dp.custom) throw new Error("DataProvider does not support custom method");

      const response = await dp.custom({
        url: ANALYTICS_ENDPOINTS.SALARY,
        method: "get",
        query: filters,
      });
      return response.data as SalaryAnalytics;
    },
    enabled: true,
  });

  return { 
    data: data || null, 
    loading: isLoading, 
    error: isError ? (error as any)?.message || "Không thể tải dữ liệu lương" : null, 
    refresh: refetch 
  };
}
