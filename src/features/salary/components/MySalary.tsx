"use client";

import { useTable } from "@refinedev/antd";
import { useCreate, useGetIdentity } from "@refinedev/core";
import { useRouter } from "next/navigation";
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Row,
    Col,
    Statistic,
    Select,
    Drawer,
    Descriptions,
    Divider,
    App,
    Modal,
    Form,
    Input,
    InputNumber,
} from "antd";
import {
    DollarOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    SendOutlined,
    FileDoneOutlined,
} from "@ant-design/icons";
import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { MonthlyPayroll } from "@/features/salary/types";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";

const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return "0";
    const rounded = Math.round(value);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const MySalary = () => {
    const { message } = App.useApp();
    const { data: identity } = useGetIdentity<{ id: string }>();
    const router = useRouter();

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [currentPayroll, setCurrentPayroll] = useState<MonthlyPayroll | null>(null);
    const [requestForm] = Form.useForm();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewingPayroll, setViewingPayroll] = useState<MonthlyPayroll | null>(null);

    const { mutate: createRequest } = useCreate();

    const { tableProps } = useTable<MonthlyPayroll>({
        resource: "monthly-payrolls",
        syncWithLocation: false,
        pagination: { pageSize: 20 },
        sorters: {
            initial: [{ field: "month", order: "desc" }],
        },
        filters: {
            permanent: [
                {
                    field: "month",
                    operator: "eq",
                    value: selectedMonth,
                },
                // Backend should handle filtering by user if not admin, but we can also filter here if needed.
                // Assuming backend RBAC handles "only see own payroll" for standard users.
            ],
        },
    });

    const payrolls = useMemo(() => tableProps.dataSource || [], [tableProps.dataSource]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = payrolls.length;
        const totalGross = payrolls.reduce((sum, p) => {
            const value = parseFloat(p.gross_salary as any) || 0;
            return sum + value;
        }, 0);
        const totalNet = payrolls.reduce((sum, p) => {
            const value = parseFloat(p.net_salary as any) || 0;
            return sum + value;
        }, 0);
        const totalDeductions = payrolls.reduce((sum, p) => {
            const ded = parseFloat(p.deductions as any) || 0;
            const pen = parseFloat(p.penalties as any) || 0;
            return sum + ded + pen;
        }, 0);

        return { total, totalGross, totalNet, totalDeductions };
    }, [payrolls]);

    // Generate month options for last 12 months
    const monthOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = date.toISOString().slice(0, 7);
            const label = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
            options.push({ value, label });
        }
        return options;
    }, []);

    const getStatusTag = (status: string) => {
        const statusMap = {
            draft: { color: "default", icon: <FileTextOutlined />, text: "Nháp" },
            pending_approval: {
                color: "gold",
                icon: <ClockCircleOutlined />,
                text: "Chờ duyệt",
            },
            approved: {
                color: "green",
                icon: <CheckCircleOutlined />,
                text: "Đã duyệt",
            },
            paid: { color: "blue", icon: <DollarOutlined />, text: "Đã thanh toán" },
        };
        const config =
            statusMap[status as keyof typeof statusMap] || statusMap.draft;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const handleView = (record: MonthlyPayroll) => {
        setViewingPayroll(record);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setViewingPayroll(null);
    };

    const handleRequestEdit = (record: MonthlyPayroll) => {
        setCurrentPayroll(record);
        setRequestModalOpen(true);
        requestForm.resetFields();
    };

    const handleSubmitRequest = async () => {
        try {
            const values = await requestForm.validateFields();

            const employeeId = typeof currentPayroll?.employee_id === "object"
                ? (currentPayroll?.employee_id as any).id
                : currentPayroll?.employee_id;

            createRequest(
                {
                    resource: "salary-requests",
                    values: {
                        employee_id: employeeId,
                        type: "adjustment",
                        payroll_id: currentPayroll?.id,
                        adjustment_amount: values.adjustment_amount,
                        reason: values.reason,
                        request_date: new Date(),
                        status: "pending",
                    },
                },
                {
                    onSuccess: () => {
                        message.success("Yêu cầu chỉnh sửa đã được gửi thành công");
                        setRequestModalOpen(false);
                        setCurrentPayroll(null);
                        requestForm.resetFields();
                    },
                    onError: (error: any) => {
                        const errorMsg = error?.response?.data?.error?.message || "Gửi yêu cầu thất bại, vui lòng thử lại";
                        message.error(errorMsg);
                    },
                }
            );
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const getActionItems = (record: MonthlyPayroll): ActionItem[] => {
        const items: ActionItem[] = [
            {
                key: "view",
                label: "Xem chi tiết",
                icon: <EyeOutlined />,
                onClick: () => handleView(record),
            },
            {
                key: "payslip",
                label: "Xem phiếu lương",
                icon: <FileDoneOutlined />,
                onClick: () => router.push(`/payslip/${record.id}`),
            },
        ];

        // Employees can request edit if not paid? Or always?
        // Usually only if not paid or if there is an issue.
        items.push({
            key: "request",
            label: "Báo cáo sai sót",
            icon: <SendOutlined />,
            onClick: () => handleRequestEdit(record),
        });

        return items;
    };

    const columns: any[] = [
        {
            title: "Tháng",
            dataIndex: "month",
            key: "month",
            width: 120,
            render: (value: string) => {
                const date = new Date(value + "-01");
                return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
            },
        },
        {
            title: "Lương cơ bản",
            dataIndex: "base_salary",
            key: "base_salary",
            width: 130,
            align: "right" as const,
            render: (value: number) => (
                <span className="text-gray-700 whitespace-nowrap">{formatCurrency(value)}</span>
            ),
        },
        {
            title: "Phụ cấp & Thưởng",
            key: "allowances_bonuses",
            width: 130,
            align: "right" as const,
            render: (_: any, record: MonthlyPayroll) => {
                const allowances = parseFloat(record.allowances as any) || 0;
                const bonuses = parseFloat(record.bonuses as any) || 0;
                const total = Math.round(allowances + bonuses);
                return <span className="text-green-600 whitespace-nowrap">+{formatCurrency(total)}</span>;
            },
        },
        {
            title: "Trừ & Phạt",
            key: "deductions_penalties",
            width: 110,
            align: "right" as const,
            render: (_: any, record: MonthlyPayroll) => {
                const deductions = parseFloat(record.deductions as any) || 0;
                const penalties = parseFloat(record.penalties as any) || 0;
                const total = Math.round(deductions + penalties);
                return <span className="text-red-600 whitespace-nowrap">-{formatCurrency(total)}</span>;
            },
        },
        {
            title: "Tổng lương",
            dataIndex: "gross_salary",
            key: "gross_salary",
            width: 130,
            align: "right" as const,
            render: (value: number) => (
                <span className="font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: "Thực lãnh",
            dataIndex: "net_salary",
            key: "net_salary",
            width: 140,
            align: "right" as const,
            render: (value: number) => (
                <span className="font-bold text-green-600 whitespace-nowrap">{formatCurrency(value)}</span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 100,
            fixed: "right" as const,
            render: (_: any, record: MonthlyPayroll) => (
                <ActionPopover actions={getActionItems(record)} />
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Lương của tôi
                    </h1>
                    <p className="text-gray-500 mt-1">Xem lịch sử lương và phiếu lương chi tiết</p>
                </div>
                <Space>
                    <Select
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        options={monthOptions}
                        style={{ width: 200 }}
                    />
                </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={12} md={8}>
                    <Card size="small" className="shadow-sm">
                        <Statistic
                            title="Tổng lương (Tháng này)"
                            value={stats.totalGross}
                            formatter={(value) => formatCurrency(Number(value))}
                            valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={8}>
                    <Card size="small" className="shadow-sm">
                        <Statistic
                            title="Thực lãnh (Tháng này)"
                            value={stats.totalNet}
                            formatter={(value) => formatCurrency(Number(value))}
                            valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={8}>
                    <Card size="small" className="shadow-sm">
                        <Statistic
                            title="Khấu trừ (Tháng này)"
                            value={stats.totalDeductions}
                            formatter={(value) => formatCurrency(Number(value))}
                            valueStyle={{ color: "#ff4d4f", fontSize: "18px" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Payroll Table */}
            <div className="bg-white rounded-lg shadow">
                <Table
                    {...tableProps}
                    dataSource={payrolls}
                    columns={columns}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                    pagination={{
                        ...tableProps.pagination,
                        total: payrolls.length,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} phiếu lương`,
                    }}
                />
            </div>

            {/* Payroll Detail Drawer */}
            <Drawer
                open={drawerOpen}
                title={
                    <div className="flex items-center gap-2">
                        <FileTextOutlined />
                        <span className="text-base md:text-lg">Chi tiết phiếu lương</span>
                    </div>
                }
                width={700}
                onClose={handleCloseDrawer}
                styles={{ body: { paddingTop: 16 } }}
            >
                {viewingPayroll && (
                    <div className="space-y-4">
                        <Descriptions column={1} bordered size="small" className="text-sm">
                            <Descriptions.Item label="Tháng">
                                {new Date(viewingPayroll.month + "-01").toLocaleDateString(
                                    "vi-VN",
                                    {
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {getStatusTag(viewingPayroll.status)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" className="text-sm md:text-base my-3">Chi tiết lương</Divider>

                        <Descriptions column={1} bordered size="small" className="text-sm">
                            <Descriptions.Item label="Lương cơ bản">
                                <span className="font-semibold">
                                    {formatCurrency(Number(viewingPayroll.base_salary))} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phụ cấp">
                                <span className="text-green-600">
                                    +{formatCurrency(Number(viewingPayroll.allowances || 0))} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thưởng">
                                <span className="text-green-600">
                                    +{formatCurrency(Number(viewingPayroll.bonuses || 0))} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Lương làm thêm">
                                <span className="text-green-600">
                                    +{formatCurrency(Number(viewingPayroll.overtime_pay || 0))} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khấu trừ">
                                <span className="text-red-600">
                                    -{formatCurrency(Number(viewingPayroll.deductions || 0))} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phạt">
                                <span className="text-red-600">
                                    -{formatCurrency(Number(viewingPayroll.penalties || 0))} VNĐ
                                </span>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider className="my-3" />

                        <Descriptions column={1} bordered size="middle" className="text-sm md:text-base">
                            <Descriptions.Item label="Tổng lương">
                                <span className="font-semibold text-base">
                                    {formatCurrency(Number(viewingPayroll.gross_salary || 0))} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thực lãnh">
                                <span className="font-bold text-lg text-green-600">
                                    {formatCurrency(Number(viewingPayroll.net_salary))} VNĐ
                                </span>
                            </Descriptions.Item>
                        </Descriptions>

                        {viewingPayroll.notes && (
                            <>
                                <Divider orientation="left" className="text-sm md:text-base my-3">Ghi chú</Divider>
                                <div className="p-3 bg-gray-50 rounded text-xs md:text-sm">
                                    {viewingPayroll.notes}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Drawer>

            {/* Request Edit Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <SendOutlined />
                        <span className="text-base md:text-lg">Báo cáo sai sót / Yêu cầu chỉnh sửa</span>
                    </div>
                }
                open={requestModalOpen}
                onCancel={() => {
                    setRequestModalOpen(false);
                    setCurrentPayroll(null);
                    requestForm.resetFields();
                }}
                onOk={handleSubmitRequest}
                okText="Gửi yêu cầu"
                cancelText="Hủy"
                width={500}
                centered
            >
                <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-xs md:text-sm text-blue-800">
                        <strong>Tháng:</strong> {currentPayroll?.month}
                    </p>
                </div>
                <Form form={requestForm} layout="vertical">
                    <Form.Item
                        name="adjustment_amount"
                        label="Số tiền chênh lệch (nếu có)"
                        help="Nhập số tiền bạn cho là đúng hoặc chênh lệch"
                    >
                        <InputNumber
                            className="w-full"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            parser={(value) => value!.replace(/\./g, "")}
                        />
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label="Nội dung chi tiết"
                        rules={[
                            { required: true, message: "Vui lòng nhập nội dung" },
                        ]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập chi tiết sai sót (ví dụ: Thiếu 2 ngày công, chưa cộng thưởng dự án X...)"
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
