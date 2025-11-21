import { Drawer, Card, Tag, Divider, Empty } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Shift } from "@/types/schedule/shift.types";
import type { ShiftType } from "@/types/schedule/shift-type.types";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";
import { PositionAssignmentCard } from "./PositionAssignmentCard";

interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
  [key: string]: any;
}

interface Position {
  id: string;
  name: string;
  [key: string]: any;
}

interface AssignmentDrawerProps {
  open: boolean;
  shift: Shift | null;
  shiftType?: ShiftType;
  requirements: ShiftPositionRequirement[];
  assignments: ScheduleAssignment[];
  employees: Employee[];
  positions: Position[];
  availableEmployeesMap: Map<string, Employee[]>;
  onClose: () => void;
  onRemoveAssignment: (assignmentId: string) => void;
  onAssignEmployee: (shiftId: string, positionId: string, employeeId: string) => void;
}

export function AssignmentDrawer({
  open,
  shift,
  shiftType,
  requirements,
  assignments,
  employees,
  positions,
  availableEmployeesMap,
  onClose,
  onRemoveAssignment,
  onAssignEmployee,
}: AssignmentDrawerProps) {
  if (!shift) return null;

  const getPositionAssignments = (positionId: string) => {
    return assignments.filter((a) => a.position_id === positionId);
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined />
          <span>Xếp nhân viên cho ca</span>
        </div>
      }
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Shift Info */}
        <Card size="small">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Ngày:</span>
              <span>{dayjs(shift.shift_date).format("DD/MM/YYYY")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Loại ca:</span>
              <Tag color={shiftType?.cross_midnight ? "red" : "blue"}>
                {shiftType?.name || "N/A"}
              </Tag>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tổng cần:</span>
              <span>{shift.total_required} người</span>
            </div>
          </div>
        </Card>

        <Divider>Vị trí cần xếp</Divider>

        {/* Requirements List */}
        <div className="space-y-4">
          {requirements.length > 0 ? (
            requirements.map((req) => {
              const position = positions.find((p) => p.id === req.position_id);
              const positionAssignments = getPositionAssignments(req.position_id);
              const availableEmployees = availableEmployeesMap.get(req.position_id) || [];

              return (
                <PositionAssignmentCard
                  key={req.id}
                  requirement={req}
                  position={position}
                  assignments={positionAssignments}
                  employees={employees}
                  availableEmployees={availableEmployees}
                  onRemoveAssignment={onRemoveAssignment}
                  onAssignEmployee={(employeeId) =>
                    onAssignEmployee(shift.id, req.position_id, employeeId)
                  }
                />
              );
            })
          ) : (
            <Empty description="Ca này chưa có yêu cầu vị trí" />
          )}
        </div>
      </div>
    </Drawer>
  );
}
