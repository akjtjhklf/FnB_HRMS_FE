"use client";

import React, { useState } from "react";
import { Card, Tabs, Button, Space, DatePicker, message } from "antd";
import {
  ReloadOutlined,
  BarChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  useOverviewStats,
  useEmployeeAnalytics,
  useAttendanceAnalytics,
  useScheduleAnalytics,
  useSalaryAnalytics,
} from "./hooks/useAnalytics";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { EmployeeAnalytics } from "./components/EmployeeAnalytics";
import { AttendanceAnalytics } from "./components/AttendanceAnalytics";
import { ScheduleAnalytics } from "./components/ScheduleAnalytics";
import { SalaryAnalytics } from "./components/SalaryAnalytics";
import { ExportButton } from "./components/ExportButton";
import type { Dayjs } from "dayjs";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFilter, setDateFilter] = useState<string>();

  const {
    data: overviewData,
    loading: overviewLoading,
    refresh: refreshOverview,
  } = useOverviewStats(dateFilter);
  const {
    data: employeeData,
    loading: employeeLoading,
    refresh: refreshEmployee,
  } = useEmployeeAnalytics();
  const {
    data: attendanceData,
    loading: attendanceLoading,
    refresh: refreshAttendance,
  } = useAttendanceAnalytics();
  const {
    data: scheduleData,
    loading: scheduleLoading,
    refresh: refreshSchedule,
  } = useScheduleAnalytics({ startDate: dateFilter, endDate: dateFilter });
  const {
    data: salaryData,
    loading: salaryLoading,
    refresh: refreshSalary,
  } = useSalaryAnalytics();

  const handleRefresh = () => {
    switch (activeTab) {
      case "overview":
        refreshOverview();
        break;
      case "employees":
        refreshEmployee();
        break;
      case "attendance":
        refreshAttendance();
        break;
      case "schedule":
        refreshSchedule();
        break;
      case "salary":
        refreshSalary();
        break;
      default:
        message.info("Đang làm mới dữ liệu...");
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    setDateFilter(date ? date.format("YYYY-MM-DD") : undefined);
  };

  const getExportConfig = () => {
    switch (activeTab) {
      case "overview":
        return {
          data: overviewData ? [overviewData] : [],
          fileName: "bao_cao_tong_quan",
          pdfTitle: "Báo cáo Tổng quan Nhân sự",
          pdfColumns: [
            { header: "Tổng NV", dataKey: "totalEmployees" },
            { header: "Đang làm việc", dataKey: "activeEmployees" },
            { header: "Nghỉ phép", dataKey: "onLeaveEmployees" },
            { header: "NV Mới", dataKey: "newEmployeesThisMonth" },
            { header: "Đi muộn (Hôm nay)", dataKey: "lateToday" },
            { header: "Vắng (Hôm nay)", dataKey: "absentToday" },
          ],
        };
      case "employees":
        return {
          data: employeeData?.byStatus || [],
          fileName: "thong_ke_nhan_vien",
          pdfTitle: "Thống kê Nhân viên theo Trạng thái",
          pdfColumns: [
            { header: "Trạng thái", dataKey: "status" },
            { header: "Số lượng", dataKey: "count" },
            { header: "Tỷ lệ (%)", dataKey: "percentage" },
          ],
        };
      case "attendance":
        return {
          data: attendanceData?.topPerformers || [],
          fileName: "bao_cao_cham_cong",
          pdfTitle: "Top Nhân viên Chuyên cần",
          pdfColumns: [
            { header: "Tên nhân viên", dataKey: "employeeName" },
            { header: "Tỷ lệ đi làm (%)", dataKey: "attendanceRate" },
            { header: "Số lần đi muộn", dataKey: "lateCount" },
            { header: "Tổng ca", dataKey: "totalShifts" },
          ],
        };
      case "schedule":
        return {
          data: scheduleData ? [scheduleData] : [],
          fileName: "bao_cao_lich_lam",
          pdfTitle: "Báo cáo Lịch làm việc",
          pdfColumns: [
            { header: "Tổng ca", dataKey: "totalShiftsAssigned" },
            { header: "Hoàn thành", dataKey: "totalShiftsCompleted" },
            { header: "Chờ xử lý", dataKey: "totalShiftsPending" },
            { header: "Tỷ lệ hoàn thành (%)", dataKey: "completionRate" },
            { header: "Yêu cầu đổi ca", dataKey: "totalSwapRequests" },
          ],
        };
      case "salary":
        return {
          data: salaryData?.salaryDistribution || [],
          fileName: "bao_cao_luong",
          pdfTitle: "Phân bố Mức lương",
          pdfColumns: [
            { header: "Mức lương", dataKey: "range" },
            { header: "Số lượng", dataKey: "count" },
            { header: "Tỷ lệ (%)", dataKey: "percentage" },
          ],
        };
      default:
        return {
          data: [],
          fileName: "report",
          pdfTitle: "Report",
          pdfColumns: [],
        };
    }
  };

  const exportConfig = getExportConfig();

  const tabItems = [
    {
      key: "overview",
      label: (
        <span>
          <BarChartOutlined />
          Tổng quan
        </span>
      ),
      children: (
        <OverviewDashboard data={overviewData} loading={overviewLoading} />
      ),
    },
    {
      key: "employees",
      label: (
        <span>
          <UserOutlined />
          Nhân viên
        </span>
      ),
      children: (
        <EmployeeAnalytics data={employeeData} loading={employeeLoading} />
      ),
    },
    {
      key: "attendance",
      label: (
        <span>
          <ClockCircleOutlined />
          Chấm công
        </span>
      ),
      children: (
        <AttendanceAnalytics
          data={attendanceData}
          loading={attendanceLoading}
        />
      ),
    },
    {
      key: "schedule",
      label: (
        <span>
          <CalendarOutlined />
          Lịch làm
        </span>
      ),
      children: (
        <ScheduleAnalytics data={scheduleData} loading={scheduleLoading} />
      ),
    },
    {
      key: "salary",
      label: (
        <span>
          <DollarOutlined />
          Lương bổng
        </span>
      ),
      children: <SalaryAnalytics data={salaryData} loading={salaryLoading} />,
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Thống kê & Phân tích
            </h1>
            <p className="text-gray-600">
              Báo cáo toàn diện về nhân sự, chấm công và hoạt động
            </p>
          </div>
          <Space>
            <DatePicker
              placeholder="Chọn ngày"
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              allowClear
            />
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={
                overviewLoading ||
                employeeLoading ||
                attendanceLoading ||
                scheduleLoading ||
                salaryLoading
              }
            >
              Làm mới
            </Button>
            <ExportButton
              data={exportConfig.data}
              fileName={exportConfig.fileName}
              pdfColumns={exportConfig.pdfColumns}
              pdfTitle={exportConfig.pdfTitle}
              disabled={
                overviewLoading ||
                employeeLoading ||
                attendanceLoading ||
                scheduleLoading ||
                salaryLoading
              }
            />
          </Space>
        </div>
      </div>

      {/* Tabs */}
      <Card className="shadow-lg">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>Dữ liệu được cập nhật theo thời gian thực từ hệ thống</p>
      </div>
    </div>
  );
}
