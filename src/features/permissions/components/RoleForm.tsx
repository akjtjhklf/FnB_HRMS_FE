"use client";

import { useCreate, useUpdate } from "@refinedev/core";
import { Modal, Form, Input, App, Select } from "antd";
import { useSelect } from "@refinedev/antd";
import { useEffect } from "react";

interface RoleFormProps {
    open: boolean;
    onCancel: () => void;
    initialValues?: any;
}

export const RoleForm = ({ open, onCancel, initialValues }: RoleFormProps) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { mutateAsync: createRole } = useCreate();
    const { mutateAsync: updateRole } = useUpdate();

    // Fetch Policies for Select
    const { selectProps: policySelectProps } = useSelect({
        resource: 'policies',
        optionLabel: 'name',
        optionValue: 'id',
    });

    // Fetch existing policies if editing
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                // Fetch policies for this role from new endpoint
                const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
                fetch(`${apiUrl}/api/roles/${initialValues.id}/policies`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            const policyIds = data.data?.map((p: any) => p.id) || [];
                            form.setFieldValue('policyIds', policyIds);
                        }
                    })
                    .catch(err => console.error("Failed to fetch role policies", err));
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const onFinish = async (values: any) => {
        const { policyIds, ...roleData } = values;

        try {
            let roleId = initialValues?.id;

            if (initialValues) {
                await updateRole({
                    resource: "roles",
                    id: initialValues.id,
                    values: roleData,
                });
                roleId = initialValues.id;
                message.success("Cập nhật vai trò thành công");
            } else {
                const response = await createRole({
                    resource: "roles",
                    values: roleData,
                });
                roleId = response.data.id;
                message.success("Tạo vai trò thành công");
            }

            // Update Policies using new endpoint
            if (roleId && policyIds) {
                const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
                await fetch(`${apiUrl}/api/roles/${roleId}/policies`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ policyIds })
                });
            }

            onCancel();
        } catch (error) {
            message.error("Có lỗi xảy ra");
        }
    };

    return (
        <Modal
            title={initialValues ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="name"
                    label="Tên vai trò"
                    rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
                >
                    <Input placeholder="Ví dụ: Quản lý, Nhân viên..." />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={3} placeholder="Mô tả về vai trò này..." />
                </Form.Item>

                <Form.Item
                    name="policyIds"
                    label="Policies (Quyền hạn)"
                    help="Chọn các chính sách áp dụng cho vai trò này"
                >
                    <Select {...policySelectProps} placeholder="Chọn chính sách" mode="multiple" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
