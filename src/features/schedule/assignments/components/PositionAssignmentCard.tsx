import { Card, Divider, Avatar, Button, Popconfirm, Empty } from "antd";
import { UserOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";
import { Employee, Position } from "@types";

interface PositionAssignmentCardProps {
  requirement: ShiftPositionRequirement;
  position: Position | undefined;
  assignments: ScheduleAssignment[]; // Assignments for this position only
  allShiftAssignments: ScheduleAssignment[]; // All assignments for the entire shift
  employees: Employee[];
  availableEmployees: Employee[];
  employeeShiftCounts: Record<string, number>;
  onRemoveAssignment: (assignmentId: string) => void;
  onAssignEmployee: (employeeId: string) => void;
}

export function PositionAssignmentCard({
  requirement,
  position,
  assignments,
  allShiftAssignments,
  employees,
  availableEmployees,
  employeeShiftCounts,
  onRemoveAssignment,
  onAssignEmployee,
}: PositionAssignmentCardProps) {
  // Check if employee is already assigned to ANY position in this shift
  const isEmployeeAssignedToShift = (employeeId: string) => {
    return allShiftAssignments.some((a) => a.employee_id === employeeId);
  };
  return (
    <Card key={requirement.id} size="small" title={position?.name || "Chưa có"}>
      <div className="space-y-3">
        {/* Current assignments */}
        <div>
          <div className="text-sm text-gray-600 mb-2">
            Đã xếp: {assignments.length} / {requirement.required_count}
          </div>
          {assignments.map((assignment) => {
            const employee = employees.find((e) => e.id === assignment.employee_id);
            return (
              <div
                key={assignment.id}
                className="flex items-center justify-between bg-green-50 rounded px-3 py-2 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span className="text-sm font-medium">
                    {employee?.full_name || "Chưa có"}
                  </span>
                  {assignment.note && (
                    <span className="text-xs text-gray-500 ml-1" title={assignment.note}>
                      ({assignment.note.includes("Score") ? assignment.note.split("(")[1].replace(")", "") : "Ghi chú"})
                    </span>
                  )}
                </div>
                <Popconfirm
                  title="Xóa phân công?"
                  onConfirm={() => onRemoveAssignment(assignment.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            );
          })}
        </div>

        {/* Available employees to assign */}
        {assignments.length < requirement.required_count && (
          <div>
            <Divider className="my-2">Nhân viên có thể xếp</Divider>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {availableEmployees.length > 0 ? (
                availableEmployees
                  .filter((emp) => !assignments.some((a) => a.employee_id === emp.id)) // Filter out employees assigned to THIS position
                  .map((emp) => {
                    const isAlreadyAssigned = isEmployeeAssignedToShift(emp.id);
                    return (
                      <div
                        key={emp.id}
                        className={`flex items-center justify-between rounded px-3 py-2 transition-colors ${
                          isAlreadyAssigned
                            ? "bg-gray-100 opacity-60"
                            : "bg-gray-50 hover:bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar size="small" icon={<UserOutlined />} />
                          <div>
                            <div className="text-sm font-medium">{emp.full_name}</div>
                            <div className="text-xs text-gray-500">
                              {employeeShiftCounts[emp.id] || 0} ca tuần này
                              {isAlreadyAssigned && (
                                <span className="ml-1 text-orange-500">(Đã xếp vị trí khác)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => onAssignEmployee(emp.id)}
                          disabled={isAlreadyAssigned}
                        >
                          Xếp
                        </Button>
                      </div>
                    );
                  })
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có nhân viên đăng ký"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
