"use client";

import { useState, useEffect } from "react";
import { Card, Divider, Button, Space, App } from "antd";
import { BarChartOutlined, ReloadOutlined } from "@ant-design/icons";
import { ReportType, DateRangeType, ReportData, EmployeeReport } from "@/types/report";
import { ReportSelector } from "./ReportSelector";
import { DateRangeSelector } from "./DateRangeSelector";
import { ReportPreview } from "./ReportPreview";
import { ExportButtons } from "./ExportButtons";
import dayjs from "@/lib/dayjs";

export const ReportsDashboard = () => {
  const { message } = App.useApp();
  const [selectedReportType, setSelectedReportType] = useState<ReportType>("employees");
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("month");
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [reportData, setReportData] = useState<ReportData>();
  const [loading, setLoading] = useState(false);

  // Initialize date range to current month
  useEffect(() => {
    const now = dayjs();
    setStartDate(now.startOf("month").format("YYYY-MM-DD"));
    setEndDate(now.format("YYYY-MM-DD"));
  }, []);

  const handleDateChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      message.warning("Vui lòng chọn khoảng thời gian");
      return;
    }

    setLoading(true);
    try {
      // Mock data based on report type
      await new Promise((resolve) => setTimeout(resolve, 800));

      switch (selectedReportType) {
        case "employees":
          setReportData({
            totalEmployees: 45,
            activeEmployees: 38,
            onLeaveEmployees: 4,
            inactiveEmployees: 3,
            suspendedEmployees: 0,
            byDepartment: [
              { department: "Nhà bếp", count: 15 },
              { department: "Phục vụ", count: 20 },
              { department: "Quản lý", count: 10 },
            ],
          } as EmployeeReport);
          break;

        case "attendance":
          setReportData({
            totalLogs: 890,
            onTimeCount: 750,
            lateCount: 120,
            absentCount: 20,
            averageWorkHours: 8.5,
            byEmployee: [
              { employeeId: "1", employeeName: "Nguyễn Văn A", totalHours: 176, lateCount: 2 },
              { employeeId: "2", employeeName: "Trần Thị B", totalHours: 168, lateCount: 0 },
              { employeeId: "3", employeeName: "Lê Văn C", totalHours: 180, lateCount: 5 },
            ],
          });
          break;

        case "payroll":
          setReportData({
            totalEmployees: 38,
            totalGrossSalary: 456000000,
            totalNetSalary: 410000000,
            totalDeductions: 46000000,
            totalBonuses: 25000000,
            averageSalary: 10789474,
            byEmployee: [
              { employeeId: "1", employeeName: "Nguyễn Văn A", netSalary: 12500000 },
              { employeeId: "2", employeeName: "Trần Thị B", netSalary: 9800000 },
              { employeeId: "3", employeeName: "Lê Văn C", netSalary: 11200000 },
            ],
          });
          break;

        case "schedule":
          setReportData({
            totalShifts: 420,
            assignedShifts: 385,
            unassignedShifts: 35,
            coverageRate: 91.7,
            overtimeHours: 120,
            byPosition: [
              { position: "Bếp trưởng", assignedCount: 28, requiredCount: 30 },
              { position: "Phục vụ", assignedCount: 90, requiredCount: 95 },
              { position: "Thu ngân", assignedCount: 28, requiredCount: 28 },
            ],
          });
          break;
      }

      message.success("Tải dữ liệu báo cáo thành công");
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu báo cáo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch when report type or date changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [selectedReportType, startDate, endDate]);

  const canExport = !!reportData && !!startDate && !!endDate;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChartOutlined className="text-xl text-orange-600" />
              </div>
              Báo cáo & Thống kê
            </h1>
            <p className="text-gray-500 mt-2 ml-[52px]">
              Phân tích và xuất báo cáo chi tiết theo nhiều tiêu chí
            </p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchReportData}
            loading={loading}
            size="large"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Step 1: Select Report Type */}
      <Card className="shadow-sm mb-6">
        <ReportSelector
          selectedType={selectedReportType}
          onSelect={setSelectedReportType}
        />
      </Card>

      {/* Step 2: Select Date Range */}
      <Card className="shadow-sm mb-6">
        <DateRangeSelector
          rangeType={dateRangeType}
          onRangeTypeChange={setDateRangeType}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </Card>

      {/* Step 3: Preview Report */}
      <Card className="shadow-sm mb-6">
        <ReportPreview
          reportType={selectedReportType}
          data={reportData}
          loading={loading}
        />
      </Card>

      {/* Step 4: Export Buttons */}
      <Card className="shadow-sm">
        <ExportButtons
          reportType={selectedReportType}
          startDate={startDate}
          endDate={endDate}
          disabled={!canExport}
        />
      </Card>
    </div>
  );
};
