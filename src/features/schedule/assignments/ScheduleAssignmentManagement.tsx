"use client";

import { useState, useMemo } from "react";
import { useList, useCreate, useUpdate, useDelete, useGetIdentity } from "@refinedev/core";
import { useSelect } from "@refinedev/antd";
import {
  Card,
  Button,
  Select,
  message,
  Badge,
  Empty,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Alert,
  Progress,
  List,
  Drawer,
  Divider,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DragOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Shift } from "@/types/schedule/shift.types";
import type { WeeklySchedule } from "@/types/schedule/weekly-schedule.types";
import type {
  ScheduleAssignment,
  CreateScheduleAssignmentDto,
  AutoScheduleDto,
} from "@/types/schedule/schedule-assignment.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
// Employee and Position will be typed as any for now
type Employee = any;
type Position = any;
import type { EmployeeAvailability } from "@/types/schedule/employee-availability.types";
import { useCanManageSchedule } from "@/hooks/usePermissions";
import { useScheduleReadiness, useAutoSchedule } from "@/hooks/useScheduleWorkflow";
import { cn } from "@/lib/utils/cn";

const DAYS_OF_WEEK = [
  { value: 0, label: "Chủ nhật", short: "CN" },
  { value: 1, label: "Thứ 2", short: "T2" },
  { value: 2, label: "Thứ 3", short: "T3" },
  { value: 3, label: "Thứ 4", short: "T4" },
  { value: 4, label: "Thứ 5", short: "T5" },
  { value: 5, label: "Thứ 6", short: "T6" },
  { value: 6, label: "Thứ 7", short: "T7" },
];

export function ScheduleAssignmentManagement() {
  const canManage = useCanManageSchedule();
  const { data: user } = useGetIdentity<{ id: string }>();
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);

  // Fetch data
  const { selectProps: schedulesSelectProps } = useSelect<WeeklySchedule>({
    resource: "weekly-schedules",
    optionLabel: (record: any) => `Tuần ${dayjs(record.week_start).format("DD/MM")} - ${dayjs(record.week_end).format("DD/MM")}`,
  });
  
  const { query: shiftTypesQuery } = useList({
    resource: "shift-types",
    pagination: { pageSize: 100 },
    meta: { fields: ["*"] },
  });

  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    filters: selectedSchedule
      ? [{ field: "schedule_id", operator: "eq", value: selectedSchedule }]
      : [],
    meta: {
      fields: ["*", "shift_type.*"],
    },
  });

  const { query: assignmentsQuery } = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
    filters: selectedSchedule
      ? [{ field: "schedule_id", operator: "eq", value: selectedSchedule }]
      : [],
    meta: {
      fields: ["*", "shift.*", "position.*"],
    },
    queryOptions: {
      enabled: !!selectedSchedule,
    },
  });

  const { query: employeesQuery } = useList<Employee>({
    resource: "employees",
    filters: [{ field: "status", operator: "eq", value: "active" }],
    pagination: { mode: "off" },
  });

  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
    pagination: { mode: "off" },
  });

  // Extract data from queries first
  const schedules = schedulesSelectProps.options?.map((opt: any) => opt.value) || [];
  const shifts = shiftsQuery.data?.data || [];
  const shiftTypes = shiftTypesQuery.data?.data || [];
  
  // Get shift IDs from current schedule's shifts (needed for availabilities query)
  const shiftIds = shifts.map((s: any) => s.id);

  const { query: availabilitiesQuery } = useList<EmployeeAvailability>({
    resource: "employee-availability",
    filters: shiftIds.length > 0
      ? [{ field: "shift_id", operator: "in", value: shiftIds }]
      : [],
    pagination: {
      pageSize: 1000, // Increase to ensure we get all records
    },
    queryOptions: {
      enabled: shiftIds.length > 0,
    },
  });

  const { mutate: createAssignment } = useCreate<ScheduleAssignment>();
  const { mutate: deleteAssignment } = useDelete<ScheduleAssignment>();
  const { mutate: updateAssignment } = useUpdate<ScheduleAssignment>();

  // Workflow hooks
  const { readiness, canPublish, coverageRate, issues, refetch: refetchReadiness } = useScheduleReadiness(selectedSchedule);
  const { autoSchedule } = useAutoSchedule();
  const assignments = assignmentsQuery.data?.data || [];
  const employees = employeesQuery.data?.data || [];
  const positions = positionsQuery.data?.data || [];
  const availabilities = availabilitiesQuery.data?.data || [];

  // Debug logging
  console.log("🔍 Admin Schedule Assignment Debug:", {
    selectedSchedule,
    shiftsCount: shifts.length,
    shiftIds,
    availabilitiesCount: availabilities.length,
    availabilitiesQueryEnabled: shiftIds.length > 0,
    availabilitiesQueryLoading: availabilitiesQuery.isLoading,
    availabilitiesQueryError: availabilitiesQuery.error,
    availabilitiesData: availabilities.slice(0, 2), // First 2 records
  });

  // Group shifts by day
  const shiftsByDay = useMemo(() => {
    const shiftsData = shiftsQuery.data?.data || [];
    return DAYS_OF_WEEK.map((day) => ({
      ...day,
      shifts: shiftsData
        .filter((s: any) => dayjs(s.shift_date).day() === day.value)
        .sort((a: any, b: any) => (a.start_at || "").localeCompare(b.start_at || "")),
    }));
  }, [shiftsQuery.data?.data]);

  // Get assignments for a shift
  const getShiftAssignments = (shiftId: string) => {
    return assignments.filter((a: any) => a.shift_id === shiftId);
  };

  // Get available employees for a shift (registered availability)
  const getAvailableEmployees = (shiftId: string) => {
    const shiftAvailabilities = availabilities.filter(
      (av: any) => av.shift_id === shiftId
    );
    return employees.filter((emp: any) =>
      shiftAvailabilities.some((av: any) => av.employee_id === emp.id)
    );
  };

  // Get unassigned employees
  const getUnassignedEmployees = () => {
    const assignedIds = new Set(assignments.map((a: any) => a.employee_id));
    return employees.filter((emp: any) => !assignedIds.has(emp.id));
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, employee: Employee) => {
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, shift: Shift) => {
    e.preventDefault();
    if (!draggedEmployee || !user?.id) return;

    // Check if employee registered for this shift
    const hasAvailability = availabilities.some(
      (av: EmployeeAvailability) =>
        av.shift_id === shift.id &&
        av.employee_id === draggedEmployee.id
    );

    if (!hasAvailability) {
      message.warning("Nhân viên chưa đăng ký ca này");
      setDraggedEmployee(null);
      return;
    }

    // Get employee's position from availability
    const availability = availabilities.find(
      (av: EmployeeAvailability) => av.shift_id === shift.id && av.employee_id === draggedEmployee.id
    );

    if (!availability) {
      message.error("Không tìm thấy thông tin đăng ký");
      setDraggedEmployee(null);
      return;
    }

    const data: CreateScheduleAssignmentDto = {
      schedule_id: selectedSchedule,
      shift_id: shift.id,
      employee_id: draggedEmployee.id,
      position_id: (availability as any).position_id,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
      status: "assigned",
      source: "manual",
    };

    createAssignment(
      {
        resource: "schedule-assignments",
        values: data,
      },
      {
        onSuccess: () => {
          message.success(`Đã xếp ${draggedEmployee.full_name} vào ca`);
          setDraggedEmployee(null);
        },
        onError: (error: any) => {
          message.error(error?.message || "Xếp lịch thất bại");
          setDraggedEmployee(null);
        },
      }
    );
  };

  // Handle remove assignment
  const handleRemoveAssignment = (assignmentId: string) => {
    deleteAssignment(
      {
        resource: "schedule-assignments",
        id: assignmentId,
      },
      {
        onSuccess: () => {
          message.success("Đã xóa phân công");
        },
        onError: (error: any) => {
          message.error(error?.message || "Xóa thất bại");
        },
      }
    );
  };

  // Handle auto schedule
  const handleAutoSchedule = async () => {
    if (!selectedSchedule) {
      message.warning("Vui lòng chọn lịch tuần");
      return;
    }

    Modal.confirm({
      title: "Tự động xếp lịch",
      content: "Hệ thống sẽ tự động xếp lịch dựa trên đăng ký của nhân viên. Tiếp tục?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await autoSchedule(selectedSchedule, { overwriteExisting: false });
          refetchReadiness();
        } catch (error: any) {
          console.error("Auto-schedule error:", error);
        }
      },
    });
  };

  if (!canManage) {
    return (
      <Card>
        <Empty description="Bạn không có quyền xếp lịch" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarOutlined className="text-blue-600" />
              Xếp Lịch Làm Việc
            </h2>
            <p className="text-gray-600 mt-1">
              Kéo thả nhân viên vào ca hoặc dùng tự động xếp lịch
            </p>
          </div>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleAutoSchedule}
            size="large"
          >
            Tự động xếp lịch
          </Button>
        </div>

        {/* Schedule Selector */}
        <div className="mt-4">
          <Select
            placeholder="Chọn lịch tuần"
            className="w-full md:w-96"
            size="large"
            value={selectedSchedule || undefined}
            onChange={(value) => setSelectedSchedule(value as string)}
            options={schedulesSelectProps.options}
            loading={schedulesSelectProps.loading}
            onSearch={schedulesSelectProps.onSearch}
          />
        </div>
      </Card>

      {/* Coverage Panel */}
      {selectedSchedule && readiness && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <InfoCircleOutlined />
                Tình trạng xếp lịch
              </h3>
              {canPublish ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Đạt yêu cầu (≥ 80%)
                </Tag>
              ) : (
                <Tag color="warning" icon={<WarningOutlined />}>
                  Chưa đạt yêu cầu
                </Tag>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                <span className="text-sm font-medium">
                  {readiness.totalAssigned} / {readiness.totalRequired} vị trí
                </span>
              </div>
              <Progress
                percent={Math.round(coverageRate)}
                status={canPublish ? "success" : coverageRate > 50 ? "active" : "exception"}
                strokeColor={canPublish ? "#22c55e" : coverageRate > 50 ? "#3b82f6" : "#ef4444"}
              />
            </div>

            {issues.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  Các ca còn thiếu người ({issues.length})
                </h4>
                <List
                  size="small"
                  bordered
                  dataSource={issues.slice(0, 5)}
                  renderItem={(issue: any) => (
                    <List.Item>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Tag>{dayjs(issue.shiftDate).format("DD/MM")}</Tag>
                          <span className="text-sm">{issue.shiftType}</span>
                          <span className="text-xs text-gray-500">• {issue.positionName}</span>
                        </div>
                        <Badge
                          count={`Còn thiếu ${issue.missing}`}
                          style={{ backgroundColor: "#f59e0b" }}
                        />
                      </div>
                    </List.Item>
                  )}
                />
                {issues.length > 5 && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    ... và {issues.length - 5} ca khác
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {selectedSchedule ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Employee List */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined />
                <span>Nhân viên có thể xếp</span>
              </div>
            }
            className="lg:col-span-1"
          >
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {getUnassignedEmployees().map((emp: any) => (
                <Card
                  key={emp.id}
                  size="small"
                  className="cursor-move hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-400"
                  draggable
                  onDragStart={(e) => handleDragStart(e, emp)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{emp.full_name}</p>
                      <p className="text-xs text-gray-500">{emp.employee_id}</p>
                    </div>
                    <DragOutlined className="text-gray-400" />
                  </div>
                </Card>
              ))}
              {getUnassignedEmployees().length === 0 && (
                <Empty
                  description="Tất cả nhân viên đã được xếp lịch"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </Card>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-7 gap-3">
              {shiftsByDay.map((day) => (
                <div key={day.value} className="flex flex-col">
                  {/* Day Header */}
                  <div className="text-center mb-3 sticky top-0 bg-white z-10 pb-2">
                    <div className="inline-flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg px-4 py-2 shadow-sm">
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {day.short}
                      </span>
                      <span className="text-sm font-bold text-gray-800 mt-1">
                        {day.label}
                      </span>
                    </div>
                  </div>

                  {/* Shifts */}
                  <div className="space-y-2">
                    {day.shifts.length > 0 ? (
                      day.shifts.map((shift: any) => {
                        const shiftAssignments = getShiftAssignments(shift.id);
                        const availableCount = getAvailableEmployees(shift.id).length;
                        const assignedCount = shiftAssignments.length;
                        const requiredCount = shift.total_required || 0;

                        return (
                          <Card
                            key={shift.id}
                            className={cn(
                              "transition-all border-2",
                              draggedEmployee
                                ? "border-dashed border-blue-400 bg-blue-50"
                                : "border-gray-200"
                            )}
                            size="small"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, shift)}
                          >
                            <div className="space-y-2">
                              {/* Shift Info */}
                              <div className="flex items-center justify-between">
                                <Tag
                                  color={
                                    typeof shift.shift_type === "object"
                                      ? shift.shift_type.color_code
                                      : shiftTypes.find((st: any) => st.id === shift.shift_type_id)?.color_code || "default"
                                  }
                                >
                                  {typeof shift.shift_type === "object"
                                    ? shift.shift_type.type_name
                                    : shiftTypes.find((st: any) => st.id === shift.shift_type_id)?.type_name || "N/A"}
                                </Tag>
                                <Badge
                                  count={`${assignedCount}/${requiredCount}`}
                                  style={{
                                    backgroundColor:
                                      assignedCount >= requiredCount
                                        ? "#22c55e"
                                        : assignedCount > 0
                                        ? "#f59e0b"
                                        : "#6b7280",
                                  }}
                                />
                              </div>

                              <div className="text-xs text-gray-600">
                                {(() => {
                                  const shiftType = typeof shift.shift_type === "object"
                                    ? shift.shift_type
                                    : shiftTypes.find((st: any) => st.id === shift.shift_type_id);
                                  const startTime = shift.start_at 
                                    ? (shift.start_at.includes('T') ? dayjs(shift.start_at).format('HH:mm') : shift.start_at.substring(0, 5))
                                    : (shiftType?.start_at ? (shiftType.start_at.includes('T') ? dayjs(shiftType.start_at).format('HH:mm') : shiftType.start_at.substring(0, 5)) : "N/A");
                                  const endTime = shift.end_at
                                    ? (shift.end_at.includes('T') ? dayjs(shift.end_at).format('HH:mm') : shift.end_at.substring(0, 5))
                                    : (shiftType?.end_at ? (shiftType.end_at.includes('T') ? dayjs(shiftType.end_at).format('HH:mm') : shiftType.end_at.substring(0, 5)) : "N/A");
                                  return `${startTime} - ${endTime}`;
                                })()}
                              </div>

                              {/* Assigned Employees */}
                              <div className="space-y-1">
                                {shiftAssignments.map((assignment: any) => {
                                  const employee = employees.find(
                                    (e: any) => e.id === assignment.employee_id
                                  );
                                  const position =
                                    typeof assignment.position === "object"
                                      ? assignment.position
                                      : positions.find((p: any) => p.id === assignment.position_id);

                                  return (
                                    <div
                                      key={assignment.id}
                                      className="flex items-center justify-between bg-green-50 rounded px-2 py-1"
                                    >
                                      <div className="flex items-center gap-1 flex-1 min-w-0">
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate">
                                            {employee?.full_name || "N/A"}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {position?.name || "N/A"}
                                          </p>
                                        </div>
                                      </div>
                                      <Popconfirm
                                        title="Xóa phân công?"
                                        onConfirm={() =>
                                          handleRemoveAssignment(assignment.id)
                                        }
                                        okText="Xóa"
                                        cancelText="Hủy"
                                      >
                                        <Button
                                          type="text"
                                          size="small"
                                          danger
                                          icon={<DeleteOutlined />}
                                        />
                                      </Popconfirm>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Available Info */}
                              {availableCount > 0 && (
                                <div className="pt-1 border-t text-xs text-gray-500">
                                  {availableCount} người đã đăng ký
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })
                    ) : (
                      <Card size="small" className="border-dashed">
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <span className="text-xs text-gray-400">Không có ca</span>
                          }
                        />
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <Empty description="Vui lòng chọn lịch tuần để xếp lịch" />
        </Card>
      )}
    </div>
  );
}

export default ScheduleAssignmentManagement;
