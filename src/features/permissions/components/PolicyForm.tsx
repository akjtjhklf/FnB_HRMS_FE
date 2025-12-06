"use client";

import { useCreate, useUpdate } from "@refinedev/core";
import { Modal, Form, Input, Switch, Tabs, App } from "antd";
import { useEffect, useState } from "react";
import { PermissionMatrix } from "./PermissionMatrix";

interface PolicyFormProps {
    open: boolean;
    onCancel: () => void;
    initialValues?: any;
    icon?: string;
}

export const PolicyForm = ({ open, onCancel, initialValues, icon = "badge" }: PolicyFormProps) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { mutate: createPolicy } = useCreate();
    const { mutate: updatePolicy } = useUpdate();
    const [activeTab, setActiveTab] = useState("info");

    useEffect(() => {
        if (open) {
            setActiveTab("info");
            if (initialValues) {
                form.setFieldsValue({
                    icon,
                    ...initialValues,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ icon });
            }
        }
    }, [open, initialValues, form, icon]);

    const onFinish = (values: any) => {
        if (initialValues) {
            updatePolicy(
                {
                    resource: "policies",
                    id: initialValues.id,
                    values,
                },
                {
                    onSuccess: () => {
                        message.success("Cập nhật chính sách thành công");
                        if (activeTab === "info") {
                            onCancel();
                        }
                    },
                }
            );
        } else {
            createPolicy(
                {
                    resource: "policies",
                    values,
                },
                {
                    onSuccess: () => {
                        message.success("Tạo chính sách thành công");
                        onCancel();
                    },
                }
            );
        }
    };

    const items = [
        {
            key: "info",
            label: "Thông tin chung",
            children: (
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="name"
                        label="Tên Policy"
                        rules={[{ required: true, message: "Vui lòng nhập tên policy" }]}
                    >
                        <Input placeholder="Ví dụ: Quản lý nhân sự" />
                    </Form.Item>

                    {/* <Form.Item
                        name="icon"
                        label="Icon"
                        initialValue="badge"
                    >
                        <Input placeholder="badge" />
                    </Form.Item> */}

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <div className="flex gap-8">
                        <Form.Item
                            name="app_access"
                            label="Truy cập với quyền app"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="admin_access"
                            label="Truy cập với quyền admin"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="enforce_tfa"
                            label="Bắt buộc 2FA"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>
                </Form>
            ),
        },
        {
            key: "permissions",
            label: "Phân quyền (Permissions)",
            disabled: !initialValues, // Can only edit permissions for existing policy
            children: initialValues ? (
                <div className=" overflow-hidden flex flex-col">
                    <PermissionMatrix policyId={initialValues.id} />
                </div>
            ) : null,
        },
    ];

    return (
        <Modal
            title={initialValues ? "Chỉnh sửa chính sách" : "Thêm chính sách mới"}
            open={open}
            onCancel={onCancel}
            width={900}
            onOk={() => {
                if (activeTab === "info") {
                    form.submit();
                } else {
                    onCancel();
                }
            }}
            cancelButtonProps={{ style: { display: "none" } }}
            okText={activeTab === "info" ? "Lưu thông tin" : "Đóng"}
        // confirmLoading={isCreating || isUpdating}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
            />
        </Modal>
    );
};
