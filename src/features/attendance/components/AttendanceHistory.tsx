"use client";

import { Table, Badge, Card, Row, Col, Statistic } from "antd";
import { useCustom } from "@refinedev/core";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useMemo } from "react";

interface AttendanceShift {
    id: string;
    created_at: string;
    clock_in: string | null;
    clock_out: string | null;
    worked_minutes: number | null;
    late_minutes: number | null;
    early_leave_minutes: number | null;
    status: "present" | "absent" | "partial";
}

export function AttendanceHistory() {
    // ✅ Use custom endpoint - backend handles current user automatically
    const { query } = useCustom<{ data: AttendanceShift[] }>({
        url: "/attendance/my-attendance",
        method: "get",
    });

    const attendanceData = useMemo(
        () => query?.data?.data?.data || [],
        [query]
    );

    // Calculate statistics
    const stats = useMemo(() => {
        const total = attendanceData.length;
        const present = attendanceData.filter((a) => a.status === "present").length;
        const absent = attendanceData.filter((a) => a.status === "absent").length;
        const partial = attendanceData.filter((a) => a.status === "partial").length;
        const totalLate = attendanceData.reduce((sum, a) => sum + (a.late_minutes || 0), 0);
        const totalWorked = attendanceData.reduce((sum, a) => sum + (a.worked_minutes || 0), 0);

        return { total, present, absent, partial, totalLate, totalWorked: Math.floor(totalWorked / 60) };
    }, [attendanceData]);

    const columns = [
        {
            title: "Ngày",
            dataIndex: "created_at",
            key: "date",
            width: 150,
            render: (date: string) => (
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{format(new Date(date), "dd/MM/yyyy", { locale: vi })}</span>
                </div>
            ),
        },
        {
            title: "Check In",
            dataIndex: "clock_in",
            key: "clock_in",
            width: 130,
            render: (time: string | null) =>
                time ? (
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-green-600" />
                        <span>{format(new Date(time), "HH:mm:ss")}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                ),
        },
        {
            title: "Check Out",
            dataIndex: "clock_out",
            key: "clock_out",
            width: 130,
            render: (time: string | null) =>
                time ? (
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-red-600" />
                        <span>{format(new Date(time), "HH:mm:ss")}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                ),
        },
        {
            title: "Giờ làm",
            dataIndex: "worked_minutes",
            key: "worked_minutes",
            width: 120,
            render: (minutes: number | null) =>
                minutes ? (
                    <span className="font-semibold text-blue-600">
                        {Math.floor(minutes / 60)}h {minutes % 60}m
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                ),
        },
        {
            title: "Đi muộn",
            dataIndex: "late_minutes",
            key: "late_minutes",
            width: 120,
            render: (minutes: number | null) =>
                minutes && minutes > 0 ? (
                    <Badge status="error" text={`${minutes} phút`} />
                ) : (
                    <Badge status="success" text="Đúng giờ" />
                ),
        },
        {
            title: "Về sớm",
            dataIndex: "early_leave_minutes",
            key: "early_leave_minutes",
            width: 120,
            render: (minutes: number | null) =>
                minutes && minutes > 0 ? (
                    <Badge status="warning" text={`${minutes} phút`} />
                ) : (
                    <Badge status="success" text="Đúng giờ" />
                ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (status: string) => {
                const statusMap: Record<string, { label: string; status: any }> = {
                    present: { label: "Có mặt", status: "success" },
                    absent: { label: "Vắng", status: "error" },
                    partial: { label: "Một phần", status: "warning" },
                };
                const config = statusMap[status] || statusMap.present;
                return <Badge status={config.status} text={config.label} />;
            },
        },
    ];

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={12} md={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Tổng số ngày</span>}
                            value={stats.total}
                            prefix={<Calendar className="w-5 h-5 text-blue-500" />}
                            valueStyle={{ color: "#1890ff", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Có mặt</span>}
                            value={stats.present}
                            prefix={<CheckCircle className="w-5 h-5 text-green-500" />}
                            valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Tổng giờ làm</span>}
                            value={stats.totalWorked}
                            suffix="giờ"
                            prefix={<Clock className="w-5 h-5 text-purple-500" />}
                            valueStyle={{ color: "#722ed1", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">Tổng đi muộn</span>}
                            value={stats.totalLate}
                            suffix="phút"
                            prefix={<AlertCircle className="w-5 h-5 text-orange-500" />}
                            valueStyle={{ color: "#fa8c16", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <div className="bg-white rounded-lg shadow">
                <Table
                    columns={columns}
                    dataSource={attendanceData}
                    loading={query.isLoading}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} bản ghi`,
                    }}
                />
            </div>
        </div>
    );
}
