"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useList, useCreate, useDelete, useGetIdentity } from "@refinedev/core";
import { useSelect } from "@refinedev/antd";
import {
  Card,
  Button,
  Select,
  message,
  Progress,
  Tag,
  Empty,
} from "antd";
import {
  CalendarOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import type { Shift } from "@/types/schedule/shift.types";
import type { ShiftType } from "@/types/schedule/shift-type.types";
import type { WeeklySchedule } from "@/types/schedule/weekly-schedule.types";
import type {
  ScheduleAssignment,
  CreateScheduleAssignmentDto,
} from "@/types/schedule/schedule-assignment.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
import type { EmployeeAvailability } from "@/types/schedule/employee-availability.types";
import { useCanManageSchedule } from "@/hooks/usePermissions";
import {
  useScheduleReadiness,
  useAutoSchedule,
} from "@/hooks/useScheduleWorkflow";
import { useConfirmModalStore } from "@/store/confirmModalStore";
import { DayColumn } from "./components/DayColumn";
import { AssignmentDrawer } from "./components/AssignmentDrawer";
import { Employee } from "@types";
import { Position } from "@types";

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2", short: "T2" },
  { value: 2, label: "Thứ 3", short: "T3" },
  { value: 3, label: "Thứ 4", short: "T4" },
  { value: 4, label: "Thứ 5", short: "T5" },
  { value: 5, label: "Thứ 6", short: "T6" },
  { value: 6, label: "Thứ 7", short: "T7" },
  { value: 0, label: "Chủ nhật", short: "CN" },
];

export function ScheduleAssignmentManagement() {
  const canManage = useCanManageSchedule();
  const { data: user } = useGetIdentity<{ id: string }>();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const searchParams = useSearchParams();
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Auto-select schedule from URL params (e.g., from detail page)
  useEffect(() => {
    const scheduleIdFromUrl = searchParams.get("schedule_id");
    if (scheduleIdFromUrl && !selectedSchedule) {
      setSelectedSchedule(scheduleIdFromUrl);
    }
  }, [searchParams, selectedSchedule]);

  // Fetch schedules
  const { selectProps: schedulesSelectProps } = useSelect<WeeklySchedule>({
    resource: "weekly-schedules",
    optionLabel: (record: any) =>
      `Tuần ${dayjs(record.week_start).format("DD/MM")} - ${dayjs(
        record.week_end
      ).format("DD/MM")}`,
  });

  // Fetch shift types
  const { query: shiftTypesQuery } = useList({
    resource: "shift-types",
    pagination: { pageSize: 1000 },
    meta: { fields: ["*"] },
  });

  // Fetch shifts for selected schedule
  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    filters: selectedSchedule
      ? [{ field: "schedule_id", operator: "eq", value: selectedSchedule }]
      : [],
    meta: { fields: ["*", "shift_type_id.*"] },
    pagination: { pageSize: 1000 },
    queryOptions: { enabled: !!selectedSchedule },
  });

  // Extract data
  const shifts = shiftsQuery.data?.data || [];
  const shiftTypes = shiftTypesQuery.data?.data || [];
  const shiftIds = shifts.map((s: any) => s.id);

  // Fetch requirements for all shifts
  const { query: requirementsQuery } = useList<ShiftPositionRequirement>({
    resource: "shift-position-requirements",
    filters:
      shiftIds.length > 0
        ? [{ field: "shift_id", operator: "in", value: shiftIds }]
        : [],
    meta: { fields: ["*", "position_id.*"] },
    pagination: { pageSize: 1000 },
    queryOptions: { enabled: shiftIds.length > 0 },
  });

  // Fetch availabilities
  const { query: availabilitiesQuery } = useList<EmployeeAvailability>({
    resource: "employee-availability",
    filters:
      shiftIds.length > 0
        ? [{ field: "shift_id", operator: "in", value: shiftIds }]
        : [],
    pagination: { pageSize: 1000 },
    queryOptions: { enabled: shiftIds.length > 0 },
  });

  // Fetch employee_availability_positions to get position-specific registrations
  const { query: availabilityPositionsQuery } = useList<any>({
    resource: "employee-availability-positions",
    pagination: { pageSize: 1000 },
    meta: {
      fields: ["*", "availability_id", "position_id"],
    },
  });

  // Fetch assignments
  const { query: assignmentsQuery } = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
    filters: selectedSchedule
      ? [{ field: "schedule_id", operator: "eq", value: selectedSchedule }]
      : [],
    meta: { fields: ["*", "employee_id", "position_id"] },
    pagination: { pageSize: 1000 },
    queryOptions: { enabled: !!selectedSchedule },
  });

  // Fetch employees and positions
  const { query: employeesQuery } = useList<Employee>({
    resource: "employees",
    filters: [{ field: "status", operator: "eq", value: "active" }],
    pagination: { pageSize: 1000 },
  });

  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
    pagination: { pageSize: 1000 },
  });

  const requirements = useMemo(() => requirementsQuery.data?.data || [], [requirementsQuery.data?.data]);
  const availabilities = useMemo(() => availabilitiesQuery.data?.data || [], [availabilitiesQuery.data?.data]);
  const availabilityPositions = useMemo(() => availabilityPositionsQuery.data?.data || [], [availabilityPositionsQuery.data?.data]);
  const assignments = useMemo(() => assignmentsQuery.data?.data || [], [assignmentsQuery.data?.data]);
  const employees = useMemo(() => employeesQuery.data?.data || [], [employeesQuery.data?.data]);
  const positions = useMemo(() => positionsQuery.data?.data || [], [positionsQuery.data?.data]);

  // Map availability_id to position_ids
  const availabilityToPositions = useMemo(() => {
    const map: Record<string, string[]> = {};
    availabilityPositions.forEach((ap: any) => {
      if (!map[ap.availability_id]) map[ap.availability_id] = [];
      map[ap.availability_id].push(ap.position_id);
    });
    return map;
  }, [availabilityPositions]);

  // Count registered employees per shift+position as a flattened map: { [shiftId_posId]: count }
  const registeredCountByShiftPosition = useMemo(() => {
    const map: Record<string, number> = {};
    availabilities.forEach((avail: any) => {
      const positions = availabilityToPositions[avail.id] || [];
      const shiftId = avail.shift_id;
      positions.forEach((posId) => {
        const key = `${shiftId}_${posId}`;
        map[key] = (map[key] || 0) + 1;
      });
    });
    return map;
  }, [availabilities, availabilityToPositions]);

  // Calculate total shifts assigned per employee for the current schedule
  const employeeShiftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assignments.forEach((a) => {
      if (a.employee_id) {
        counts[a.employee_id] = (counts[a.employee_id] || 0) + 1;
      }
    });
    return counts;
  }, [assignments]);

  // Get selected schedule details
  const selectedScheduleData = useMemo(() => {
    if (!selectedSchedule || !schedulesSelectProps.options) return null;
    const schedule = schedulesSelectProps.options.find(
      (opt: any) => opt.value === selectedSchedule
    );
    return schedule?.value || null;
  }, [selectedSchedule, schedulesSelectProps.options]);

  // Mutations
  const { mutate: createAssignment } = useCreate<ScheduleAssignment>();
  const { mutate: deleteAssignment } = useDelete<ScheduleAssignment>();

  // Workflow hooks
  const {
    readiness,
    canPublish,
    coverageRate,
    issues,
    refetch: refetchReadiness,
  } = useScheduleReadiness(selectedSchedule);
  const { autoSchedule } = useAutoSchedule();

  // Group shifts by day
  const shiftsByDay = useMemo(() => {
    const shiftsData = shiftsQuery.data?.data || [];
    return DAYS_OF_WEEK.map((day) => {
      const dayShifts = shiftsData.filter(
        (s: any) => dayjs(s.shift_date).day() === day.value
      );
      const firstShift = dayShifts[0];

      return {
        ...day,
        date: firstShift
          ? dayjs(firstShift.shift_date).format("YYYY-MM-DD")
          : null,
        shifts: dayShifts.sort((a: any, b: any) =>
          (a.start_at || "").localeCompare(b.start_at || "")
        ),
      };
    });
  }, [shiftsQuery.data?.data]);

  // Get assignments for a shift
  const getShiftAssignments = (shiftId: string) => {
    return assignments.filter((a: any) => a.shift_id === shiftId);
  };

  // Get requirements for a shift
  const getShiftRequirements = (shiftId: string) => {
    return requirements.filter((r: any) => r.shift_id === shiftId);
  };

  // Get available employees for a shift + position
  const getAvailableEmployees = (shiftId: string, positionId: string) => {
    // Get employees who registered for this shift
    const shiftAvailabilities = availabilities.filter(
      (av: any) => av.shift_id === shiftId
    );

    // TODO: Filter by position from employee_availability_positions
    // For now, return all employees who registered
    return employees.filter((emp: any) =>
      shiftAvailabilities.some((av: any) => av.employee_id === emp.id)
    );
  };

  // Memoize available employees map
  const availableEmployeesMap = useMemo(() => {
    if (!selectedShift) return new Map();
    const map = new Map<string, Employee[]>();

    // Get requirements for the selected shift
    const shiftReqs = requirements.filter((r: any) => r.shift_id === selectedShift.id);

    shiftReqs.forEach((req) => {
      // Get employees who registered for this shift
      const shiftAvailabilities = availabilities.filter(
        (av: any) => av.shift_id === selectedShift.id
      );

      // Get available employees
      const availableEmps = employees.filter((emp: any) =>
        shiftAvailabilities.some((av: any) => av.employee_id === emp.id)
      );

      map.set(req.position_id, availableEmps);
    });

    return map;
  }, [selectedShift, requirements, availabilities, employees]);

  // Get shift type from shift
  const getShiftTypeFromShift = (shift: Shift | null): ShiftType | undefined => {
    if (!shift) return undefined;
    if (typeof shift.shift_type === "object") {
      return shift.shift_type as ShiftType;
    }
    return (shiftTypes as ShiftType[]).find((st) => st.id === shift.shift_type_id);
  };

  // Handle shift click
  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDrawerOpen(true);
  };

  // Handle assign employee
  const handleAssignEmployee = (
    shiftId: string,
    positionId: string,
    employeeId: string
  ) => {
    if (!user?.id) return;

    const data: CreateScheduleAssignmentDto = {
      schedule_id: selectedSchedule,
      shift_id: shiftId,
      employee_id: employeeId,
      position_id: positionId,
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
          message.success("Đã xếp nhân viên vào ca");
          refetchReadiness();
        },
        onError: (error: any) => {
          message.error(error?.message || "Xếp lịch thất bại");
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
          refetchReadiness();
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

    openConfirm({
      title: "Tự động xếp lịch",
      content:
        "Hệ thống sẽ tự động xếp lịch dựa trên đăng ký của nhân viên. Tiếp tục?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      type: "default",
      onConfirm: async () => {
        await autoSchedule(selectedSchedule, { overwriteExisting: false });
        refetchReadiness();
        assignmentsQuery.refetch();
        message.success("✅ Tự động xếp lịch thành công!");
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
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
              <CalendarOutlined className="text-blue-600" />
              Xếp Lịch Làm Việc
            </h2>
            <p className="text-gray-700 mt-1">
              Click vào ca để xếp nhân viên cho từng vị trí
            </p>
          </div>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleAutoSchedule}
            size="large"
            disabled={!selectedSchedule}
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
                <span className="text-sm text-gray-700">Tỷ lệ hoàn thành</span>
                <span className="text-sm font-medium">
                  {readiness.totalAssigned} / {readiness.totalRequired} vị trí
                </span>
              </div>
              <Progress
                percent={Math.round(coverageRate)}
                status={
                  canPublish
                    ? "success"
                    : coverageRate > 50
                      ? "active"
                      : "exception"
                }
                strokeColor={
                  canPublish
                    ? "#22c55e"
                    : coverageRate > 50
                      ? "#3b82f6"
                      : "#ef4444"
                }
              />
            </div>
          </div>
        </Card>
      )}

      {/* Calendar Grid */}
      {selectedSchedule ? (
        <Card>
          <div className="grid grid-cols-7 gap-4">
            {shiftsByDay.map((day) => (
              <DayColumn
                key={day.value}
                dayShort={day.short}
                dayLabel={day.label}
                date={day.date}
                shifts={day.shifts}
                shiftTypes={shiftTypes as ShiftType[]}
                assignments={assignments}
                requirements={requirements}
                registeredCountByShiftPosition={registeredCountByShiftPosition}
                onShiftClick={handleShiftClick}
              />
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <Empty description="Vui lòng chọn lịch tuần để xếp lịch" />
        </Card>
      )}

      {/* Assignment Drawer */}
      <AssignmentDrawer
        open={isDrawerOpen}
        shift={selectedShift}
        shiftType={getShiftTypeFromShift(selectedShift)}
        requirements={selectedShift ? getShiftRequirements(selectedShift.id) : []}
        assignments={selectedShift ? getShiftAssignments(selectedShift.id) : []}
        employees={employees}
        positions={positions}
        availableEmployeesMap={availableEmployeesMap}
        employeeShiftCounts={employeeShiftCounts}
        onClose={() => setIsDrawerOpen(false)}
        onRemoveAssignment={handleRemoveAssignment}
        onAssignEmployee={handleAssignEmployee}
      />
    </div>
  );
}

export default ScheduleAssignmentManagement;
