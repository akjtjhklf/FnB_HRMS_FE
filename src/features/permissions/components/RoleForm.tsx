"use client";

import { useCreate, useUpdate, useCustomMutation } from "@refinedev/core";
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
    const { mutateAsync: updatePolicies } = useCustomMutation();

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
                // Fetch policies for this role
                const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
                fetch(`${apiUrl}/api/access/role/${initialValues.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            const policyIds = data.data.map((p: any) => p.id);
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
                message.success("Cập nhật role thành công");
            } else {
                const response = await createRole({
                    resource: "roles",
                    values: roleData,
                });
                // Assuming response.data.id exists. Directus returns the created object.
                roleId = response.data.id;
                message.success("Tạo role thành công");
            }

            // Update Policies
            if (roleId && policyIds) {
                updatePolicies({
                    url: `access/role/${roleId}`,
                    method: 'post',
                    values: { policyIds }
                });
            }

            onCancel();
        } catch (error) {
            message.error("Có lỗi xảy ra");
        }
    };

    return (
        <Modal
            title={initialValues ? "Chỉnh sửa Role" : "Thêm Role mới"}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="name"
                    label="Tên Role"
                    rules={[{ required: true, message: "Vui lòng nhập tên role" }]}
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
                    <Select {...policySelectProps} placeholder="Chọn policies" mode="multiple" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
