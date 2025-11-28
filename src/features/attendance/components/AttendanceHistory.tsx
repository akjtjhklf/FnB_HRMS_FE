"use client";

import { Table, Badge, Card, Row, Col, Statistic, Button, Radio, DatePicker, Modal, Form, Input, TimePicker, App } from "antd";
import { useTable } from "@refinedev/antd";
import { useCustomMutation } from "@refinedev/core";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { EmployeeAttendanceCalendar } from "./EmployeeAttendanceCalendar";

interface AttendanceShift {
    id: string;
    created_at: string;
    clock_in: string | null;
    clock_out: string | null;
    worked_minutes: number | null;
    late_minutes: number | null;
    early_leave_minutes: number | null;
    status: "present" | "absent" | "partial";
    notes?: string | null;
    shift_id?: string;
}

export function AttendanceHistory() {
    const [month, setMonth] = useState(dayjs());
    const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

    const { tableProps, tableQuery } = useTable<AttendanceShift>({
        resource: "attendance/my-attendance",
        syncWithLocation: false,
        filters: {
            permanent: [
                {
                    field: "start_date",
                    operator: "eq",
                    value: month.startOf('month').toISOString(),
                },
                {
                    field: "end_date",
                    operator: "eq",
                    value: month.endOf('month').toISOString(),
                },
            ],
        },
        pagination: {
            mode: "client",
        },
    });

    const attendanceData = tableProps.dataSource || [];

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

    // Request Adjustment state
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceShift | null>(null);
    const [form] = Form.useForm();
    const { mutate: createRequest, mutation } = useCustomMutation();
    const isSubmitting = mutation?.isLoading;
    const { message } = App.useApp();

    const handleRequestAdjustment = (record: AttendanceShift) => {
        setSelectedRecord(record);
        form.setFieldsValue({
            clock_in: record.clock_in ? dayjs(record.clock_in) : null,
            clock_out: record.clock_out ? dayjs(record.clock_out) : null,
            reason: "",
        });
        setRequestModalOpen(true);
    };

    const handleSubmitRequest = async () => {
        try {
            const values = await form.validateFields();

            createRequest(
                {
                    url: "attendance-adjustments",
                    method: "post",
                    values: {
                        attendance_shift_id: selectedRecord?.id,
                        proposed_value: {
                            clock_in: values.clock_in?.toISOString(),
                            clock_out: values.clock_out?.toISOString(),
                        },
                        reason: values.reason,
                    },
                },
                {
                    onSuccess: () => {
                        message.success("Gửi yêu cầu điều chỉnh thành công");
                        setRequestModalOpen(false);
                    },
                    onError: (error: any) => {
                        message.error(error?.message || "Có lỗi xảy ra");
                    }
                }
            );
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

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

            {/* Header Controls */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="font-medium">Tháng:</span>
                    <DatePicker
                        picker="month"
                        value={month}
                        onChange={(val) => val && setMonth(val)}
                        allowClear={false}
                        format="MM/YYYY"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <Radio.Button value="table">Bảng</Radio.Button>
                        <Radio.Button value="calendar">Lịch</Radio.Button>
                    </Radio.Group>
                    <Button
                        icon={<RefreshCcw size={16} />}
                        onClick={() => tableQuery.refetch()}
                        loading={tableQuery.isFetching}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow p-4">
                {viewMode === "table" ? (
                    <Table
                        {...tableProps}
                        columns={columns}
                        rowKey="id"
                        scroll={{ x: 1000 }}
                        pagination={{
                            ...tableProps.pagination,
                            pageSize: 15,
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} bản ghi`,
                        }}
                        onRow={(record) => ({
                            onClick: () => handleRequestAdjustment(record),
                            className: "cursor-pointer hover:bg-gray-50",
                        })}
                    />
                ) : (
                    <EmployeeAttendanceCalendar
                        records={tableProps.dataSource || []}
                        month={month}
                        onEdit={handleRequestAdjustment}
                    />
                )}
            </div>

            <Modal
                title="Yêu cầu điều chỉnh chấm công"
                open={requestModalOpen}
                onCancel={() => setRequestModalOpen(false)}
                onOk={handleSubmitRequest}
                confirmLoading={isSubmitting}
            >
                <Form form={form} layout="vertical">
                    <div className="flex gap-4">
                        <Form.Item label="Giờ vào đề xuất" name="clock_in" className="flex-1">
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                        <Form.Item label="Giờ ra đề xuất" name="clock_out" className="flex-1">
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Lý do điều chỉnh"
                        name="reason"
                        rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập lý do..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
