import { Card, Divider, Avatar, Button, Popconfirm, Empty } from "antd";
import { UserOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ShiftPositionRequirement } from "@/types/schedule/shift-position-requirement.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";
import { Employee, Position } from "@types";

interface PositionAssignmentCardProps {
  requirement: ShiftPositionRequirement;
  position: Position | undefined;
  assignments: ScheduleAssignment[];
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
  employees,
  availableEmployees,
  employeeShiftCounts,
  onRemoveAssignment,
  onAssignEmployee,
}: PositionAssignmentCardProps) {
  return (
    <Card key={requirement.id} size="small" title={position?.name || "N/A"}>
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
                    {employee?.full_name || "N/A"}
                  </span>
                  {assignment.note && (
                    <span className="text-xs text-gray-500 ml-1" title={assignment.note}>
                      ({assignment.note.includes("Score") ? assignment.note.split("(")[1].replace(")", "") : "Note"})
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
                  .filter((emp) => !assignments.some((a) => a.employee_id === emp.id)) // Only filter out currently assigned employees
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar size="small" icon={<UserOutlined />} />
                        <div>
                          <div className="text-sm font-medium">{emp.full_name}</div>
                          <div className="text-xs text-gray-500">
                            {employeeShiftCounts[emp.id] || 0} ca tuần này
                          </div>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => onAssignEmployee(emp.id)}
                      >
                        Xếp
                      </Button>
                    </div>
                  ))
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
