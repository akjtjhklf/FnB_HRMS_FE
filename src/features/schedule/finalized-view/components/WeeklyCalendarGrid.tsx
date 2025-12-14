"use client";

import { useMemo } from "react";
import { Card, Typography, Tag, Empty } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import { ShiftAssignmentCard } from "./ShiftAssignmentCard";
import type { Shift } from "@/types/schedule/shift.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";

const { Text } = Typography;

interface ShiftTypeInfo {
    id: string;
    name: string;
    start_time?: string;
    end_time?: string;
    color?: string;
}

interface WeeklyCalendarGridProps {
    weekStart: string;
    weekEnd: string;
    shifts: Shift[];
    assignments: ScheduleAssignment[];
    shiftTypes: ShiftTypeInfo[];
}

/**
 * WeeklyCalendarGrid - Grid hiển thị lịch làm theo tuần
 * 
 * Layout: Luôn từ Thứ 2 → Chủ Nhật (tuần ISO)
 * Format: Ca → Vị trí → Nhân viên
 */
export function WeeklyCalendarGrid({
    weekStart,
    shifts,
    assignments,
    shiftTypes,
}: WeeklyCalendarGridProps) {
    // Generate 7 days from Monday of the ISO week (always Mon-Sun)
    const days = useMemo(() => {
        const result = [];
        const start = dayjs(weekStart).startOf("isoWeek"); // Always Monday
        for (let i = 0; i < 7; i++) {
            result.push(start.add(i, "day"));
        }
        return result;
    }, [weekStart]);

    // Group shifts by EXACT date and shift_type
    const shiftsByDateAndType = useMemo(() => {
        const grid: Record<string, Record<string, Shift>> = {};

        shifts.forEach((shift) => {
            const dateKey = dayjs(shift.shift_date).format("YYYY-MM-DD");
            const shiftTypeId = typeof shift.shift_type_id === "object"
                ? (shift.shift_type_id as ShiftTypeInfo).id
                : shift.shift_type_id;

            if (!grid[dateKey]) grid[dateKey] = {};
            grid[dateKey][shiftTypeId] = shift;
        });

        return grid;
    }, [shifts]);

    // Group assignments by shift_id
    const assignmentsByShift = useMemo(() => {
        const map: Record<string, ScheduleAssignment[]> = {};
        assignments.forEach((a) => {
            if (!map[a.shift_id]) map[a.shift_id] = [];
            map[a.shift_id].push(a);
        });
        return map;
    }, [assignments]);

    if (shiftTypes.length === 0) {
        return <Empty description="Không có loại ca nào" />;
    }

    return (
        <div style={{ overflowX: "auto" }}>
            {/* Grid container */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "100px repeat(7, 1fr)",
                    gap: 8,
                    minWidth: 900,
                }}
            >
                {/* Header row */}
                <div
                    style={{
                        fontWeight: 600,
                        textAlign: "center",
                        padding: "12px 8px",
                        background: "#f5f5f5",
                        borderRadius: 6,
                    }}
                >
                    Ca làm
                </div>
                {days.map((day) => (
                    <div
                        key={day.format("YYYY-MM-DD")}
                        style={{
                            textAlign: "center",
                            padding: "8px",
                            background: day.isSame(dayjs(), "day") ? "#e6f7ff" : "#fafafa",
                            borderRadius: 6,
                            border: day.isSame(dayjs(), "day") ? "1px solid #91d5ff" : "1px solid #f0f0f0",
                        }}
                    >
                        <div style={{ fontWeight: 600, color: "#1890ff" }}>{day.format("dddd")}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {day.format("DD/MM")}
                        </Text>
                    </div>
                ))}

                {/* Data rows - by shift type */}
                {shiftTypes.map((shiftType) => (
                    <>
                        {/* Shift type label */}
                        <Card
                            key={`type-${shiftType.id}`}
                            size="small"
                            style={{
                                background: shiftType.color ? `${shiftType.color}15` : "#f5f5f5",
                                borderColor: shiftType.color || "#d9d9d9",
                            }}
                            styles={{ body: { padding: 8 } }}
                        >
                            <Tag color={shiftType.color || "default"} style={{ marginBottom: 4 }}>
                                {shiftType.name}
                            </Tag>
                            {shiftType.start_time && shiftType.end_time && (
                                <div style={{ fontSize: 10, color: "#888" }}>
                                    <ClockCircleOutlined /> {shiftType.start_time} - {shiftType.end_time}
                                </div>
                            )}
                        </Card>

                        {/* Day cells - exact date map from Mon-Sun of ISO week */}
                        {days.map((day) => {
                            const dateKey = day.format("YYYY-MM-DD");
                            const shift = shiftsByDateAndType[dateKey]?.[shiftType.id];
                            const shiftAssignments = shift ? assignmentsByShift[shift.id] || [] : [];

                            return (
                                <Card
                                    key={`${shiftType.id}-${dateKey}`}
                                    size="small"
                                    style={{
                                        minHeight: 60,
                                        background: shiftAssignments.length > 0 ? "#fafafa" : "#fff",
                                    }}
                                    styles={{ body: { padding: 8, overflow: "hidden" } }}
                                >
                                    {shift ? (
                                        <ShiftAssignmentCard
                                            assignments={shiftAssignments as any}
                                            groupByPosition={true}
                                        />
                                    ) : (
                                        <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
                                            -
                                        </Text>
                                    )}
                                </Card>
                            );
                        })}
                    </>
                ))}
            </div>
        </div>
    );
}
