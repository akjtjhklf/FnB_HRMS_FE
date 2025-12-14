"use client";

import { useForm, useSelect } from "@refinedev/antd";
import { Permission, PERMISSION_ACTIONS, COLLECTIONS } from "@/types/permission";
import {
  Form,
  Input,
  Select,
  Button as AntButton,
  Space,
  Card,
  App,
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import React from "react";

interface PermissionFormProps {
  permission?: Permission | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({
  permission,
  onSuccess,
  onCancel,
}) => {
  const { message } = App.useApp();
  const isEdit = !!permission;

  const { formProps, saveButtonProps, onFinish, form } = useForm<Permission>({
    action: isEdit ? "edit" : "create",
    resource: "permissions",
    id: permission?.id,
    redirect: false,
    onMutationSuccess: () => {
      if (isEdit) {
        message.success("✅ Cập nhật quyền thành công!");
      } else {
        message.success("✅ Thêm quyền mới thành công!");
      }
      onSuccess?.();
    },
    onMutationError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Có lỗi xảy ra!";
      message.error(`❌ ${errorMsg}`);
    },
    mutationMode: "pessimistic",
  });

  // Use useSelect for policies dropdown
  const { selectProps: policySelectProps } = useSelect({
    resource: "policies",
    optionLabel: "name",
    optionValue: "id",
    debounce: 300,
  });

  // Transform to include description in dropdown
  const enhancedPolicySelectProps = {
    ...policySelectProps,
    options: policySelectProps.options?.map((opt: any) => ({
      ...opt,
      label: (
        <div className="flex items-center justify-between">
          <span>{opt.label}</span>
          {opt.data?.description && (
            <span className="text-xs text-gray-700 ml-2">{opt.data.description}</span>
          )}
        </div>
      ),
    })),
  };

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      permissions: values.permissions_json ? JSON.parse(values.permissions_json) : null,
      validation: values.validation_json ? JSON.parse(values.validation_json) : null,
      presets: values.presets_json ? JSON.parse(values.presets_json) : null,
    };

    delete formattedValues.permissions_json;
    delete formattedValues.validation_json;
    delete formattedValues.presets_json;

    onFinish(formattedValues);
  };

  // Set initial values for edit mode
  React.useEffect(() => {
    if (isEdit && permission && form) {
      form.setFieldsValue({
        ...permission,
        permissions_json: permission.permissions
          ? JSON.stringify(permission.permissions, null, 2)
          : "",
        validation_json: permission.validation
          ? JSON.stringify(permission.validation, null, 2)
          : "",
        presets_json: permission.presets
          ? JSON.stringify(permission.presets, null, 2)
          : "",
      });
    }
  }, [permission, form, isEdit]);

  return (
    <Form
      {...formProps}
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      size="large"
      className="mt-4"
    >
      <Card type="inner" title="Thông tin cơ bản" className="mb-4">
        <Form.Item
          label="Bảng dữ liệu"
          name="collection"
          rules={[{ required: true, message: "Vui lòng chọn bảng dữ liệu!" }]}
          tooltip="Chọn bảng dữ liệu cần áp dụng quyền"
        >
          <Select
            placeholder="Chọn bảng dữ liệu"
            showSearch
            options={Object.entries(COLLECTIONS).map(([key, value]) => ({
              label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " "),
              value: value,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Hành động"
          name="action"
          rules={[{ required: true, message: "Vui lòng chọn hành động!" }]}
          tooltip="Loại hành động được phép thực hiện"
        >
          <Select
            placeholder="Chọn hành động"
            options={Object.entries(PERMISSION_ACTIONS).map(([key, value]) => ({
              label: key.charAt(0) + key.slice(1).toLowerCase(),
              value: value,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Chính sách"
          name="policy"
          rules={[{ required: true, message: "Vui lòng chọn chính sách!" }]}
          tooltip="Chọn chính sách áp dụng cho quyền này"
        >
          <Select
            {...enhancedPolicySelectProps}
            placeholder="Chọn chính sách"
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Trường dữ liệu"
          name="fields"
          tooltip="Danh sách các trường được phép truy cập (cách nhau bởi dấu phẩy). Để trống để cho phép tất cả"
        >
          <Input.TextArea
            placeholder="trường1, trường2, trường3..."
            rows={2}
          />
        </Form.Item>
      </Card>

      <Card type="inner" title="Cấu hình nâng cao (JSON)" className="mb-4">
        <Form.Item
          label="Cấu hình quyền"
          name="permissions_json"
          tooltip="JSON object chứa các điều kiện permissions (ví dụ: filter theo user)"
          extra="Định dạng: JSON object"
        >
          <Input.TextArea
            placeholder='{"_and":[{"status":{"_eq":"published"}}]}'
            rows={4}
            className="font-mono text-xs"
          />
        </Form.Item>

        <Form.Item
          label="Quy tắc xác thực"
          name="validation_json"
          tooltip="JSON object chứa các quy tắc xác thực"
          extra="Định dạng: JSON object"
        >
          <Input.TextArea
            placeholder='{"_and":[{"field":{"_nnull":true}}]}'
            rows={4}
            className="font-mono text-xs"
          />
        </Form.Item>

        <Form.Item
          label="Giá trị mặc định"
          name="presets_json"
          tooltip="JSON object chứa các giá trị mặc định"
          extra="Định dạng: JSON object"
        >
          <Input.TextArea
            placeholder='{"status":"draft","user":"$CURRENT_USER"}'
            rows={4}
            className="font-mono text-xs"
          />
        </Form.Item>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <AntButton
          size="large"
          icon={<CloseOutlined />}
          onClick={onCancel}
        >
          Hủy
        </AntButton>
        <AntButton
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          {...saveButtonProps}
        >
          {isEdit ? "Cập nhật" : "Thêm quyền"}
        </AntButton>
      </div>
    </Form>
  );
};
