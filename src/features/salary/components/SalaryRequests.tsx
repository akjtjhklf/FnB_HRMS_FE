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
    Divider,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    EyeOutlined,
    ArrowUpOutlined,
    SwapOutlined,
} from "@ant-design/icons";
import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { SalaryRequest } from "@/features/salary/types";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";

const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return "0";
    const rounded = Math.round(value);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const SalaryRequests = () => {
    const { message } = App.useApp();
    const { data: identity } = useGetIdentity<{ id: string; full_name: string }>();

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SalaryRequest | null>(null);
    const [actionForm] = Form.useForm();

    const { mutate: approveRequest, isLoading: isApproving } = useCustomMutation();
    const { mutate: rejectRequest, isLoading: isRejecting } = useCustomMutation();

    const { tableProps, tableQueryResult } = useTable<SalaryRequest>({
        resource: "salary-requests",
        syncWithLocation: false,
        pagination: { pageSize: 20 },
        sorters: {
            initial: [{ field: "created_at", order: "desc" }],
        },
        filters: {
            permanent: [
                // Add any permanent filters if needed
            ],
        },
    });

    const requests = useMemo(() => tableProps.dataSource || [], [tableProps.dataSource]);

    const getEmployeeName = (employee: any) => {
        if (!employee) return "N/A";
        if (typeof employee === "object") {
            return employee.full_name || employee.employee_code || "N/A";
        }
        return "N/A";
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((r) => {
            let matches = true;

            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const empName = getEmployeeName(r.employee_id).toLowerCase();
                matches = matches && empName.includes(searchLower);
            }

            if (statusFilter) {
                matches = matches && r.status === statusFilter;
            }

            if (typeFilter) {
                matches = matches && r.type === typeFilter;
            }

            return matches;
        });
    }, [requests, searchText, statusFilter, typeFilter]);

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

    const getTypeTag = (type: string) => {
        if (type === "raise") {
            return <Tag color="blue" icon={<ArrowUpOutlined />}>Tăng lương</Tag>;
        }
        return <Tag color="orange" icon={<SwapOutlined />}>Điều chỉnh</Tag>;
    };

    const handleApprove = (record: SalaryRequest) => {
        setSelectedRequest(record);
        setApproveModalOpen(true);
        actionForm.resetFields();
    };

    const handleReject = (record: SalaryRequest) => {
        setSelectedRequest(record);
        setRejectModalOpen(true);
        actionForm.resetFields();
    };

    const onApprove = async () => {
        try {
            const values = await actionForm.validateFields();
            if (!selectedRequest) return;

            approveRequest({
                url: `salary-requests/${selectedRequest.id}/approve`,
                method: "post",
                values: {
                    approved_by: identity?.full_name || "Manager",
                    manager_note: values.manager_note,
                },
                successNotification: () => ({
                    message: "Đã duyệt yêu cầu",
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
                    tableQueryResult.refetch();
                }
            });
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const onReject = async () => {
        try {
            const values = await actionForm.validateFields();
            if (!selectedRequest) return;

            rejectRequest({
                url: `salary-requests/${selectedRequest.id}/reject`,
                method: "post",
                values: {
                    rejected_by: identity?.full_name || "Manager",
                    manager_note: values.manager_note,
                },
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
                    tableQueryResult.refetch();
                }
            });
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const getActionItems = (record: SalaryRequest): ActionItem[] => {
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
            dataIndex: "created_at", // or request_date
            key: "created_at",
            width: 150,
            render: (value: string) => formatDate(value),
            sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: "Nhân viên",
            dataIndex: "employee_id",
            key: "employee",
            width: 200,
            render: (employee: any) => <span className="font-semibold">{getEmployeeName(employee)}</span>,
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (value: string) => getTypeTag(value),
        },
        {
            title: "Chi tiết",
            key: "details",
            width: 250,
            render: (_: any, record: SalaryRequest) => {
                if (record.type === "raise") {
                    return (
                        <div className="text-sm">
                            <div>Hiện tại: {formatCurrency(record.current_rate || 0)}</div>
                            <div className="font-semibold text-green-600">
                                Đề xuất: {formatCurrency(record.proposed_rate || 0)}
                            </div>
                        </div>
                    );
                } else {
                    const amount = record.adjustment_amount || 0;
                    return (
                        <span className={amount >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                            {amount >= 0 ? "+" : ""}{formatCurrency(amount)}
                        </span>
                    );
                }
            },
        },
        {
            title: "Lý do",
            dataIndex: "reason", // or note
            key: "reason",
            ellipsis: true,
            render: (value: string, record: SalaryRequest) => value || record.note || "-",
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
            width: 80,
            fixed: "right" as const,
            render: (_: any, record: SalaryRequest) => (
                <ActionPopover actions={getActionItems(record)} />
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Yêu cầu lương
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý các yêu cầu tăng lương và điều chỉnh</p>
                </div>
                <Space>
                    <Input
                        placeholder="Tìm nhân viên..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                        options={[
                            { label: "Chờ duyệt", value: "pending" },
                            { label: "Đã duyệt", value: "approved" },
                            { label: "Từ chối", value: "rejected" },
                        ]}
                    />
                    <Select
                        placeholder="Loại"
                        allowClear
                        value={typeFilter}
                        onChange={setTypeFilter}
                        style={{ width: 150 }}
                        options={[
                            { label: "Tăng lương", value: "raise" },
                            { label: "Điều chỉnh", value: "adjustment" },
                        ]}
                    />
                </Space>
            </div>

            <div className="bg-white rounded-lg shadow">
                <Table
                    {...tableProps}
                    dataSource={filteredRequests}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        ...tableProps.pagination,
                        total: filteredRequests.length,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
                    }}
                />
            </div>

            {/* Approve Modal */}
            <Modal
                title="Duyệt yêu cầu"
                open={approveModalOpen}
                onCancel={() => setApproveModalOpen(false)}
                onOk={onApprove}
                okText="Duyệt"
                cancelText="Hủy"
                confirmLoading={isApproving}
            >
                <div className="mb-4">
                    <p>Bạn có chắc chắn muốn duyệt yêu cầu này của nhân viên <strong>{getEmployeeName(selectedRequest?.employee_id)}</strong>?</p>
                    {selectedRequest?.type === "raise" && (
                        <p className="text-green-600 mt-2">
                            Lương cơ bản sẽ được cập nhật thành: <strong>{formatCurrency(selectedRequest.proposed_rate || 0)}</strong>
                        </p>
                    )}
                    {selectedRequest?.type === "adjustment" && (
                        <p className="text-green-600 mt-2">
                            Bảng lương sẽ được điều chỉnh: <strong>{selectedRequest.adjustment_amount && selectedRequest.adjustment_amount > 0 ? "+" : ""}{formatCurrency(selectedRequest.adjustment_amount || 0)}</strong>
                        </p>
                    )}
                </div>
                <Form form={actionForm} layout="vertical">
                    <Form.Item name="manager_note" label="Ghi chú (Tùy chọn)">
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú..." />
                    </Form.Item>
                </Form>
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
                <p className="mb-4">Bạn có chắc chắn muốn từ chối yêu cầu này?</p>
                <Form form={actionForm} layout="vertical">
                    <Form.Item
                        name="manager_note"
                        label="Lý do từ chối"
                        rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập lý do..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
