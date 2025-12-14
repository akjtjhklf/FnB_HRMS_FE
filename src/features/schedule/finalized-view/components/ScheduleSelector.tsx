"use client";

import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { Select, Space, Typography, Tag } from "antd";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import type { WeeklySchedule } from "@/types/schedule";

const { Text } = Typography;

interface ScheduleSelectorProps {
    value?: string;
    onChange?: (scheduleId: string) => void;
    /** Filter by status, defaults to 'finalized' */
    statusFilter?: string[];
}

/**
 * ScheduleSelector - Dropdown chọn lịch tuần
 * 
 * Features:
 * - Fetch lịch tuần theo filter status
 * - Hiển thị week_start - week_end + tuần số
 * - Auto-select lịch tuần mới nhất nếu chưa có value
 */
export function ScheduleSelector({
    value,
    onChange,
    statusFilter = ["finalized"],
}: ScheduleSelectorProps) {
    // Fetch weekly schedules với filter
    const { query } = useList<WeeklySchedule>({
        resource: "weekly-schedules",
        pagination: { mode: "off" },
        filters: statusFilter.length > 0
            ? [{ field: "status", operator: "in", value: statusFilter }]
            : [],
        sorters: [{ field: "week_start", order: "desc" }],
    });

    const schedules = useMemo(() => query.data?.data || [], [query.data?.data]);

    // Format option label
    const formatLabel = (schedule: WeeklySchedule) => {
        const weekStart = dayjs(schedule.week_start);
        const weekEnd = dayjs(schedule.week_end);
        const weekNumber = weekStart.isoWeek();
        const year = weekStart.year();

        return `${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM/YYYY")} (Tuần ${weekNumber}/${year})`;
    };

    // Options for Select
    const options = useMemo(() =>
        schedules.map((schedule) => ({
            value: schedule.id,
            label: (
                <Space>
                    <CalendarOutlined />
                    <span>{formatLabel(schedule)}</span>
                    {schedule.status === "finalized" && (
                        <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
                            Hoàn tất
                        </Tag>
                    )}
                    {schedule.status === "scheduled" && (
                        <Tag color="processing" style={{ margin: 0 }}>
                            Đã công bố
                        </Tag>
                    )}
                </Space>
            ),
            searchText: formatLabel(schedule),
        })),
        [schedules]
    );

    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            placeholder="Chọn tuần làm việc..."
            loading={query.isLoading}
            style={{ minWidth: 350 }}
            showSearch
            optionFilterProp="searchText"
            notFoundContent={
                query.isLoading ? "Đang tải..." : "Không có lịch tuần nào"
            }
        />
    );
}
