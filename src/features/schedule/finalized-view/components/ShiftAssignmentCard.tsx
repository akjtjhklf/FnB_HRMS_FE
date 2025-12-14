"use client";

import { Tag, Tooltip, Space, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface EmployeeInfo {
    id: string;
    full_name: string;
}

interface PositionInfo {
    id: string;
    name: string;
}

interface AssignmentData {
    id: string;
    employee_id: string | EmployeeInfo;
    position_id: string | PositionInfo;
    status: string;
}

interface ShiftAssignmentCardProps {
    assignments: AssignmentData[];
    /** Group assignments by position */
    groupByPosition?: boolean;
}

/**
 * ShiftAssignmentCard - Hiển thị danh sách nhân viên trong ca
 * 
 * Format: Vị trí: NV A, NV B
 */
export function ShiftAssignmentCard({
    assignments,
    groupByPosition = true,
}: ShiftAssignmentCardProps) {
    if (assignments.length === 0) {
        return (
            <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
                Chưa có phân công
            </Text>
        );
    }

    // Helper to get employee name
    const getEmployeeName = (employee: string | EmployeeInfo): string => {
        if (typeof employee === "object" && employee?.full_name) {
            return employee.full_name;
        }
        return "Nhân viên";
    };

    // Helper to get position name
    const getPositionName = (position: string | PositionInfo): string => {
        if (typeof position === "object" && position?.name) {
            return position.name;
        }
        return "Vị trí";
    };

    // Helper to get position ID
    const getPositionId = (position: string | PositionInfo): string => {
        if (typeof position === "object" && position?.id) {
            return position.id;
        }
        return position as string;
    };

    if (groupByPosition) {
        // Group by position
        const byPosition: Record<string, { name: string; employees: string[] }> = {};

        assignments.forEach((assignment) => {
            const posId = getPositionId(assignment.position_id);
            const posName = getPositionName(assignment.position_id);
            const empName = getEmployeeName(assignment.employee_id);

            if (!byPosition[posId]) {
                byPosition[posId] = { name: posName, employees: [] };
            }
            byPosition[posId].employees.push(empName);
        });

        return (
            <Space direction="vertical" size={2} style={{ width: "100%" }}>
                {Object.entries(byPosition).map(([posId, data]) => (
                    <div key={posId} style={{ fontSize: 11 }}>
                        <Text strong style={{ fontSize: 11, color: "#1890ff" }}>
                            {data.name}:
                        </Text>{" "}
                        <Text style={{ fontSize: 11 }}>
                            {data.employees.join(", ")}
                        </Text>
                    </div>
                ))}
            </Space>
        );
    }

    // Flat list
    return (
        <Space wrap size={4}>
            {assignments.map((assignment) => (
                <Tooltip
                    key={assignment.id}
                    title={getPositionName(assignment.position_id)}
                >
                    <Tag
                        icon={<UserOutlined />}
                        color={assignment.status === "tentative" ? "warning" : "default"}
                        style={{ margin: 0, fontSize: 10 }}
                    >
                        {getEmployeeName(assignment.employee_id)}
                    </Tag>
                </Tooltip>
            ))}
        </Space>
    );
}
