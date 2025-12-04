import { useTable } from "@refinedev/antd";
import { useCustomMutation } from "@refinedev/core";
import { Table, DatePicker, Button, Drawer, Space, Avatar, Tag, Card, Modal, Form, Input, TimePicker, App } from "antd";
import { UserOutlined, EyeOutlined, CalendarOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import { useState } from "react";
import { EmployeeAttendanceCalendar } from "./EmployeeAttendanceCalendar";

export const AttendanceManagement = () => {
    const { message } = App.useApp();
    const [month, setMonth] = useState(dayjs());
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Edit state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [form] = Form.useForm();
    const { mutate: manualAdjust, mutation } = useCustomMutation();
    const isUpdating = mutation?.isPending;

    const { tableProps, tableQuery } = useTable({
        resource: "attendance/report",
        syncWithLocation: false,
        filters: {
            permanent: [
                {
                    field: "month",
                    operator: "eq",
                    value: month.month() + 1,
                },
                {
                    field: "year",
                    operator: "eq",
                    value: month.year(),
                },
            ],
        },
        pagination: {
            mode: "client",
        },
    });

    const handleRefresh = () => {
        tableQuery.refetch();
    };

    const handleViewDetail = (record: any) => {
        setSelectedEmployee(record);
        setDrawerOpen(true);
    };

    const handleEditRecord = (record: any) => {
        setEditingRecord(record);
        form.setFieldsValue({
            clock_in: record.clock_in ? dayjs(record.clock_in) : null,
            clock_out: record.clock_out ? dayjs(record.clock_out) : null,
            notes: record.notes,
        });
        setEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();

            manualAdjust(
                {
                    url: `attendance/${editingRecord.id}/manual-adjust`,
                    method: "patch",
                    values: {
                        clock_in: values.clock_in?.toISOString(),
                        clock_out: values.clock_out?.toISOString(),
                        notes: values.notes,
                    },
                },
                {
                    onSuccess: () => {
                        message.success("Cập nhật chấm công thành công");
                        setEditModalOpen(false);

                        // Update local state for immediate feedback
                        const updatedRecord = {
                            ...editingRecord,
                            clock_in: values.clock_in?.toISOString() || null,
                            clock_out: values.clock_out?.toISOString() || null,
                            notes: values.notes,
                        };

                        setSelectedEmployee((prev: any) => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                records: prev.records.map((r: any) => r.id === editingRecord.id ? { ...r, ...updatedRecord } : r)
                            };
                        });

                        // Refresh table to get recalculations from backend
                        tableQuery.refetch();
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

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: ["employee", "first_name"],
            key: "employee",
            render: (_: any, record: any) => (
                <Space>
                    <Avatar src={record.employee?.avatar} icon={<UserOutlined />} />
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {record.employee?.first_name} {record.employee?.last_name}
                        </span>
                        <span className="text-xs text-gray-500">
                            {record.employee?.department?.name || "Chưa phân ban"}
                        </span>
                    </div>
                </Space>
            ),
        },
        {
            title: "Số ngày làm",
            dataIndex: ["stats", "total_work_days"],
            key: "total_work_days",
            render: (val: number) => <span className="font-semibold">{val}</span>,
        },
        {
            title: "Tổng giờ làm",
            dataIndex: ["stats", "total_work_hours"],
            key: "total_work_hours",
            render: (val: number) => `${val}h`,
        },
        {
            title: "Tổng đi muộn",
            dataIndex: ["stats", "total_late_minutes"],
            key: "total_late_minutes",
            render: (val: number) => (
                <Tag color={val > 0 ? "warning" : "success"}>{val} phút</Tag>
            ),
        },
        {
            title: "Tổng về sớm",
            dataIndex: ["stats", "total_early_leave_minutes"],
            key: "total_early_leave_minutes",
            render: (val: number) => (
                <Tag color={val > 0 ? "warning" : "success"}>{val} phút</Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_: any, record: any) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="font-medium">Chọn tháng:</span>
                    <DatePicker
                        picker="month"
                        value={month}
                        onChange={(val) => val && setMonth(val)}
                        allowClear={false}
                        format="MM/YYYY"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-gray-500 text-sm">
                        Hiển thị báo cáo tháng {month.format("MM/YYYY")}
                    </div>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={tableQuery.isFetching}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            <Table
                {...tableProps}
                columns={columns}
                rowKey="id"
                scroll={{ x: 800 }}
                pagination={{ ...tableProps.pagination, showSizeChanger: true }}
            />

            <Drawer
                title={
                    <div className="flex items-center gap-2">
                        <CalendarOutlined />
                        <span>
                            Chi tiết chấm công - {selectedEmployee?.employee?.first_name}{" "}
                            {selectedEmployee?.employee?.last_name}
                        </span>
                    </div>
                }
                width={800}
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                styles={{ body: { padding: 0 } }}
            >
                {selectedEmployee && (
                    <div className="p-4">
                        <div className="mb-4 flex gap-4 flex-wrap">
                            <Card size="small" className="flex-1 bg-blue-50">
                                <div className="text-xs text-gray-500">Tổng ngày làm</div>
                                <div className="text-lg font-bold text-blue-600">
                                    {selectedEmployee.stats.total_work_days}
                                </div>
                            </Card>
                            <Card size="small" className="flex-1 bg-green-50">
                                <div className="text-xs text-gray-500">Tổng giờ làm</div>
                                <div className="text-lg font-bold text-green-600">
                                    {selectedEmployee.stats.total_work_hours}h
                                </div>
                            </Card>
                            <Card size="small" className="flex-1 bg-orange-50">
                                <div className="text-xs text-gray-500">Đi muộn</div>
                                <div className="text-lg font-bold text-orange-600">
                                    {selectedEmployee.stats.total_late_minutes}p
                                </div>
                            </Card>
                        </div>

                        <EmployeeAttendanceCalendar
                            records={selectedEmployee.records}
                            month={month}
                            onEdit={handleEditRecord}
                        />
                    </div>
                )}
            </Drawer>

            <Modal
                title="Điều chỉnh chấm công"
                open={editModalOpen}
                onCancel={() => setEditModalOpen(false)}
                onOk={handleUpdate}
                confirmLoading={isUpdating}
            >
                <Form form={form} layout="vertical">
                    <div className="flex gap-4">
                        <Form.Item label="Giờ vào" name="clock_in" className="flex-1">
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                        <Form.Item label="Giờ ra" name="clock_out" className="flex-1">
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                    </div>
                    <Form.Item label="Ghi chú / Lý do" name="notes">
                        <Input.TextArea rows={3} placeholder="Nhập lý do điều chỉnh..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
