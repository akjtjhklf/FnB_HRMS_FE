"use client";

import { useTable } from "@refinedev/antd";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Input,
    Select,
    Modal,
    Form,
    App,
    Descriptions,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    FieldTimeOutlined,
} from "@ant-design/icons";
import { useState, useMemo, useCallback, useEffect } from "react";
// @ts-ignore
import debounce from "lodash/debounce";
import { formatDate } from "@/lib/utils";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";

interface AttendanceShift {
    id: string;
    employee_id?: any;
    clock_in?: string | null;
    clock_out?: string | null;
    date?: string | null;
}

interface AttendanceAdjustment {
    id: string;
    attendance_shift_id: string | AttendanceShift;
    requested_by?: any;
    requested_at?: string | null;
    old_value?: { clock_in?: string | null; clock_out?: string | null } | null;
    proposed_value?: { clock_in?: string | null; clock_out?: string | null } | null;
    approved_by?: string | null;
    approved_at?: string | null;
    status: "pending" | "approved" | "rejected";
    reason?: string | null;
    created_at?: string | null;
}

const formatTime = (timeString?: string | null) => {
    if (!timeString) return "--:--";
    try {
        const date = new Date(timeString);
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
        return timeString;
    }
};

// Helper to get old clock times - uses old_value or falls back to attendance_shift
const getOldClockTimes = (record: AttendanceAdjustment) => {
    // First try old_value
    if (record.old_value?.clock_in || record.old_value?.clock_out) {
        return {
            clock_in: record.old_value.clock_in,
            clock_out: record.old_value.clock_out,
        };
    }

    // Fallback to attendance_shift data
    if (typeof record.attendance_shift_id === "object" && record.attendance_shift_id) {
        return {
            clock_in: record.attendance_shift_id.clock_in,
            clock_out: record.attendance_shift_id.clock_out,
        };
    }

    return { clock_in: null, clock_out: null };
};

export const AttendanceAdjustmentRequests = () => {
    const { message } = App.useApp();
    const { data: identity } = useGetIdentity<{ id: string; full_name: string }>();

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AttendanceAdjustment | null>(null);
    const [actionForm] = Form.useForm();

    const { mutate: approveRequest, mutation: approveMutation } = useCustomMutation();
    const { mutate: rejectRequest, mutation: rejectMutation } = useCustomMutation();
    const isApproving = approveMutation?.isPending;
    const isRejecting = rejectMutation?.isPending;

    const { tableProps, tableQuery: tableQueryResult, setFilters } = useTable<AttendanceAdjustment>({
        resource: "attendance-adjustments",
        syncWithLocation: false,
        pagination: { pageSize: 20, mode: "server" },
        sorters: {
            initial: [{ field: "created_at", order: "desc" }],
        },
        meta: {
            join: ["requested_by"],
        },
    });

    // Debounced search function
    const debouncedSearch = useMemo(
        () =>
            debounce((searchValue: string, statusValue: string | undefined) => {
                const filters: any[] = [];

                if (searchValue) {
                    filters.push({
                        field: "search",
                        operator: "contains",
                        value: searchValue,
                    });
                }

                if (statusValue) {
                    filters.push({
                        field: "status",
                        operator: "eq",
                        value: statusValue,
                    });
                }

                setFilters(filters);
            }, 500),
        [setFilters]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // Handle search input change
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchText(value);
            debouncedSearch(value, statusFilter);
        },
        [debouncedSearch, statusFilter]
    );

    // Handle status filter change
    const handleStatusChange = useCallback(
        (value: string | undefined) => {
            setStatusFilter(value);
            debouncedSearch(searchText, value);
        },
        [debouncedSearch, searchText]
    );

    const getEmployeeName = (employee: any) => {
        if (!employee) return "Nhân viên";
        if (typeof employee === "object") {
            return employee.full_name || employee.name || employee.employee_code || "Nhân viên";
        }
        return "Nhân viên";
    };

    const getStatusTag = (status: string) => {
        const statusMap = {
            pending: { color: "gold", icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
            approved: { color: "green", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
            rejected: { color: "red", icon: <CloseCircleOutlined />, text: "Từ chối" },
        };
        const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const handleApprove = (record: AttendanceAdjustment) => {
        setSelectedRequest(record);
        setApproveModalOpen(true);
        actionForm.resetFields();
    };

    const handleReject = (record: AttendanceAdjustment) => {
        setSelectedRequest(record);
        setRejectModalOpen(true);
        actionForm.resetFields();
    };

    const onApprove = async () => {
        try {
            if (!selectedRequest) return;

            approveRequest({
                url: `attendance-adjustments/${selectedRequest.id}/approve`,
                method: "patch",
                values: {},
                successNotification: () => ({
                    message: "Đã duyệt yêu cầu chỉnh sửa chấm công",
                    type: "success",
                }),
                errorNotification: (error) => ({
                    message: "Lỗi duyệt yêu cầu",
                    description: error?.response?.data?.message || "Vui lòng thử lại",
                    type: "error",
                }),
            }, {
                onSuccess: () => {
                    setApproveModalOpen(false);
                    setSelectedRequest(null);
                    tableQueryResult?.refetch?.();
                }
            });
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const onReject = async () => {
        try {
            if (!selectedRequest) return;

            rejectRequest({
                url: `attendance-adjustments/${selectedRequest.id}/reject`,
                method: "patch",
                values: {},
                successNotification: () => ({
                    message: "Đã từ chối yêu cầu",
                    type: "success",
                }),
                errorNotification: (error) => ({
                    message: "Lỗi từ chối yêu cầu",
                    description: error?.response?.data?.message || "Vui lòng thử lại",
                    type: "error",
                }),
            }, {
                onSuccess: () => {
                    setRejectModalOpen(false);
                    setSelectedRequest(null);
                    tableQueryResult?.refetch?.();
                }
            });
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getActionItems = (record: AttendanceAdjustment): ActionItem[] => {
        const items: ActionItem[] = [];

        if (record.status === "pending") {
            items.push({
                key: "approve",
                label: "Duyệt",
                icon: <CheckCircleOutlined className="text-green-600" />,
                onClick: () => handleApprove(record),
            });
            items.push({
                key: "reject",
                label: "Từ chối",
                icon: <CloseCircleOutlined className="text-red-600" />,
                onClick: () => handleReject(record),
            });
        }

        return items;
    };

    const columns: any[] = [
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            width: 150,
            render: (value: string) => formatDate(value),
            sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: "Nhân viên",
            dataIndex: "requested_by",
            key: "employee",
            width: 180,
            render: (employee: any) => <span className="font-semibold">{getEmployeeName(employee)}</span>,
        },
        {
            title: "Giờ cũ",
            key: "old_value",
            width: 150,
            render: (_: any, record: AttendanceAdjustment) => {
                const oldTimes = getOldClockTimes(record);
                const oldIn = formatTime(oldTimes.clock_in);
                const oldOut = formatTime(oldTimes.clock_out);
                return (
                    <div className="text-sm text-gray-700">
                        <div>Vào: {oldIn}</div>
                        <div>Ra: {oldOut}</div>
                    </div>
                );
            },
        },
        {
            title: "Giờ đề xuất",
            key: "proposed_value",
            width: 150,
            render: (_: any, record: AttendanceAdjustment) => {
                const newIn = formatTime(record.proposed_value?.clock_in);
                const newOut = formatTime(record.proposed_value?.clock_out);
                return (
                    <div className="text-sm font-semibold text-blue-600">
                        <div>Vào: {newIn}</div>
                        <div>Ra: {newOut}</div>
                    </div>
                );
            },
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true,
            render: (value: string) => value || "-",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (value: string) => getStatusTag(value),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 100,
            fixed: "right" as const,
            render: (_: any, record: AttendanceAdjustment) => (
                <ActionPopover actions={getActionItems(record)} />
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FieldTimeOutlined className="text-cyan-600" />
                        Yêu cầu chỉnh sửa chấm công
                    </h2>
                    <p className="text-gray-500 mt-1">Quản lý các yêu cầu điều chỉnh giờ vào/ra</p>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => tableQueryResult?.refetch?.()}
                        loading={tableQueryResult?.isFetching}
                    >
                        Làm mới
                    </Button>
                    <Input
                        placeholder="Tìm nhân viên..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearchChange}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        value={statusFilter}
                        onChange={handleStatusChange}
                        style={{ width: 150 }}
                        options={[
                            { label: "Chờ duyệt", value: "pending" },
                            { label: "Đã duyệt", value: "approved" },
                            { label: "Từ chối", value: "rejected" },
                        ]}
                    />
                </Space>
            </div>

            <div className="bg-white rounded-lg shadow">
                <Table
                    {...tableProps}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        ...tableProps.pagination,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
                    }}
                />
            </div>

            {/* Approve Modal */}
            <Modal
                title="Duyệt yêu cầu chỉnh sửa chấm công"
                open={approveModalOpen}
                onCancel={() => setApproveModalOpen(false)}
                onOk={onApprove}
                okText="Duyệt"
                cancelText="Hủy"
                confirmLoading={isApproving}
                okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <p>
                            Bạn có chắc chắn muốn duyệt yêu cầu này của nhân viên{" "}
                            <strong>{getEmployeeName(selectedRequest.requested_by)}</strong>?
                        </p>
                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Giờ cũ">
                                {(() => {
                                    const oldTimes = getOldClockTimes(selectedRequest);
                                    return `${formatTime(oldTimes.clock_in)} - ${formatTime(oldTimes.clock_out)}`;
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ đề xuất">
                                <span className="font-semibold text-blue-600">
                                    {formatTime(selectedRequest.proposed_value?.clock_in)} - {formatTime(selectedRequest.proposed_value?.clock_out)}
                                </span>
                            </Descriptions.Item>
                            {selectedRequest.reason && (
                                <Descriptions.Item label="Lý do">
                                    {selectedRequest.reason}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                        <p className="text-green-600 font-medium">
                            Sau khi duyệt, thời gian chấm công sẽ được cập nhật theo giờ đề xuất.
                        </p>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối yêu cầu"
                open={rejectModalOpen}
                onCancel={() => setRejectModalOpen(false)}
                onOk={onReject}
                okText="Từ chối"
                okButtonProps={{ danger: true }}
                cancelText="Hủy"
                confirmLoading={isRejecting}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <p>
                            Bạn có chắc chắn muốn từ chối yêu cầu của nhân viên{" "}
                            <strong>{getEmployeeName(selectedRequest.requested_by)}</strong>?
                        </p>
                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="Giờ cũ">
                                {(() => {
                                    const oldTimes = getOldClockTimes(selectedRequest);
                                    return `${formatTime(oldTimes.clock_in)} - ${formatTime(oldTimes.clock_out)}`;
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ đề xuất">
                                {formatTime(selectedRequest.proposed_value?.clock_in)} - {formatTime(selectedRequest.proposed_value?.clock_out)}
                            </Descriptions.Item>
                            {selectedRequest.reason && (
                                <Descriptions.Item label="Lý do">
                                    {selectedRequest.reason}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};
