import { Calendar, Badge, Tooltip, Card, Tag } from "antd";
import type { Dayjs } from "dayjs";
import dayjs, { DATE_FORMATS } from "@/lib/dayjs";

interface AttendanceRecord {
    id: string;
    created_at: string;
    clock_in: string | null;
    clock_out: string | null;
    worked_minutes: number | null;
    late_minutes: number | null;
    early_leave_minutes: number | null;
    status: "present" | "absent" | "partial";
    shift_id?: string;
    shift?: {
        id: string;
        shift_type_id?: {
            id: string;
            name: string;
            start_time: string;
            end_time: string;
            color?: string;
        };
    };
    notes?: string | null;
}

interface EmployeeAttendanceCalendarProps {
    records: readonly AttendanceRecord[];
    month: Dayjs;
    onEdit?: (record: AttendanceRecord) => void;
}

// Helper: Xác định loại ca dựa trên giờ check-in
const getShiftInfo = (clockIn: string | null, shift?: AttendanceRecord['shift']) => {
    // Nếu có thông tin shift từ API, dùng luôn
    if (shift?.shift_type_id) {
        return {
            name: shift.shift_type_id.name,
            color: shift.shift_type_id.color || '#1890ff',
            time: `${shift.shift_type_id.start_time} - ${shift.shift_type_id.end_time}`
        };
    }

    // Fallback: Xác định ca dựa trên giờ clock_in
    if (!clockIn) return { name: 'Không xác định', color: '#999', time: '' };

    const hour = dayjs(clockIn).hour();

    if (hour >= 5 && hour < 10) {
        return { name: '🌅 Ca Sáng', color: '#52c41a', time: '07:00 - 15:00' };
    } else if (hour >= 10 && hour < 16) {
        return { name: '☀️ Ca Chiều', color: '#faad14', time: '12:00 - 20:00' };
    } else if (hour >= 16 && hour < 21) {
        return { name: '🌆 Ca Tối', color: '#722ed1', time: '18:00 - 02:00' };
    } else {
        return { name: '🌙 Ca Đêm', color: '#1890ff', time: '22:00 - 06:00' };
    }
};

export const EmployeeAttendanceCalendar = ({
    records,
    month,
    onEdit,
}: EmployeeAttendanceCalendarProps) => {
    const getListData = (value: Dayjs) => {
        const dateStr = value.format(DATE_FORMATS.DATE_ONLY);
        // Filter records for this day based on clock_in time (not created_at)
        const dayRecords = records.filter((r) =>
            r.clock_in && dayjs(r.clock_in).format(DATE_FORMATS.DATE_ONLY) === dateStr
        );

        return dayRecords || [];
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);

        // Sort records by clock_in time
        const sortedRecords = [...listData].sort((a, b) => {
            if (!a.clock_in || !b.clock_in) return 0;
            return dayjs(a.clock_in).valueOf() - dayjs(b.clock_in).valueOf();
        });

        return (
            <div className="events space-y-2">
                {sortedRecords.map((item) => {
                    const shiftInfo = getShiftInfo(item.clock_in, item.shift);
                    const hasIssue = (item.late_minutes || 0) > 0 || (item.early_leave_minutes || 0) > 0;

                    return (
                        <Tooltip
                            key={item.id}
                            title={
                                <div className="text-sm">
                                    <div className="font-semibold mb-1">{shiftInfo.name}</div>
                                    <div>Ca: {shiftInfo.time}</div>
                                    <div>Vào: {item.clock_in ? dayjs(item.clock_in).format(DATE_FORMATS.TIME_SHORT) : '-'}</div>
                                    <div>Ra: {item.clock_out ? dayjs(item.clock_out).format(DATE_FORMATS.TIME_SHORT) : '-'}</div>
                                    <div>Làm: {item.worked_minutes ? `${Math.floor(item.worked_minutes / 60)}h ${item.worked_minutes % 60}p` : '-'}</div>
                                    {(item.late_minutes || 0) > 0 && <div className="text-red-300">Trễ: {item.late_minutes} phút</div>}
                                    {(item.early_leave_minutes || 0) > 0 && <div className="text-orange-300">Về sớm: {item.early_leave_minutes} phút</div>}
                                    {item.notes && <div className="italic mt-1">📝 {item.notes}</div>}
                                </div>
                            }
                        >
                            <div
                                className={`
                                    p-1 rounded-md border-l-4 bg-gray-50
                                    ${onEdit ? "cursor-pointer hover:bg-blue-50 hover:shadow-sm transition-all" : ""}
                                    ${hasIssue ? "bg-red-50" : ""}
                                `}
                                style={{ borderLeftColor: shiftInfo.color }}
                                onClick={() => onEdit && onEdit(item)}
                            >
                                {/* Shift Label */}
                                <div
                                    className="text-[10px] font-medium mb-0.5 truncate"
                                    style={{ color: shiftInfo.color }}
                                >
                                    {shiftInfo.name}
                                </div>

                                {/* Check-in/out times */}
                                <div className="flex flex-col gap-0.5">
                                    <Tag

                                        color={(item.late_minutes || 0) > 0 ? "warning" : "success"}
                                        className="text-[10px] px-1 py-0 m-0"
                                    >
                                        In: {dayjs(item.clock_in).format(DATE_FORMATS.TIME_SHORT)}
                                    </Tag>
                                    {item.clock_out && (
                                        <Tag
                                            // size="small"
                                            color={(item.early_leave_minutes || 0) > 0 ? "warning" : "success"}
                                            className="text-[10px] px-1 py-0 m-0"
                                        >
                                            Out: {dayjs(item.clock_out).format(DATE_FORMATS.TIME_SHORT)}
                                        </Tag>
                                    )}
                                </div>

                                {/* Issues summary */}
                                {hasIssue && (
                                    <div className="text-[9px] mt-0.5">
                                        {(item.late_minutes || 0) > 0 && (
                                            <span className="text-red-500">Trễ {item.late_minutes}p </span>
                                        )}
                                        {(item.early_leave_minutes || 0) > 0 && (
                                            <span className="text-orange-500">Sớm {item.early_leave_minutes}p</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#52c41a' }}></div>
                    <span>🌅 Ca Sáng (07:00-15:00)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#faad14' }}></div>
                    <span>☀️ Ca Chiều (12:00-20:00)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#722ed1' }}></div>
                    <span>🌆 Ca Tối (18:00-02:00)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1890ff' }}></div>
                    <span>🌙 Ca Đêm (22:00-06:00)</span>
                </div>
            </div>

            <Calendar
                value={month}
                cellRender={dateCellRender}
                fullscreen={false}
            />
        </div>
    );
};
