"use client";

import { useState, useMemo, useEffect } from "react";
import { useList, useShow } from "@refinedev/core";
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Space,
    Tabs,
    Table,
    Tag,
    Empty,
    Spin,
    Alert,
} from "antd";
import {
    CalendarOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TableOutlined,
} from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import { ScheduleSelector, WeeklyCalendarGrid } from "./components";
import type { WeeklySchedule } from "@/types/schedule";
import type { Shift } from "@/types/schedule/shift.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";

const { Title, Text } = Typography;

interface ShiftTypeInfo {
    id: string;
    name: string;
    start_time?: string;
    end_time?: string;
    color?: string;
}

/**
 * FinalizedScheduleView - Trang xem lịch làm việc đã hoàn tất
 * 
 * Features:
 * - Chọn lịch tuần đã finalized
 * - Hiển thị grid: Ca → Vị trí → Nhân viên
 * - Calendar View + Table View
 * - Thống kê: tổng ca, tổng phân công, tỷ lệ
 */
export function FinalizedScheduleView() {
    const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

    // Fetch schedules (both scheduled and finalized) để auto-select cái mới nhất
    const { query: schedulesQuery } = useList<WeeklySchedule>({
        resource: "weekly-schedules",
        pagination: { mode: "off" },
        filters: [{ field: "status", operator: "in", value: ["scheduled", "finalized"] }],
        sorters: [{ field: "week_start", order: "desc" }],
    });

    // Auto-select lịch tuần mới nhất
    useEffect(() => {
        const schedules = schedulesQuery.data?.data || [];
        if (!selectedScheduleId && schedules.length > 0) {
            setSelectedScheduleId(schedules[0].id);
        }
    }, [schedulesQuery.data?.data, selectedScheduleId]);

    // Fetch selected schedule details
    const { query: scheduleQuery } = useShow<WeeklySchedule>({
        resource: "weekly-schedules",
        id: selectedScheduleId,
        queryOptions: { enabled: !!selectedScheduleId },
    });

    // Fetch shifts for selected schedule
    const { query: shiftsQuery } = useList<Shift>({
        resource: "shifts",
        filters: [{ field: "schedule_id", operator: "eq", value: selectedScheduleId }],
        pagination: { mode: "off" },
        meta: {
            fields: ["*", "shift_type_id.*"],
        },
        queryOptions: { enabled: !!selectedScheduleId },
    });

    // Fetch assignments for selected schedule (same approach as Xếp Lịch page)
    const { query: assignmentsQuery } = useList<ScheduleAssignment>({
        resource: "schedule-assignments",
        filters: selectedScheduleId
            ? [
                { field: "schedule_id", operator: "eq", value: selectedScheduleId },
            ]
            : [],
        pagination: { mode: "off" },
        meta: {
            fields: ["*", "employee_id.*", "position_id.*"],
        },
        queryOptions: { enabled: !!selectedScheduleId },
    });

    // Fetch shift types for grid
    const { query: shiftTypesQuery } = useList<ShiftTypeInfo>({
        resource: "shift-types",
        pagination: { mode: "off" },
    });

    const schedule = scheduleQuery.data?.data;
    const shifts = useMemo(() => shiftsQuery.data?.data || [], [shiftsQuery.data?.data]);
    const assignments = useMemo(() => assignmentsQuery.data?.data || [], [assignmentsQuery.data?.data]);
    const shiftTypes = useMemo(() => shiftTypesQuery.data?.data || [], [shiftTypesQuery.data?.data]);

    const isLoading = scheduleQuery.isLoading || shiftsQuery.isLoading || assignmentsQuery.isLoading;

    // Calculate stats
    const stats = useMemo(() => {
        const totalShifts = shifts.length;
        const totalAssignments = assignments.length;
        const uniqueEmployees = new Set(assignments.map((a) =>
            typeof a.employee_id === "object" ? (a.employee_id as any).id : a.employee_id
        )).size;
        const totalRequired = shifts.reduce((sum, s) => sum + (s.total_required || 0), 0);
        const coverageRate = totalRequired > 0 ? (totalAssignments / totalRequired) * 100 : 0;

        return {
            totalShifts,
            totalAssignments,
            uniqueEmployees,
            totalRequired,
            coverageRate: Math.min(coverageRate, 100),
        };
    }, [shifts, assignments]);

    // Table columns for table view
    const tableColumns = [
        {
            title: "Ngày",
            dataIndex: "shift_date",
            key: "shift_date",
            width: 140,
            render: (date: string) => dayjs(date).format("DD/MM (dddd)"),
            sorter: (a: Shift, b: Shift) => dayjs(a.shift_date).unix() - dayjs(b.shift_date).unix(),
        },
        {
            title: "Loại ca",
            key: "shift_type",
            width: 120,
            render: (_: any, record: Shift) => {
                const shiftType = typeof record.shift_type_id === "object"
                    ? record.shift_type_id as ShiftTypeInfo
                    : shiftTypes.find((st) => st.id === record.shift_type_id);
                return shiftType ? (
                    <Tag color={shiftType.color || "default"}>{shiftType.name}</Tag>
                ) : "-";
            },
        },
        {
            title: "Thời gian",
            key: "time",
            width: 100,
            render: (_: any, record: Shift) => {
                const shiftType = typeof record.shift_type_id === "object"
                    ? record.shift_type_id as ShiftTypeInfo
                    : null;
                const start = record.start_at || shiftType?.start_time || "--:--";
                const end = record.end_at || shiftType?.end_time || "--:--";
                return `${start} - ${end}`;
            },
        },
        {
            title: "Nhân viên phân công",
            key: "assignments",
            render: (_: any, record: Shift) => {
                const shiftAssignments = assignments.filter((a) => a.shift_id === record.id);
                if (shiftAssignments.length === 0) {
                    return <Text type="secondary">Chưa có</Text>;
                }

                // Group by position
                const byPosition: Record<string, string[]> = {};
                shiftAssignments.forEach((a) => {
                    const posName = typeof a.position_id === "object" ? (a.position_id as any).name : "Vị trí";
                    const empName = typeof a.employee_id === "object" ? (a.employee_id as any).full_name : "NV";
                    if (!byPosition[posName]) byPosition[posName] = [];
                    byPosition[posName].push(empName);
                });

                return (
                    <Space direction="vertical" size={0}>
                        {Object.entries(byPosition).map(([pos, emps]) => (
                            <Text key={pos} style={{ fontSize: 12 }}>
                                <Text strong style={{ color: "#1890ff" }}>{pos}:</Text> {emps.join(", ")}
                            </Text>
                        ))}
                    </Space>
                );
            },
        },
        {
            title: "Yêu cầu",
            dataIndex: "total_required",
            key: "total_required",
            width: 80,
            render: (val: number, record: Shift) => {
                const assigned = assignments.filter((a) => a.shift_id === record.id).length;
                const required = val || 0;
                const color = assigned >= required ? "success" : "warning";
                return <Tag color={color}>{assigned}/{required}</Tag>;
            },
        },
    ];

    // No schedules available
    if (!schedulesQuery.isLoading && (schedulesQuery.data?.data || []).length === 0) {
        return (
            <div style={{ padding: 24 }}>
                <Title level={2}>
                    <CalendarOutlined /> Xem Lịch Làm Việc
                </Title>
                <Alert
                    message="Chưa có lịch tuần nào được hoàn tất"
                    description="Vui lòng hoàn tất (finalize) một lịch tuần để xem ở đây."
                    type="info"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            <CalendarOutlined /> Xem Lịch Làm Việc
                        </Title>
                    </Col>
                    <Col>
                        <ScheduleSelector
                            value={selectedScheduleId}
                            onChange={setSelectedScheduleId}
                            statusFilter={["scheduled", "finalized"]}
                        />
                    </Col>
                </Row>
                {schedule && (
                    <Text type="secondary">
                        Tuần {dayjs(schedule.week_start).isoWeek()}: {dayjs(schedule.week_start).format("DD/MM/YYYY")} - {dayjs(schedule.week_end).format("DD/MM/YYYY")}
                    </Text>
                )}
            </div>

            {/* Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng số ca"
                            value={stats.totalShifts}
                            prefix={<ClockCircleOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng phân công"
                            value={stats.totalAssignments}
                            prefix={<TeamOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Nhân viên tham gia"
                            value={stats.uniqueEmployees}
                            prefix={<TeamOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ đáp ứng"
                            value={stats.coverageRate.toFixed(0)}
                            suffix="%"
                            valueStyle={{
                                color: stats.coverageRate >= 80 ? "#3f8600" : "#cf1322",
                            }}
                            prefix={<CheckCircleOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Card>
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <Spin size="large" />
                    </div>
                ) : !selectedScheduleId ? (
                    <Empty description="Vui lòng chọn lịch tuần để xem" />
                ) : (
                    <Tabs
                        defaultActiveKey="calendar"
                        items={[
                            {
                                key: "calendar",
                                label: (
                                    <span>
                                        <CalendarOutlined /> Calendar View
                                    </span>
                                ),
                                children: schedule ? (
                                    <WeeklyCalendarGrid
                                        weekStart={schedule.week_start}
                                        weekEnd={schedule.week_end}
                                        shifts={shifts}
                                        assignments={assignments}
                                        shiftTypes={shiftTypes as ShiftTypeInfo[]}
                                    />
                                ) : null,
                            },
                            {
                                key: "table",
                                label: (
                                    <span>
                                        <TableOutlined /> Table View
                                    </span>
                                ),
                                children: (
                                    <Table
                                        dataSource={shifts}
                                        columns={tableColumns}
                                        rowKey="id"
                                        pagination={false}
                                        scroll={{ x: 800 }}
                                        size="small"
                                    />
                                ),
                            },
                        ]}
                    />
                )}
            </Card>
        </div>
    );
}
