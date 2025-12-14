"use client";

import { useList, useOne } from "@refinedev/core";
import { AttendanceLog } from "@/types/attendance";
import { Employee } from "@/types/employee";
import { formatDate, formatTime } from "@/lib/utils";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { Select, Button as AntButton } from "antd";
import CustomDataTable, {
  CustomColumnType,
} from "@/components/common/CustomDataTable";
import { useRouter } from "next/navigation";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";

interface EmployeeAttendanceDetailProps {
  employeeId: string;
}

export const EmployeeAttendanceDetail = ({
  employeeId,
}: EmployeeAttendanceDetailProps) => {
  const router = useRouter();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Fetch employee info
  const { query: employeeQuery } = useOne<Employee>({
    resource: "employees",
    id: employeeId,
  });

  const employee = employeeQuery.data?.data as Employee;
  const employeeLoading = employeeQuery.isLoading;

  // Fetch attendance logs for this employee
  const { query } = useList<AttendanceLog>({
    resource: "attendance-logs",
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: employeeId,
      },
    ],
    sorters: [
      {
        field: "check_in_time",
        order: "desc",
      },
    ],
  });

  const { data, isLoading } = query;

  // Filter logs by selected month and year
  const monthlyLogs = useMemo(() => {
    const allLogs = (data?.data || []) as unknown as AttendanceLog[];

    return allLogs.filter((log: AttendanceLog) => {
      const logDate = log.date || log.check_in_time?.split("T")[0];
      if (!logDate) return false;

      const date = new Date(logDate);
      return (
        date.getMonth() + 1 === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  }, [data?.data, selectedMonth, selectedYear]);

  // Calculate total work hours for the month
  const totalMonthlyHours = useMemo(() => {
    let totalMinutes = 0;

    monthlyLogs.forEach((log: AttendanceLog) => {
      if (log.check_in_time && log.check_out_time) {
        const start = new Date(log.check_in_time);
        const end = new Date(log.check_out_time);
        const diffMs = end.getTime() - start.getTime();
        totalMinutes += Math.floor(diffMs / (1000 * 60));
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  }, [monthlyLogs]);

  // Calculate work hours
  const calculateWorkHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return { display: "-", minutes: 0 };

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      display: `${hours}h ${minutes}m`,
      minutes: hours * 60 + minutes,
    };
  };

  // Statistics
  const stats = useMemo(() => {
    const totalDays = monthlyLogs.length;
    const completedDays = monthlyLogs.filter(
      (log: AttendanceLog) => log.check_in_time && log.check_out_time
    ).length;
    const incompleteDays = monthlyLogs.filter(
      (log: AttendanceLog) => log.check_in_time && !log.check_out_time
    ).length;

    return {
      totalDays,
      completedDays,
      incompleteDays,
      avgHoursPerDay:
        completedDays > 0
          ? Math.round(
              (totalMonthlyHours.totalMinutes / completedDays / 60) * 10
            ) / 10
          : 0,
    };
  }, [monthlyLogs, totalMonthlyHours]);

  const columns: CustomColumnType<AttendanceLog>[] = useMemo(
    () => [
      {
        title: "Ngày",
        dataIndex: "date",
        key: "date",
        width: 150,
        sortable: true,
        render: (date, record) => {
          const displayDate = date || record.check_in_time?.split("T")[0];
          return (
            <span className="font-medium text-gray-700">
              {displayDate ? formatDate(displayDate) : "-"}
            </span>
          );
        },
      },
      {
        title: "Giờ vào",
        dataIndex: "check_in_time",
        key: "check_in_time",
        width: 150,
        sortable: true,
        render: (time) => (
          <span className="font-medium text-green-600">
            {time ? formatTime(time) : "-"}
          </span>
        ),
      },
      {
        title: "Giờ ra",
        dataIndex: "check_out_time",
        key: "check_out_time",
        width: 150,
        sortable: true,
        render: (time) => (
          <span className="font-medium text-red-600">
            {time ? formatTime(time) : "-"}
          </span>
        ),
      },
      {
        title: "Tổng giờ",
        key: "total_hours",
        width: 150,
        render: (_, record) => {
          const result = calculateWorkHours(
            record.check_in_time,
            record.check_out_time
          );
          return (
            <span className="font-semibold text-blue-600">
              {result.display}
            </span>
          );
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "notes",
        key: "notes",
        width: 250,
        ellipsis: true,
        render: (notes) => (
          <span className="text-gray-700">{notes || "-"}</span>
        ),
      },
    ],
    []
  );

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1,
  }));

  // Generate year options (last 3 years)
  const yearOptions = Array.from({ length: 3 }, (_, i) => ({
    label: `${currentDate.getFullYear() - i}`,
    value: currentDate.getFullYear() - i,
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.push("/attendance")}
        className="mb-4 px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      {/* Header */}
      <div className="mb-6 px-2">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <EmployeeAvatar
              photoUrl={employee?.photo_url}
              firstName={employee?.first_name}
              lastName={employee?.last_name}
              size={80}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee?.first_name} {employee?.last_name}
              </h1>
              <p className="text-gray-500">Mã NV: {employee?.employee_code}</p>
              <p className="text-gray-500">
                {typeof employee?.user?.role === "object"
                  ? employee?.user?.role?.name
                  : "Chưa có chức vụ"}
              </p>
            </div>
          </div>

          {/* Month/Year Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Chọn tháng:
              </span>
            </div>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={monthOptions}
              className="w-32"
            />
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              options={yearOptions}
              className="w-32"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Tổng số ngày
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDays}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Hoàn thành
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completedDays}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Chưa checkout
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.incompleteDays}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  TB giờ/ngày
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.avgHoursPerDay}h
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mx-2">
        <div className="px-6 py-4">
          <CustomDataTable<AttendanceLog>
            data={monthlyLogs}
            columns={columns}
            loading={isLoading || employeeLoading}
            rowKey="id"
            searchable={false}
            showFilters={false}
            showRefresh
            showExport
            onRefresh={() => query.refetch()}
            onExport={() => {
              console.log("Export employee attendance to Excel");
            }}
            pagination={{
              current: 1,
              pageSize: 31,
              total: monthlyLogs.length,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} ngày`,
            }}
            bordered={false}
            size="middle"
            scroll={{ x: 900 }}
          />

          {/* Total Hours Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Tổng số giờ làm việc trong tháng:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {totalMonthlyHours.hours}h {totalMonthlyHours.minutes}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
