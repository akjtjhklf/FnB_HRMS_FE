"use client";

import { useTable } from "@refinedev/antd";
import { AttendanceLog } from "@/types/attendance";
import { Employee } from "@/types/employee";
import { formatDate, formatTime } from "@/lib/utils";
import { Clock, Users } from "lucide-react";
import { useMemo } from "react";
import { Space, Button as AntButton, Table, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";

export const AttendanceList = () => {
  const router = useRouter();

  const { tableProps, sorters, filters } = useTable<AttendanceLog>({
    resource: "attendance-logs",
    syncWithLocation: true,
    pagination: {
      pageSize: 20,
    },
    sorters: {
      initial: [
        {
          field: "check_in_time",
          order: "desc",
        },
      ],
    },
  });

  // Calculate work hours
  const calculateWorkHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return "-";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const data = (tableProps.dataSource || []) as AttendanceLog[];
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = data.filter((log) => {
      const logDate = log.date || log.check_in_time?.split("T")[0];
      return logDate === today;
    });

    return {
      total: data.length,
      today: todayLogs.length,
      checkedIn: todayLogs.filter((log) => log.check_in_time && !log.check_out_time).length,
      completed: todayLogs.filter((log) => log.check_in_time && log.check_out_time).length,
    };
  }, [tableProps.dataSource]);

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "employee_id",
      key: "employee",
      width: 250,
      fixed: "left" as const,
      render: (_: any, record: AttendanceLog) => {
        const employee =
          typeof record.employee_id === "object"
            ? (record.employee_id as Employee)
            : null;

        if (!employee) {
          return <span className="text-gray-400">Chưa xác định</span>;
        }

        return (
          <div
            className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => router.push(`/attendance/${employee.id}`)}
          >
            <EmployeeAvatar
              photoUrl={employee.photo_url}
              firstName={employee.first_name}
              lastName={employee.last_name}
              size={40}
            />
            <div>
              <p className="font-medium text-gray-900">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-sm text-gray-500">{employee.employee_code}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 130,
      sorter: true,
      render: (date: string, record: AttendanceLog) => {
        const displayDate = date || record.check_in_time?.split("T")[0];
        return (
          <span className="text-gray-700">
            {displayDate ? formatDate(displayDate) : "-"}
          </span>
        );
      },
    },
    {
      title: "Giờ vào",
      dataIndex: "check_in_time",
      key: "check_in_time",
      width: 120,
      sorter: true,
      render: (time: string) => (
        <span className="font-medium text-green-600">
          {time ? formatTime(time) : "-"}
        </span>
      ),
    },
    {
      title: "Giờ ra",
      dataIndex: "check_out_time",
      key: "check_out_time",
      width: 120,
      sorter: true,
      render: (time: string) => (
        <span className="font-medium text-red-600">
          {time ? formatTime(time) : "-"}
        </span>
      ),
    },
    {
      title: "Tổng giờ",
      key: "total_hours",
      width: 120,
      render: (_: any, record: AttendanceLog) => (
        <span className="font-semibold text-blue-600">
          {calculateWorkHours(record.check_in_time, record.check_out_time)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_: any, record: AttendanceLog) => {
        if (record.check_in_time && record.check_out_time) {
          return <Tag color="success">Hoàn thành</Tag>;
        } else if (record.check_in_time) {
          return <Tag color="processing">Đang làm</Tag>;
        }
        return <Tag color="default">Chưa vào</Tag>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 200,
      ellipsis: true,
      render: (notes: string) => (
        <span className="text-gray-600">{notes || "-"}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, record: AttendanceLog) => (
        <Space size="small">
          <AntButton
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/attendance/${record.id}/edit`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              Quản lý chấm công
            </h1>
            <p className="text-gray-500 mt-2 ml-[52px]">
              Xem và quản lý thông tin chấm công của nhân viên
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Tổng bản ghi
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Hôm nay
                </p>
                <p className="text-3xl font-bold text-green-600">{stats.today}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Đang làm việc
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.checkedIn}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Hoàn thành
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.completed}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
        />
      </div>
    </div>
  );
};
