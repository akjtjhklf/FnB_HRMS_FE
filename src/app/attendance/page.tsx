"use client";

import { useList } from "@refinedev/core";
import { AttendanceLog } from "@/types/attendance";
import { Employee } from "@/types/employee";
import { formatDate, formatTime } from "@/lib/utils";
import { Clock, Users, Edit2 } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Space, Avatar, Button as AntButton, Modal } from "antd";
import CustomDataTable, {
  CustomColumnType,
} from "@/components/common/CustomDataTable";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceLog | null>(null);

  const { query } = useList<AttendanceLog>({
    resource: "attendance-logs",
    pagination: {
      current: 1,
      pageSize: 50,
    },
    sorters: [
      {
        field: "check_in_time",
        order: "desc",
      },
    ],
  });

  const { data, isLoading } = query;
  const attendanceLogs = (data?.data || []) as unknown as AttendanceLog[];
  const total = data?.total || 0;

  // Tính tổng giờ làm việc
  const calculateWorkHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return "-";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleEdit = useCallback((record: AttendanceLog) => {
    setSelectedRecord(record);
    setEditModalVisible(true);
  }, []);

  const handleRowClick = useCallback(
    (record: AttendanceLog) => {
      const employeeId = typeof record.employee_id === "object" 
        ? record.employee_id.id 
        : record.employee_id;
      
      if (employeeId) {
        router.push(`/attendance/${employeeId}`);
      }
    },
    [router]
  );

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = attendanceLogs.filter((log) => {
      const logDate = log.date || log.check_in_time?.split("T")[0];
      return logDate === today;
    });

    return {
      total: attendanceLogs.length,
      today: todayLogs.length,
      checkedIn: todayLogs.filter((log) => log.check_in_time && !log.check_out_time).length,
      completed: todayLogs.filter((log) => log.check_in_time && log.check_out_time).length,
    };
  }, [attendanceLogs]);

  const columns: CustomColumnType<AttendanceLog>[] = useMemo(
    () => [
      {
        title: "Nhân viên",
        dataIndex: ["employee_id"],
        key: "employee",
        width: 250,
        fixed: "left",
        filterable: true,
        filterType: "text",
        sortable: true,
        render: (_, record) => {
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
              onClick={() => handleRowClick(record)}
            >
              <Avatar 
                src={employee.avatar} 
                size={40} 
                className="bg-blue-500"
              >
                {employee.first_name?.[0]}
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {employee.employee_code}
                </p>
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
        sortable: true,
        render: (date, record) => {
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
        width: 120,
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
        width: 120,
        render: (_, record) => (
          <span className="font-semibold text-blue-600">
            {calculateWorkHours(record.check_in_time, record.check_out_time)}
          </span>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "notes",
        key: "notes",
        width: 200,
        ellipsis: true,
        render: (notes) => (
          <span className="text-gray-600">{notes || "-"}</span>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 100,
        align: "center",
        fixed: "right",
        render: (_, record) => (
          <Space size="small">
            <AntButton
              type="text"
              icon={<EditOutlined />}
              className="text-yellow-600 hover:bg-yellow-50"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
              title="Chỉnh sửa"
            />
          </Space>
        ),
      },
    ],
    [handleEdit, handleRowClick]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 px-2">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Tổng bản ghi
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Hôm nay
                </p>
                <p className="text-3xl font-bold text-green-600">{stats.today}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Đang làm việc
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.checkedIn}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Hoàn thành
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.completed}
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
            data={attendanceLogs}
            columns={columns}
            loading={isLoading}
            rowKey="id"
            searchable
            searchPlaceholder="Tìm kiếm theo tên nhân viên..."
            showFilters
            showRefresh
            showExport
            onRefresh={() => query.refetch()}
            onExport={() => {
              console.log("Export attendance logs to Excel");
            }}
            pagination={{
              current: 1,
              pageSize: 20,
              total: total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} bản ghi`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            bordered={false}
            size="middle"
            scroll={{ x: 1200 }}
            onRow={(record) => ({
              className: "cursor-pointer hover:bg-gray-50",
            })}
          />
        </div>
      </div>

      {/* Edit Modal - Placeholder */}
      <Modal
        title="Chỉnh sửa chấm công"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <p>Tính năng chỉnh sửa sẽ được triển khai sau.</p>
      </Modal>
    </div>
  );
}
