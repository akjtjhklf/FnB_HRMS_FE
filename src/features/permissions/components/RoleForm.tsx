"use client";

import { useCreate, useUpdate } from "@refinedev/core";
import { Modal, Form, Input, App } from "antd";
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

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const onFinish = (values: any) => {
        if (initialValues) {
            updateRole(
                {
                    resource: "roles",
                    id: initialValues.id,
                    values,
                },
                {
                    onSuccess: () => {
                        message.success("Cập nhật role thành công");
                        onCancel();
                    },
                }
            );
        } else {
            createRole(
                {
                    resource: "roles",
                    values,
                },
                {
                    onSuccess: () => {
                        message.success("Tạo role thành công");
                        onCancel();
                    },
                }
            );
        }
    };

    return (
        <Modal
            title={initialValues ? "Chỉnh sửa Role" : "Thêm Role mới"}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
        // confirmLoading={isCreating || isUpdating}
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
            </Form>
        </Modal>
    );
};
