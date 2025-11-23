"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Button,
  Select,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Tooltip,
  Badge,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  useWeeklySchedules,
  useScheduleAssignments,
  useShifts,
  useAutoSchedule,
  useCreateScheduleAssignment,
  useDeleteScheduleAssignment,
} from "@/hooks/useSchedule";
import { useList } from "@refinedev/core";
import {
  ScheduleAssignment,
  Position,
  EmployeeAvailability,
  Shift,
} from "@/types/schedule";
import { Employee } from "@/types/employee";
import CustomDataTable, { CustomColumnType } from "@/components/common/CustomDataTable";

export function ManageScheduleTab() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [isAutoScheduleModalOpen, setIsAutoScheduleModalOpen] = useState(false);

  // Fetch schedules
  const { schedules, isLoading: schedulesLoading } = useWeeklySchedules();

  // Fetch assignments for selected schedule
  const { assignments, isLoading: assignmentsLoading, refetch: refetchAssignments } =
    useScheduleAssignments(selectedScheduleId);

  // Fetch shifts
  const { shifts } = useShifts();

  // Fetch employees
  const { query: employeesQuery } = useList<Employee>({
    resource: "employees",
    pagination: { pageSize: 500 },
  });
  const employees = employeesQuery.data?.data || [];

  // Fetch positions
  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
    pagination: { pageSize: 100 },
  });
  const positions = positionsQuery.data?.data || [];

  // Fetch availabilities
  const { query: availabilitiesQuery } = useList<EmployeeAvailability>({
    resource: "employee-availability",
    pagination: { pageSize: 1000 },
  });
  const availabilities = availabilitiesQuery.data?.data || [];

  const { autoSchedule } = useAutoSchedule();
  const { create: createAssignment } = useCreateScheduleAssignment();
  const { remove: deleteAssignment } = useDeleteScheduleAssignment();

  // Group assignments by shift
  const assignmentsByShift = useMemo(() => {
    const grouped: Record<string, ScheduleAssignment[]> = {};
    assignments.forEach((assignment) => {
      const shiftId =
        typeof assignment.shift_id === "string"
          ? assignment.shift_id
          : assignment.shift_id.id;
      if (!grouped[shiftId]) {
        grouped[shiftId] = [];
      }
      grouped[shiftId].push(assignment);
    });
    return grouped;
  }, [assignments]);

  const handleAutoSchedule = async () => {
    if (!selectedScheduleId) {
      message.error("Vui lòng chọn lịch tuần");
      return;
    }

    try {
      await autoSchedule({
        scheduleId: selectedScheduleId,
        overwriteExisting: false,
        dryRun: false,
      });
      message.success("Xếp lịch tự động thành công!");
      refetchAssignments();
      setIsAutoScheduleModalOpen(false);
    } catch (error) {
      console.error("Auto schedule error:", error);
      message.error("Xếp lịch thất bại!");
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId);
      message.success("Xóa phân công thành công!");
      refetchAssignments();
    } catch (error) {
      message.error("Xóa thất bại!");
    }
  };

  // Table columns for assignments
  const columns: CustomColumnType<ScheduleAssignment>[] = [
    {
      title: "Ca làm việc",
      dataIndex: ["shift_id"],
      key: "shift",
      width: 200,
      render: (_, record) => {
        const shift =
          typeof record.shift_id === "object"
            ? record.shift_id
            : shifts.find((s) => s.id === record.shift_id);
        return (
          <div>
            <p className="font-medium text-gray-800">{shift?. || "N/A"}</p>
            <p className="text-xs text-gray-500">
              {shift?.start_at} - {shift?.end_at}
            </p>
          </div>
        );
      },
    },
    {
      title: "Nhân viên",
      dataIndex: "employee_id",
      key: "employee",
      width: 200,
      render: (employeeId) => {
        const employee = employees.find((e) => e.id === employeeId);
        return employee ? (
          <div>
            <p className="font-medium text-gray-800">
              {employee.first_name} {employee.last_name}
            </p>
            <p className="text-xs text-gray-500">{employee.employee_code}</p>
          </div>
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Vị trí",
      dataIndex: ["position_id"],
      key: "position",
      width: 150,
      render: (_, record) => {
        const position =
          typeof record.position_id === "object"
            ? record.position_id
            : positions.find((p) => p.id === record.position_id);
        return (
          <Tag color="blue">{position?.name || "N/A"}</Tag>
        );
      },
    },
    {
      title: "Nguồn",
      dataIndex: "source",
      key: "source",
      width: 100,
      align: "center",
      render: (source) => (
        <Tag color={source === "auto" ? "purple" : "green"}>
          {source === "auto" ? "Tự động" : "Thủ công"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => {
        const statusConfig = {
          assigned: { color: "success", text: "Đã phân" },
          tentative: { color: "warning", text: "Chờ xác nhận" },
          swapped: { color: "processing", text: "Đã đổi" },
          cancelled: { color: "error", text: "Đã hủy" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned;
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: "Xác nhận",
      dataIndex: "confirmed_by_employee",
      key: "confirmed",
      width: 100,
      align: "center",
      render: (confirmed) =>
        confirmed ? (
          <CheckCircleOutlined className="text-green-600 text-lg" />
        ) : (
          <CloseCircleOutlined className="text-gray-400 text-lg" />
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 200,
      ellipsis: true,
      render: (note) => (
        <span className="text-gray-600">{note || "-"}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Xóa phân công"
          description="Bạn có chắc muốn xóa phân công này?"
          onConfirm={() => handleDeleteAssignment(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger size="small">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

  return (
    <div className="flex">
      {/* Sidebar */}
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Select
              placeholder="Chọn lịch tuần"
              value={selectedScheduleId}
              onChange={setSelectedScheduleId}
              loading={schedulesLoading}
              size="large"
              className="w-full"
              options={schedules.map((schedule) => ({
                label: `Tuần ${schedule.week_start} - ${schedule.week_end} (${schedule.status})`,
                value: schedule.id,
              }))}
            />
          </div>

          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetchAssignments()}
              loading={assignmentsLoading}
              title="Làm mới"
            />
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => setIsAutoScheduleModalOpen(true)}
              disabled={!selectedScheduleId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Xếp lịch tự động
            </Button>
          </Space>
        </div>

        {/* Schedule Info */}
        {selectedSchedule && (
          <Card size="small" className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TeamOutlined className="text-blue-600 text-2xl" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Lịch tuần: {selectedSchedule.week_start} - {selectedSchedule.week_end}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Trạng thái:{" "}
                    <Tag color={selectedSchedule.status === "finalized" ? "success" : "processing"}>
                      {selectedSchedule.status}
                    </Tag>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
                <p className="text-xs text-gray-600">Phân công</p>
              </div>
            </div>
          </Card>
        )}

        {/* Assignments Table */}
        {selectedScheduleId ? (
          <CustomDataTable<ScheduleAssignment>
            data={assignments}
            columns={columns}
            loading={assignmentsLoading}
            rowKey="id"
            searchable
            searchPlaceholder="Tìm kiếm phân công..."
            showRefresh
            onRefresh={() => refetchAssignments()}
            pagination={{
              current: 1,
              pageSize: 20,
              total: assignments.length,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phân công`,
            }}
            scroll={{ x: 1200 }}
          />
        ) : (
          <Card className="text-center py-12">
            <TeamOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500">Vui lòng chọn lịch tuần để xem phân công</p>
          </Card>
        )}

        {/* Auto Schedule Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-purple-600" />
              <span>Xếp lịch tự động</span>
            </div>
          }
          open={isAutoScheduleModalOpen}
          onOk={handleAutoSchedule}
          onCancel={() => setIsAutoScheduleModalOpen(false)}
          okText="Xếp lịch"
          cancelText="Hủy"
          width={600}
        >
          <div className="space-y-4">
            <Card size="small" className="bg-purple-50 border-purple-200">
              <p className="text-sm text-gray-700">
                Hệ thống sẽ tự động xếp lịch dựa trên:
              </p>
              <ul className="mt-2 ml-6 text-sm text-gray-600 space-y-1 list-disc">
                <li>Đăng ký khả dụng của nhân viên</li>
                <li>Vị trí và ưu tiên đã chọn</li>
                <li>Yêu cầu số lượng cho mỗi ca</li>
                <li>Giới hạn giờ làm việc</li>
              </ul>
            </Card>

            <Card size="small" className="bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">⚠️ Lưu ý:</p>
              <p className="text-sm text-yellow-700 mt-1">
                Các phân công thủ công hiện tại sẽ được giữ nguyên.
              </p>
            </Card>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ManageScheduleTab;
