"use client";

import { useForm } from "@refinedev/antd";
import { useRouter, useParams } from "next/navigation";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  App,
  Divider,
  Radio,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Notification, RecipientType } from "@/types/notification";
import { useSelect } from "@refinedev/antd";
import { Employee } from "@/types/employee";

interface NotificationFormProps {
  action: "create" | "edit";
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const NotificationForm = ({
  action,
  id: propId,
  onSuccess,
  onCancel,
}: NotificationFormProps) => {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams();
  const id = propId || (params?.id as string);
  const [recipientType, setRecipientType] = useState<RecipientType>("all");

  const { formProps, saveButtonProps, onFinish, form } = useForm<Notification>(
    {
      action,
      resource: "notifications",
      id: action === "edit" ? id : undefined,
      redirect: false,
      onMutationSuccess: () => {
        message.success(
          action === "create"
            ? "✅ Tạo thông báo thành công"
            : "✅ Cập nhật thông báo thành công"
        );
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 500);
        } else {
          setTimeout(() => {
            router.push("/notifications");
          }, 500);
        }
      },
      onMutationError: (error: any) => {
        const errorMsg =
          error?.response?.data?.error?.message ||
          "Có lỗi xảy ra, vui lòng thử lại";
        message.error(errorMsg);
      },
    }
  );

  const { selectProps: employeeSelectProps } = useSelect<Employee>({
    resource: "employees",
    optionLabel: (item) =>
      item.full_name ||
      `${item.first_name} ${item.last_name} - ${item.employee_code}`,
    optionValue: "id",
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "active",
      },
    ],
  });

  const levelOptions = [
    { label: "Thông tin", value: "info" },
    { label: "Cảnh báo", value: "warning" },
    { label: "Lỗi", value: "error" },
  ];

  // Watch recipient_type changes
  useEffect(() => {
    const type = form?.getFieldValue("recipient_type");
    if (type) {
      setRecipientType(type);
    }
  }, [form]);

  const handleRecipientTypeChange = (value: RecipientType) => {
    setRecipientType(value);
    // Clear recipient_ids when changing type
    if (value === "all") {
      form?.setFieldsValue({ recipient_ids: undefined });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/notifications");
    }
  };

  return (
    <div
      className={
        onCancel ? "" : "p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen"
      }
    >
      <Card
        title={
          onCancel ? undefined : (
            <div className="flex items-center gap-2">
              <BellOutlined className="text-lg md:text-xl" />
              <span className="text-base sm:text-lg md:text-xl font-semibold">
                {action === "create"
                  ? "Tạo thông báo mới"
                  : "Chỉnh sửa thông báo"}
              </span>
            </div>
          )
        }
        className={
          onCancel
            ? "shadow-none border-0"
            : "shadow-sm border border-gray-200"
        }
        bordered={!onCancel}
      >
        <Form {...formProps} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề thông báo" },
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề thông báo"
                size="large"
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item label="Nội dung" name="body">
              <Input.TextArea
                rows={5}
                placeholder="Nhập nội dung thông báo"
                maxLength={1000}
                showCount
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Mức độ"
              name="level"
              initialValue="info"
              rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}
            >
              <Select
                options={levelOptions}
                placeholder="Chọn mức độ"
                size="large"
              />
            </Form.Item>
          </div>

          <Divider orientation="left" className="my-3 md:my-4">
            Người nhận
          </Divider>

          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <Form.Item
              label="Loại người nhận"
              name="recipient_type"
              initialValue="all"
              rules={[
                { required: true, message: "Vui lòng chọn loại người nhận" },
              ]}
            >
              <Radio.Group
                onChange={(e) => handleRecipientTypeChange(e.target.value)}
                size="large"
              >
                <Radio.Button value="all">Tất cả nhân viên</Radio.Button>
                <Radio.Button value="individual">Cá nhân</Radio.Button>
                <Radio.Button value="group">Nhóm</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {recipientType === "individual" && (
              <Form.Item
                label="Chọn nhân viên"
                name="recipient_ids"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 nhân viên",
                  },
                ]}
              >
                <Select
                  {...employeeSelectProps}
                  mode="multiple"
                  placeholder="Chọn nhân viên"
                  showSearch
                  size="large"
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  maxTagCount="responsive"
                />
              </Form.Item>
            )}

            {recipientType === "group" && (
              <Form.Item
                label="Chọn nhóm nhân viên"
                name="recipient_ids"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 nhóm",
                  },
                ]}
              >
                <Select
                  {...employeeSelectProps}
                  mode="multiple"
                  placeholder="Chọn nhiều nhân viên (nhóm)"
                  showSearch
                  size="large"
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  maxTagCount="responsive"
                />
              </Form.Item>
            )}
          </div>

          {!onCancel && <Divider className="my-3 md:my-4" />}

          <Form.Item className="mb-0 mt-4">
            <Space className="w-full justify-end flex-wrap">
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancel}
                size="large"
                className="min-w-[100px]"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                {...saveButtonProps}
                size="large"
                className="min-w-[120px]"
              >
                {action === "create" ? "Gửi thông báo" : "Lưu thay đổi"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
