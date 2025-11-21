import { Card, Tag, Badge } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Shift } from "@/types/schedule/shift.types";
import type { ShiftType } from "@/types/schedule/shift-type.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";

interface ShiftCardProps {
  shift: Shift;
  shiftType?: ShiftType;
  assignments: ScheduleAssignment[];
  requirements: ShiftPositionRequirement[];
  registeredCountByShiftPosition: Record<string, Record<string, number>>;
  onClick: () => void;
}

export function ShiftCard({
  shift,
  shiftType,
  assignments,
  requirements,
  registeredCountByShiftPosition,
  onClick,
}: ShiftCardProps) {
  // Group requirements by position to show separate badges
  const requirementsByPosition = requirements.reduce((acc, req) => {
    const posId =
      typeof req.position === "object" ? req.position.id : req.position_id;
    if (!acc[posId])
      acc[posId] = { position: req.position, required: 0, assigned: 0 };
    acc[posId].required += req.required_count || 0;
    return acc;
  }, {} as Record<string, { position: any; required: number; assigned: number }>);

  // Count assignments per position
  assignments.forEach((assignment) => {
    const posId =
      typeof assignment.position === "object"
        ? assignment.position.id
        : assignment.position_id;
    if (requirementsByPosition[posId]) {
      requirementsByPosition[posId].assigned += 1;
    }
  });

  const totalAssigned = assignments.length;
  const totalRequired = shift.total_required || 0;

  const getTimeDisplay = (
    time: string | null,
    fallbackTime?: string
  ): string => {
    if (time) {
      return time.includes("T")
        ? dayjs(time).format("HH:mm")
        : time.substring(0, 5);
    }
    if (fallbackTime) {
      return fallbackTime.includes("T")
        ? dayjs(fallbackTime).format("HH:mm")
        : fallbackTime.substring(0, 5);
    }
    return "N/A";
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-400"
      size="small"
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Shift Type */}
        <div className="flex items-center justify-between">
          <Tag color={shiftType?.cross_midnight ? "red" : "blue"}>
            {shiftType?.name || "N/A"}
          </Tag>
          <Badge
            count={`${totalAssigned}/${totalRequired}`}
            style={{
              backgroundColor:
                totalAssigned >= totalRequired
                  ? "#22c55e"
                  : totalAssigned > 0
                  ? "#f59e0b"
                  : "#6b7280",
            }}
          />
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <ClockCircleOutlined />
          {getTimeDisplay(shift.start_at, shiftType?.start_time)} -{" "}
          {getTimeDisplay(shift.end_at, shiftType?.end_time)}
        </div>

        {/* Position-specific badges with assigned/registered/required */}
        {Object.entries(requirementsByPosition).map(([posId, data]) => {
          const registeredKey = `${shift.id}_${posId}`;
          const registeredCount =
            typeof registeredCountByShiftPosition[registeredKey] === "number"
              ? registeredCountByShiftPosition[registeredKey]
              : 0; // Đảm bảo giá trị là number
          const positionName =
            typeof data.position === "object" ? data.position.name : "N/A";

          return (
            <div
              key={posId}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-gray-600 truncate flex-1">
                {positionName}
              </span>
              <Badge
                count={`${data.assigned}/${registeredCount}/${data.required}`}
                style={{
                  backgroundColor:
                    data.assigned >= data.required
                      ? "#22c55e"
                      : registeredCount > 0
                      ? "#3b82f6"
                      : "#6b7280",
                  fontSize: "10px",
                }}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
