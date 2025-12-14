"use client";

import { useTable, DeleteButton } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import {
    Table,
    Space,
    Button,
    Typography,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    TeamOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { RoleForm } from "./RoleForm";

const { Title } = Typography;

export const RoleList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);

    const { tableProps } = useTable({
        resource: "roles",
        pagination: {
            pageSize: 10,
        },
        syncWithLocation: false,
    });


    const handleAdd = () => {
        setEditingRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role: any) => {
        setEditingRole(role);
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
                <div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 mx-auto">
                    {icon ? <i className={`las la-${icon} text-xl`} /> : <TeamOutlined />}
                </div>
            ),
        },
        {
            title: "Tên vai trò",
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
            title: "Thao tác",
            key: "actions",
            width: 120,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <DeleteButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                        resource="roles"
                        confirmTitle="Xóa vai trò này?"
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
                <Title level={4} className="m-0">Danh sách vai trò</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm vai trò
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

            <RoleForm
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                initialValues={editingRole}
            />
        </div>
    );
};
