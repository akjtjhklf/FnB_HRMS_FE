import { Empty, Card } from "antd";
import dayjs from "dayjs";
import type { Shift } from "@/types/schedule/shift.types";
import type { ShiftType } from "@/types/schedule/shift-type.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
import type { EmployeeAvailability } from "@/types/schedule/employee-availability.types";
import { ShiftCard } from "./ShiftCard";

interface DayColumnProps {
  dayShort: string;
  dayLabel: string;
  date: string | null;
  shifts: Shift[];
  shiftTypes: ShiftType[];
  assignments: ScheduleAssignment[];
  requirements: ShiftPositionRequirement[];
  registeredCountByShiftPosition: Record<string, Record<string, number>>;
  onShiftClick: (shift: Shift) => void;
}

export function DayColumn({
  dayShort,
  dayLabel,
  date,
  shifts,
  shiftTypes,
  assignments,
  requirements,
  registeredCountByShiftPosition,
  onShiftClick,
}: DayColumnProps) {
  const getShiftType = (shift: Shift): ShiftType | undefined => {
    if (typeof shift.shift_type === "object" && shift.shift_type !== null) {
      return shift.shift_type as ShiftType;
    }
    return shiftTypes.find((st) => st.id === shift.shift_type_id);
  };

  const getShiftAssignments = (shiftId: string) => {
    return assignments.filter((a) => a.shift_id === shiftId);
  };

  const getShiftRequirements = (shiftId: string) => {
    return requirements.filter((r) => r.shift_id === shiftId);
  };

  return (
    <div className="flex flex-col min-h-[200px]">
      {/* Day Header */}
      <div className="text-center mb-3 sticky top-0 bg-white z-10 pb-2">
        <div className="inline-flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg px-4 py-2 shadow-sm">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            {dayShort}
          </span>
          <span className="text-sm font-bold text-gray-800 mt-1">{dayLabel}</span>
          {date && (
            <span className="text-xs text-gray-600 mt-0.5">
              {dayjs(date).format("DD/MM")}
            </span>
          )}
        </div>
      </div>

      {/* Shifts */}
      <div className="space-y-2 flex-1">
        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              shiftType={getShiftType(shift)}
              assignments={getShiftAssignments(shift.id)}
              requirements={getShiftRequirements(shift.id)}
              registeredCountByShiftPosition={registeredCountByShiftPosition}
              onClick={() => onShiftClick(shift)}
            />
          ))
        ) : (
          <Card size="small" className="border-dashed">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-xs text-gray-400">Chưa có ca</span>}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
