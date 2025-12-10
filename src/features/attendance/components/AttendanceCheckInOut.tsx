"use client";

import { Card } from "@/components/ui/Card";
import { Button, Select, Form, App, Spin } from "antd";
import { Clock, MapPin, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useCustomMutation, useList, useGetIdentity } from "@refinedev/core";
import dayjs from "@/lib/dayjs";

export function AttendanceCheckInOut() {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const { mutate: checkIn } = useCustomMutation();
    const { mutate: checkOut } = useCustomMutation();
    const { data: user } = useGetIdentity<any>();

    const [currentStatus, setCurrentStatus] = useState<"checked-out" | "checked-in">("checked-out");
    const [lastAction, setLastAction] = useState<{ time: string; type: string } | null>(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    // Fetch assignments for today
    const { query: assignmentsQuery } = useList<any>({
        resource: "schedule-assignments",
        pagination: { pageSize: 100 },
        filters: [
            {
                field: "employee_id",
                operator: "eq",
                value: user?.employee?.id,
            },
            // We'll filter by date client-side to be safe with timezones for now, 
            // or we could add a date filter if the API supports it robustly.
        ],
        meta: {
            fields: [
                "*",
                "shift.*",
                "shift.shift_type.id",
                "shift.shift_type.name",
                "shift_id.*",
                "shift_id.shift_type.id",
                "shift_id.shift_type.name"
            ],
        },
        queryOptions: {
            enabled: !!user?.employee?.id,
        },
    });

    // Fetch shifts and shift-types for fallback
    const { query: shiftsQuery } = useList<any>({
        resource: "shifts",
        pagination: { pageSize: 1000 },
        meta: {
            fields: ["*", "shift_type.id", "shift_type.name"],
        },
    });
    const { query: shiftTypesQuery } = useList<any>({
        resource: "shift-types",
        pagination: { pageSize: 1000 },
        meta: {
            fields: ["id", "name"],
        },
    });

    // Fetch attendance records for today to check status
    const { query: attendanceQuery } = useList<any>({
        resource: "attendance-shifts",
        pagination: { pageSize: 100 },
        filters: [
            {
                field: "employee_id",
                operator: "eq",
                value: user?.employee?.id,
            },
            // Temporarily remove date filter to debug
            // {
            //     field: "created_at",
            //     operator: "gte",
            //     value: dayjs().startOf('day').toISOString(),
            // },
            // {
            //     field: "created_at",
            //     operator: "lte",
            //     value: dayjs().endOf('day').toISOString(),
            // }
        ],
        queryOptions: {
            enabled: !!user?.employee?.id,
        },
    });

    const assignments = assignmentsQuery.data?.data || [];
    const shifts = shiftsQuery.data?.data || [];
    const shiftTypes = shiftTypesQuery.data?.data || [];
    const attendanceRecords = attendanceQuery.data?.data || [];

    console.log("Debug Attendance:", {
        userEmployeeId: user?.employee?.id,
        attendanceRecords,
        attendanceError: attendanceQuery.error,
        isLoading: attendanceQuery.isLoading,
        selectedAssignmentId
    });

    // Helper to get shift data safely
    const getShift = (a: any) => {
        let shift: any = a.shift;

        if (!shift) {
            if (typeof a.shift_id === 'object' && a.shift_id !== null) {
                shift = a.shift_id;
            } else {
                shift = shifts.find((s: any) => s.id === a.shift_id);
            }
        }

        if (!shift) return null;

        if (!shift.shift_type || typeof shift.shift_type !== 'object') {
            const fullShift = shifts.find((s: any) => s.id === shift.id);
            if (fullShift?.shift_type && typeof fullShift.shift_type === 'object') {
                shift = { ...shift, shift_type: fullShift.shift_type };
            } else {
                const shiftTypeId = shift.shift_type_id || shift.shift_type;
                if (shiftTypeId && typeof shiftTypeId === 'string') {
                    const foundShiftType = shiftTypes.find((st: any) => st.id === shiftTypeId);
                    if (foundShiftType) {
                        shift = { ...shift, shift_type: foundShiftType };
                    }
                }
            }
        }

        return {
            ...shift,
            date: shift.date || shift.shift_date,
            start_time: shift.start_time || shift.start_at,
            end_time: shift.end_time || shift.end_at,
            shift_type: shift.shift_type || (shift.shift_type_id ? { name: "Ca làm việc" } : null)
        };
    };

    // Filter assignments for today
    const todayAssignments = assignments.filter((a: any) => {
        const shift = getShift(a);
        if (!shift?.date) return false;
        return dayjs(shift.date).isSame(dayjs(), 'day');
    });

    // Auto-select first assignment if only one exists
    useEffect(() => {
        if (todayAssignments.length === 1 && !selectedAssignmentId) {
            setSelectedAssignmentId(todayAssignments[0].id);
        }
    }, [todayAssignments, selectedAssignmentId]);

    // Update status based on selected assignment and attendance records
    useEffect(() => {
        if (selectedAssignmentId) {
            const record = attendanceRecords.find((r: any) => r.schedule_assignment_id === selectedAssignmentId);
            if (record) {
                if (record.clock_in && !record.clock_out) {
                    setCurrentStatus("checked-in");
                    setLastAction({ time: record.clock_in, type: "check-in" });
                } else if (record.clock_out) {
                    setCurrentStatus("checked-out");
                    setLastAction({ time: record.clock_out, type: "check-out" });
                }
            } else {
                setCurrentStatus("checked-out");
                setLastAction(null);
            }
        }
    }, [selectedAssignmentId, attendanceRecords]);

    const handleCheckIn = async () => {
        if (!selectedAssignmentId) {
            message.error("Vui lòng chọn ca làm việc để chấm công vào");
            return;
        }

        setLoading(true);
        checkIn(
            {
                url: "/attendance/check-in",
                method: "post",
                values: {
                    assignment_id: selectedAssignmentId,
                    location: "Văn phòng",
                },
            },
            {
                onSuccess: () => {
                    message.success("Chấm công vào thành công!");
                    setCurrentStatus("checked-in");
                    setLastAction({ time: new Date().toISOString(), type: "check-in" });
                    setLoading(false);
                    attendanceQuery.refetch(); // Refresh records
                },
                onError: (error: any) => {
                    console.log("Check-in error:", error);
                    const errorCode = error?.response?.data?.error?.code || error?.code;
                    if (errorCode === "ALREADY_CHECKED_IN") {
                        message.warning("Bạn đã chấm công vào cho ca làm việc này rồi.");
                        setCurrentStatus("checked-in"); // Optimistically update status
                        attendanceQuery.refetch();
                    } else {
                        message.error(error?.message || "Chấm công vào thất bại");
                    }
                    setLoading(false);
                },
            }
        );
    };

    const handleCheckOut = async () => {
        if (!selectedAssignmentId) {
            message.error("Vui lòng chọn ca làm việc để chấm công ra");
            return;
        }

        setLoading(true);
        checkOut(
            {
                url: "/attendance/check-out",
                method: "post",
                values: {
                    assignment_id: selectedAssignmentId,
                },
            },
            {
                onSuccess: () => {
                    message.success("Chấm công ra thành công!");
                    setCurrentStatus("checked-out");
                    setLastAction({ time: new Date().toISOString(), type: "check-out" });
                    setLoading(false);
                    attendanceQuery.refetch(); // Refresh records
                },
                onError: (error: any) => {
                    message.error(error?.message || "Chấm công ra thất bại");
                    setLoading(false);
                },
            }
        );
    };

    const selectedAssignment = todayAssignments.find((a: any) => a.id === selectedAssignmentId);
    const selectedShift = selectedAssignment ? getShift(selectedAssignment) : null;

    return (
        <Card className="p-8">
            <div className="text-center space-y-6">
                {/* Status Badge */}
                <div className="flex justify-center">
                    {currentStatus === "checked-in" ? (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-full">
                            <CheckCircle2 size={20} />
                            <span className="font-semibold">Đã chấm công vào</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full">
                            <XCircle size={20} />
                            <span className="font-semibold">Chưa chấm công vào</span>
                        </div>
                    )}
                </div>

                {/* Current Time */}
                <div className="text-center">
                    <div className="text-6xl font-bold text-gray-800">
                        {dayjs().format("HH:mm:ss")}
                    </div>
                    <div className="text-gray-500 mt-2">
                        {dayjs().format("dddd, DD MMMM YYYY")}
                    </div>
                </div>

                {/* Shift Selection */}
                <div className="max-w-md mx-auto">
                    <p className="text-sm text-gray-600 mb-2 text-left">Chọn ca làm việc:</p>
                    <Select
                        className="w-full"
                        placeholder="Chọn ca làm việc hôm nay"
                        value={selectedAssignmentId}
                        onChange={setSelectedAssignmentId}
                        loading={assignmentsQuery.isLoading}
                        options={todayAssignments.map((a: any) => {
                            const shift = getShift(a);
                            const shiftName = shift?.shift_type?.name || "Ca làm việc";
                            const time = shift ? `${dayjs(shift.start_time).format("HH:mm")} - ${dayjs(shift.end_time).format("HH:mm")}` : "";
                            return {
                                label: `${shiftName} (${time})`,
                                value: a.id
                            };
                        })}
                    />
                    {todayAssignments.length === 0 && !assignmentsQuery.isLoading && (
                        <p className="text-red-500 text-sm mt-1">Hôm nay bạn không có ca làm việc nào.</p>
                    )}
                </div>

                {/* Last Action Info */}
                {lastAction && (
                    <div className="text-sm text-gray-600">
                        <p>
                            {lastAction.type === "check-in" ? "Chấm công vào" : "Chấm công ra"} lúc:{" "}
                            {dayjs(lastAction.time).format("HH:mm:ss")}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mt-8">
                    {currentStatus === "checked-out" ? (
                        <Button
                            size="large"
                            type="primary"
                            onClick={handleCheckIn}
                            loading={loading}
                            disabled={!selectedAssignmentId}
                            className="min-w-[200px] h-14 text-lg bg-green-600 hover:bg-green-700"
                            icon={<Clock size={20} />}
                        >
                            Chấm công vào
                        </Button>
                    ) : (
                        <Button
                            size="large"
                            danger
                            onClick={handleCheckOut}
                            loading={loading}
                            disabled={!selectedAssignmentId}
                            className="min-w-[200px] h-14 text-lg"
                            icon={<Clock size={20} />}
                        >
                            Chấm công ra
                        </Button>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <MapPin size={24} className="mx-auto text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">Vị trí</p>
                        <p className="font-semibold">Văn phòng</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <Calendar size={24} className="mx-auto text-purple-600 mb-2" />
                        <p className="text-sm text-gray-600">Ca làm việc</p>
                        <p className="font-semibold">
                            {selectedShift?.shift_type?.name || "Chưa chọn ca"}
                        </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <Clock size={24} className="mx-auto text-orange-600 mb-2" />
                        <p className="text-sm text-gray-600">Giờ làm</p>
                        <p className="font-semibold">
                            {selectedShift
                                ? `${dayjs(selectedShift.start_time).format("HH:mm")} - ${dayjs(selectedShift.end_time).format("HH:mm")}`
                                : "--:-- - --:--"}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
