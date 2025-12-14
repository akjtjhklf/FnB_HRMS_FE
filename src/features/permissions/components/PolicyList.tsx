"use client";

import { useTable, DeleteButton } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import {
    Table,
    Space,
    Button,
    Typography,
    Tooltip,
    Tag,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { PolicyForm } from "./PolicyForm";

const { Title } = Typography;

export const PolicyList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);

    const { tableProps } = useTable({
        resource: "policies",
        pagination: {
            pageSize: 10,
        },
        syncWithLocation: false,
    });

    const { mutate: deletePolicy } = useDelete();

    const handleAdd = () => {
        setEditingPolicy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (policy: any) => {
        setEditingPolicy(policy);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: "Biểu tượng",
            dataIndex: "icon",
            key: "icon",
            width: 80,
            align: "center" as const,
            render: (icon: string) => (
                <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-full text-green-600 mx-auto">
                    {icon ? <i className={`las la-${icon} text-xl`} /> : <SafetyCertificateOutlined />}
                </div>
            ),
        },
        {
            title: "Tên Chính sách",
            dataIndex: "name",
            key: "name",
            render: (text: string) => <span className="font-medium">{text}</span>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (text: string) => (
                <span className="text-gray-500">{text || "Không có mô tả"}</span>
            ),
        },
        {
            title: "Quyền truy cập",
            key: "access",
            render: (_: any, record: any) => (
                <Space wrap>
                    {record.admin_access && <Tag color="red">Quyền Admin</Tag>}
                    {record.app_access && <Tag color="blue">Quyền Ứng dụng</Tag>}
                    {record.enforce_tfa && <Tag color="orange">2FA</Tag>}
                </Space>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 180,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Chỉnh sửa & Phân quyền">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        >
                            Sửa & Phân quyền
                        </Button>
                    </Tooltip>
                    <DeleteButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                        resource="policies"
                        confirmTitle="Xóa chính sách này?"
                        confirmOkText="Xóa"
                        confirmCancelText="Hủy"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0">Danh sách chính sách</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm chính sách
                </Button>
            </div>

            <Table
                {...tableProps}
                columns={columns}
                rowKey="id"
                size="small"
                pagination={{
                    ...tableProps.pagination,
                    showSizeChanger: true,
                }}
            />

            <PolicyForm
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                initialValues={editingPolicy}
            />
        </div>
    );
};
