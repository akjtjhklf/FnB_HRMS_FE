"use client";

import { useTable } from "@refinedev/antd";
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Input,
    Form,
    Modal,
    InputNumber,
    Select,
    Switch,
    App,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useState, useMemo, useCallback, useEffect } from "react";
// @ts-ignore
import debounce from "lodash/debounce";
import { SalaryScheme } from "@/features/salary/types";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";
import { useCreate, useUpdate, useDelete } from "@refinedev/core";

const formatCurrency = (value: number) => {
    if (!value || isNaN(value)) return "0";
    const rounded = Math.round(value);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const SalarySchemeList = () => {
    const { message } = App.useApp();
    const [searchText, setSearchText] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingScheme, setEditingScheme] = useState<SalaryScheme | null>(null);
    const [form] = Form.useForm();

    const { mutate: createScheme, mutation: createMutation } = useCreate();
    const { mutate: updateScheme, mutation: updateMutation } = useUpdate();
    const isCreating = createMutation?.isPending;
    const isUpdating = updateMutation?.isPending;
    const { mutate: deleteScheme } = useDelete();

    const { tableProps, setFilters } = useTable<SalaryScheme>({
        resource: "salary-schemes",
        syncWithLocation: false,
        pagination: { pageSize: 20, mode: "server" },
    });

    // Debounced search function
    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setFilters([
                    {
                        field: "search",
                        operator: "contains",
                        value: value || undefined,
                    },
                ]);
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
            debouncedSearch(value);
        },
        [debouncedSearch]
    );

    const handleCreate = () => {
        setEditingScheme(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (record: SalaryScheme) => {
        setEditingScheme(record);
        form.setFieldsValue(record);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: "Xóa thang lương",
            content: "Bạn có chắc chắn muốn xóa thang lương này không?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                deleteScheme(
                    {
                        resource: "salary-schemes",
                        id,
                    },
                    {
                        onSuccess: () => {
                            message.success("Xóa thang lương thành công");
                        },
                        onError: (error: any) => {
                            message.error(error?.response?.data?.message || "Xóa thất bại");
                        },
                    }
                );
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            // Transform values to correct types
            const payload = {
                ...values,
                rate: Number(values.rate),
                is_active: Boolean(values.is_active),
            };

            if (editingScheme) {
                updateScheme(
                    {
                        resource: "salary-schemes",
                        id: editingScheme.id,
                        values: payload,
                    },
                    {
                        onSuccess: () => {
                            message.success("Cập nhật thang lương thành công");
                            setModalOpen(false);
                            form.resetFields();
                        },
                    }
                );
            } else {
                createScheme(
                    {
                        resource: "salary-schemes",
                        values: payload,
                    },
                    {
                        onSuccess: () => {
                            message.success("Tạo thang lương thành công");
                            setModalOpen(false);
                            form.resetFields();
                        },
                    }
                );
            }
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const getActionItems = (record: SalaryScheme): ActionItem[] => [
        {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
        },
        {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record.id),
        },
    ];

    const columns: any[] = [
        {
            title: "Tên thang lương",
            dataIndex: "name",
            key: "name",
            render: (value: string) => <span className="font-semibold">{value}</span>,
        },
        {
            title: "Loại trả lương",
            dataIndex: "pay_type",
            key: "pay_type",
            render: (value: string) => {
                const map: any = {
                    hourly: "Theo giờ",
                    fixed_shift: "Theo ca",
                    monthly: "Theo tháng",
                };
                return <Tag color="blue">{map[value] || value}</Tag>;
            },
        },
        {
            title: "Mức lương / Đơn giá",
            dataIndex: "rate",
            key: "rate",
            align: "right" as const,
            render: (value: number) => (
                <span className="font-mono text-gray-700">{formatCurrency(value)}</span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (value: boolean) => (
                <Tag color={value ? "green" : "red"}>
                    {value ? "Hoạt động" : "Ngưng hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 80,
            fixed: "right" as const,
            render: (_: any, record: SalaryScheme) => (
                <ActionPopover actions={getActionItems(record)} />
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Thang lương
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý các mức lương và hình thức trả lương</p>
                </div>
                <Space>
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearchChange}
                        style={{ width: 250 }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        size="large"
                    >
                        Thêm mới
                    </Button>
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
                    }}
                />
            </div>

            <Modal
                title={editingScheme ? "Chỉnh sửa thang lương" : "Thêm thang lương mới"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                confirmLoading={isCreating || isUpdating}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên thang lương"
                        rules={[{ required: true, message: "Vui lòng nhập tên thang lương" }]}
                    >
                        <Input placeholder="Ví dụ: Lương cơ bản NV Phục vụ" />
                    </Form.Item>

                    <Form.Item
                        name="pay_type"
                        label="Hình thức trả lương"
                        rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
                        initialValue="monthly"
                    >
                        <Select
                            options={[
                                { label: "Theo tháng", value: "monthly" },
                                { label: "Theo giờ", value: "hourly" },
                                { label: "Theo ca", value: "fixed_shift" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="rate"
                        label="Mức lương / Đơn giá (VNĐ)"
                        rules={[{ required: true, message: "Vui lòng nhập mức lương" }]}
                    >
                        <InputNumber
                            className="w-full"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            parser={(value) => Number(value!.replace(/\./g, "")) as any}
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Trạng thái hoạt động"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngưng" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
