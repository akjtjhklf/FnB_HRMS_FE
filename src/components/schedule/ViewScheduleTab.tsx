"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Select,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Avatar,
  Tooltip,
  Empty,
} from "antd";
import {
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useWeeklySchedules,
  useScheduleAssignments,
  useShifts,
  useUpdateScheduleAssignment,
} from "@/hooks/useSchedule";
import { useList } from "@refinedev/core";
import { ScheduleAssignment, Shift, Position } from "@/types/schedule";
import { Employee } from "@/types/employee";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils/cn";
import dayjs from "dayjs";

const DAYS_OF_WEEK = [
  { value: 0, label: "Chủ nhật", short: "CN" },
  { value: 1, label: "Thứ 2", short: "T2" },
  { value: 2, label: "Thứ 3", short: "T3" },
  { value: 3, label: "Thứ 4", short: "T4" },
  { value: 4, label: "Thứ 5", short: "T5" },
  { value: 5, label: "Thứ 6", short: "T6" },
  { value: 6, label: "Thứ 7", short: "T7" },
];

export function ViewScheduleTab() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ScheduleAssignment | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  // Fetch schedules (only finalized)
  const { query: schedulesQuery } = useList({
    resource: "weekly-schedule",
    filters: [{ field: "status", operator: "eq", value: "finalized" }],
  });
  const schedules = schedulesQuery.data?.data || [];

  // Fetch assignments
  const { assignments, isLoading: assignmentsLoading, refetch } =
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

  const { update: updateAssignment } = useUpdateScheduleAssignment();

  // Group assignments by day and shift
  const scheduleByDay = useMemo(() => {
    const grouped = DAYS_OF_WEEK.map((day) => {
      const dayShifts = shifts
        .filter((s) => dayjs(s.shift_date).day() === day.value) // Updated to use dayjs().day()
        .sort((a, b) => (a.start_at || '').localeCompare(b.start_at || '')); // Updated to use `start_at`

      const shiftsWithAssignments = dayShifts.map((shift) => {
        const shiftAssignments = assignments.filter((a) => {
          const shiftId = typeof a.shift_id === "string" ? a.shift_id : a.shift_id.id;
          return shiftId === shift.id && a.status !== "cancelled";
        });

        return {
          shift,
          assignments: shiftAssignments,
        };
      });

      return {
        ...day,
        shifts: shiftsWithAssignments,
      };
    });

    return grouped;
  }, [shifts, assignments]);

  // Get user's assignments
  const myAssignments = assignments.filter(
    (a) => a.employee_id === user?.id && a.status !== "cancelled"
  );

  const handleConfirmAssignment = async (assignmentId: string) => {
    try {
      await updateAssignment(assignmentId, {
        confirmed_by_employee: true,
        status: "assigned",
      });
      message.success("Xác nhận ca làm thành công!");
      refetch();
    } catch (error) {
      message.error("Xác nhận thất bại!");
    }
  };

  const handleRequestSwap = (assignment: ScheduleAssignment) => {
    setSelectedAssignment(assignment);
    setSwapModalOpen(true);
  };

  const handleSwapSubmit = async (values: any) => {
    if (!selectedAssignment) return;

    try {
      // This would create a swap request
      // For now, just update the assignment with a note
      await updateAssignment(selectedAssignment.id, {
        note: `Yêu cầu đổi ca: ${values.reason}`,
        status: "tentative",
      });
      message.success("Gửi yêu cầu đổi ca thành công!");
      setSwapModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error("Gửi yêu cầu thất bại!");
    }
  };

  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId);
  };

  const getPosition = (positionId: string | Position) => {
    if (typeof positionId === "object") return positionId;
    return positions.find((p) => p.id === positionId);
  };

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Select
            placeholder="Chọn lịch tuần"
            value={selectedScheduleId}
            onChange={setSelectedScheduleId}
            loading={schedulesQuery.isLoading}
            size="large"
            className="w-full"
            options={schedules.map((schedule: any) => ({
              label: `Tuần ${schedule.week_start} - ${schedule.week_end}`,
              value: schedule.id,
            }))}
          />
        </div>

        {selectedSchedule && (
          <Tag color="success" className="px-4 py-2">
            <CheckCircleOutlined className="mr-1" />
            Lịch chính thức
          </Tag>
        )}
      </div>

      {/* My Schedule Summary */}
      {selectedScheduleId && myAssignments.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Lịch làm việc của bạn
              </h3>
              <p className="text-sm text-gray-700">
                Bạn có <strong className="text-blue-600">{myAssignments.length}</strong> ca
                làm việc trong tuần này
              </p>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {myAssignments.length}
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Schedule View */}
      {selectedScheduleId ? (
        <div className="grid grid-cols-7 gap-3">
          {scheduleByDay.map((day) => (
            <div key={day.value} className="flex flex-col">
              {/* Day Header */}
              <div className="text-center mb-3 sticky top-0 bg-white z-10 pb-2">
                <div className="inline-flex flex-col items-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-xs font-medium text-purple-600 uppercase">
                    {day.short}
                  </span>
                  <span className="text-sm font-bold text-gray-700 mt-1">
                    {day.label}
                  </span>
                </div>
              </div>

              {/* Shifts for this day */}
              <div className="space-y-2">
                {day.shifts.length > 0 ? (
                  day.shifts.map(({ shift, assignments: shiftAssignments }) => (
                    <Card
                      key={shift.id}
                      size="small"
                      className="border-gray-200 hover:shadow-md transition-shadow"
                    >
                      {/* Shift Info */}
                      <div className="mb-2 pb-2 border-b border-gray-200">
                        <h4 className="font-semibold text-sm text-gray-700">
                          {shift.shift_type?.name || "Ca làm việc"}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-700 mt-1">
                          <ClockCircleOutlined />
                          <span>
                            {shift.start_at} - {shift.end_at}
                          </span>
                        </div>
                      </div>

                      {/* Assignments */}
                      <div className="space-y-2">
                        {shiftAssignments.length > 0 ? (
                          shiftAssignments.map((assignment) => {
                            const employee = getEmployee(assignment.employee_id);
                            const position = getPosition(assignment.position_id);
                            const isMyAssignment = assignment.employee_id === user?.id;
                            const isConfirmed = assignment.confirmed_by_employee;

                            return (
                              <div
                                key={assignment.id}
                                className={cn(
                                  "p-2 rounded-lg transition-all",
                                  isMyAssignment
                                    ? "bg-blue-50 border-2 border-blue-300"
                                    : "bg-gray-50 border border-gray-200"
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <Avatar size="small" className="bg-blue-500 flex-shrink-0">
                                    {employee?.first_name?.[0] || "?"}
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-700 truncate">
                                      {employee?.first_name} {employee?.last_name}
                                    </p>
                                    <Tag color="blue" className="text-xs mt-1">
                                      {position?.name}
                                    </Tag>
                                  </div>
                                </div>

                                {isMyAssignment && (
                                  <div className="mt-2 pt-2 border-t border-blue-200 flex gap-1">
                                    {!isConfirmed && (
                                      <Tooltip title="Xác nhận ca làm">
                                        <Button
                                          type="primary"
                                          size="small"
                                          icon={<CheckCircleOutlined />}
                                          onClick={() => handleConfirmAssignment(assignment.id)}
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                          Xác nhận
                                        </Button>
                                      </Tooltip>
                                    )}
                                    <Tooltip title="Yêu cầu đổi ca">
                                      <Button
                                        size="small"
                                        icon={<SwapOutlined />}
                                        onClick={() => handleRequestSwap(assignment)}
                                        className="flex-1"
                                      >
                                        Đổi ca
                                      </Button>
                                    </Tooltip>
                                  </div>
                                )}

                                {isConfirmed && isMyAssignment && (
                                  <div className="mt-2 pt-2 border-t border-blue-200">
                                    <Tag color="success" className="text-xs">
                                      <CheckCircleOutlined className="mr-1" />
                                      Đã xác nhận
                                    </Tag>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-2">
                            <UserOutlined className="text-gray-300 text-lg" />
                            <p className="text-xs text-gray-700 mt-1">
                              Chưa có phân công
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card size="small" className="border-dashed">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span className="text-xs text-gray-700">Không có ca</span>}
                    />
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <ClockCircleOutlined className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Vui lòng chọn lịch tuần để xem</p>
        </Card>
      )}

      {/* Swap Request Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SwapOutlined className="text-blue-600" />
            <span>Yêu cầu đổi ca</span>
          </div>
        }
        open={swapModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setSwapModalOpen(false);
          form.resetFields();
        }}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSwapSubmit}>
          {selectedAssignment && (
            <Card size="small" className="mb-4 bg-gray-50">
              <p className="text-sm text-gray-700">
                Ca: <strong>{typeof selectedAssignment.shift_id === "object" ? (selectedAssignment.shift_id.shift_type?.name || "Ca làm việc") : "Chưa có"}</strong>
              </p>
            </Card>
          )}

          <Form.Item
            name="reason"
            label="Lý do đổi ca"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do bạn muốn đổi ca..."
            />
          </Form.Item>

          <Card size="small" className="bg-yellow-50 border-yellow-200">
            <p className="text-xs text-yellow-700">
              <strong>Lưu ý:</strong> Yêu cầu sẽ được gửi đến quản lý để xét duyệt
            </p>
          </Card>
        </Form>
      </Modal>
    </div>
  );
}

export default ViewScheduleTab;
