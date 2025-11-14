import { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { useDashboardStore } from "../stores/dashboardStore";
import { Employee } from "@/types/employee";
import { AttendanceLog } from "@/types/attendance";
import { Device } from "@/types/attendance";

export const useDashboardStats = () => {
  const { setStats, setLoading, selectedPeriod } = useDashboardStore();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch employees
  const employeesQuery = useList<Employee>({
    resource: "employees",
    pagination: { pageSize: 1000 },
    queryOptions: {
      queryKey: ["dashboard-employees", refreshKey],
    },
  });
  const employeesData = employeesQuery.query.data;
  const employeesLoading = employeesQuery.query.isLoading;

  // Fetch attendance logs for today
  const today = new Date().toISOString().split("T")[0];
  const attendanceQuery = useList<AttendanceLog>({
    resource: "attendance-logs",
    filters: [
      {
        field: "date",
        operator: "eq",
        value: today,
      },
    ],
    pagination: { pageSize: 1000 },
    queryOptions: {
      queryKey: ["dashboard-attendance", today, refreshKey],
    },
  });
  const attendanceData = attendanceQuery.query.data;
  const attendanceLoading = attendanceQuery.query.isLoading;

  // Fetch devices
  const devicesQuery = useList<Device>({
    resource: "devices",
    pagination: { pageSize: 100 },
    queryOptions: {
      queryKey: ["dashboard-devices", refreshKey],
    },
  });
  const devicesData = devicesQuery.query.data;
  const devicesLoading = devicesQuery.query.isLoading;

  // Calculate stats
  useEffect(() => {
    const isLoading = employeesLoading || attendanceLoading || devicesLoading;
    setLoading(isLoading);

    if (!isLoading) {
      const employees = employeesData?.data || [];
      const attendance = attendanceData?.data || [];
      const devices = devicesData?.data || [];

      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(
        (emp: Employee) => emp.employment_status === "active"
      ).length;

      const presentToday = attendance.filter(
        (att: AttendanceLog) => att.status === "present"
      ).length;

      const absentToday = activeEmployees - presentToday;

      const lateToday = attendance.filter(
        (att: AttendanceLog) => att.status === "late"
      ).length;

      const devicesOnline = devices.filter(
        (dev: Device) => dev.status === "active"
      ).length;

      setStats({
        totalEmployees,
        activeEmployees,
        presentToday,
        absentToday,
        lateToday,
        overtimeHours: 0, // Calculate based on shifts
        pendingRequests: 0, // Calculate from salary-requests
        devicesOnline,
      });
    }
  }, [
    employeesData,
    attendanceData,
    devicesData,
    employeesLoading,
    attendanceLoading,
    devicesLoading,
    setStats,
    setLoading,
  ]);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  return {
    refresh,
  };
};
