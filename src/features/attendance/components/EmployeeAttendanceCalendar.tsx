import { Calendar, Badge, Tooltip, Card, Tag } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";

interface AttendanceRecord {
    id: string;
    created_at: string;
    clock_in: string | null;
    clock_out: string | null;
    worked_minutes: number | null;
    late_minutes: number | null;
    early_leave_minutes: number | null;
    status: "present" | "absent" | "partial";
    shift_id?: string; // Can be expanded
    notes?: string | null;
}

interface EmployeeAttendanceCalendarProps {
    records: readonly AttendanceRecord[];
    month: Dayjs;
    onEdit?: (record: AttendanceRecord) => void;
}

export const EmployeeAttendanceCalendar = ({
    records,
    month,
    onEdit,
}: EmployeeAttendanceCalendarProps) => {
    const getListData = (value: Dayjs) => {
        const dateStr = value.format("YYYY-MM-DD");
        // Filter records for this day (ignoring time)
        const dayRecords = records.filter((r) =>
            dayjs(r.created_at).format("YYYY-MM-DD") === dateStr
        );

        return dayRecords || [];
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <div className="events">
                {listData.map((item) => (
                    <div
                        key={item.id}
                        className={`mb-1 ${onEdit ? "cursor-pointer hover:bg-blue-50 p-1 rounded border border-transparent hover:border-blue-200 transition-all" : ""}`}
                        onClick={() => onEdit && onEdit(item)}
                    >
                        <div className="text-xs">
                            {item.clock_in ? (
                                <Tag color={item.late_minutes && item.late_minutes > 0 ? "warning" : "success"}>
                                    In: {dayjs(item.clock_in).format("HH:mm")}
                                </Tag>
                            ) : (
                                <Tag>No Check-in</Tag>
                            )}
                        </div>
                        <div className="text-xs mt-1">
                            {item.clock_out ? (
                                <Tag color={item.early_leave_minutes && item.early_leave_minutes > 0 ? "warning" : "success"}>
                                    Out: {dayjs(item.clock_out).format("HH:mm")}
                                </Tag>
                            ) : (
                                <Tag>No Check-out</Tag>
                            )}
                        </div>
                        {(item.late_minutes || 0) > 0 && (
                            <div className="text-xs text-red-500">Trễ: {item.late_minutes}p</div>
                        )}
                        {(item.early_leave_minutes || 0) > 0 && (
                            <div className="text-xs text-orange-500">Sớm: {item.early_leave_minutes}p</div>
                        )}
                        {item.notes && (
                            <div className="text-xs text-gray-500 italic mt-1 truncate" title={item.notes}>
                                📝 {item.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4">
            <Calendar
                value={month}
                cellRender={dateCellRender}
                fullscreen={false}
            />
        </div>
    );
};
