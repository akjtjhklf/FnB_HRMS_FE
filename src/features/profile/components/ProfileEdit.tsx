"use client";

import { useGetIdentity } from "@refinedev/core";
import { useForm } from "@refinedev/antd";
import { Employee } from "@/types/employee";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Upload,
  Avatar,
  Card,
  Space,
  Button as AntButton,
  App,
  Spin,
  Empty,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const ProfileEdit: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Get current user's identity
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<{ employee_id?: string; employee?: { id: string } }>();
  // Get employee_id from either identity.employee.id (populated) or identity.employee_id (just ID)
  const employeeId = identity?.employee?.id || identity?.employee_id;

  const { formProps, onFinish, form, query } = useForm<Employee>({
    action: "edit",
    resource: "employees",
    id: employeeId || "",
    redirect: false,
    queryOptions: {
      enabled: !!employeeId, // Only fetch when employeeId is available
    },
    onMutationSuccess: () => {
      message.success("✅ Cập nhật thông tin thành công!");
      router.push("/profile");
    },
    onMutationError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "Có lỗi xảy ra!";
      message.error(`❌ ${errorMsg}`);
    },
    mutationMode: "pessimistic",
  });

  const isLoading = isIdentityLoading || query?.isLoading;
  const employee = query?.data?.data;

  // Handle form values transformation
  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      // dob is already normalized to YYYY-MM-DD string by Form.Item normalize
      photo_url: avatarUrl || values.photo_url,
    };

    onFinish(formattedValues);
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === "done" || info.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      if (info.file.originFileObj) {
        reader.readAsDataURL(info.file.originFileObj);
      }
    }
  };

  // Set avatar URL when employee data is loaded
  React.useEffect(() => {
    if (employee?.photo_url) {
      setAvatarUrl(employee.photo_url);
    }
  }, [employee]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Spin size="large">
          <div className="pt-8 text-gray-500">Đang tải thông tin...</div>
        </Spin>
      </div>
    );
  }

  // No employee linked to user
  if (!employeeId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Empty
          description="Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên. Vui lòng liên hệ quản trị viên."
        />
      </div>
    );
  }

  // No employee data found
  if (!employee) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Empty
          description="Không tìm thấy thông tin nhân viên"
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
          <Link
            href={`/profile`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftOutlined className="mr-2" />
            Quay lại
          </Link>
        </div>
      <div className="max-w-5xl mx-auto">
        <Form
          {...formProps}
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          size="large"
        >
          {/* Avatar Section */}
          <Card className="mb-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="py-6">
              <Upload
                name="avatar"
                showUploadList={false}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                accept="image/*"
              >
                <div className="cursor-pointer inline-block">
                  <Avatar
                    size={120}
                    src={avatarUrl || employee?.photo_url}
                    icon={<UserOutlined />}
                    className="border-4 border-white shadow-lg"
                  />
                  <div className="mt-3 text-blue-600 font-medium flex items-center justify-center gap-2">
                    <UploadOutlined />
                    {avatarUrl || employee?.photo_url
                      ? "Thay đổi ảnh"
                      : "Tải ảnh lên"}
                  </div>
                </div>
              </Upload>
            </div>
          </Card>

          {/* Basic Information */}
          <Card title="📋 Thông tin cơ bản" className="mb-6">
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mã nhân viên"
                  name="employee_code"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="employee@company.com"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Họ"
                  name="first_name"
                  rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
                >
                  <Input placeholder="Nguyễn Văn" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên"
                  name="last_name"
                  rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                  <Input placeholder="An" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Họ và tên đầy đủ"
              name="full_name"
              extra="Nếu để trống, hệ thống sẽ tự động tạo từ Họ và Tên"
            >
              <Input placeholder="Nguyễn Văn An" />
            </Form.Item>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="0912345678"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Giới tính" name="gender">
                  <Select
                    placeholder="Chọn giới tính"
                    options={[
                      { label: "Nam", value: "male" },
                      { label: "Nữ", value: "female" },
                      { label: "Khác", value: "other" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item 
                  label="Ngày sinh" 
                  name="dob"
                  getValueProps={(value) => ({
                    value: value ? dayjs(value) : undefined,
                  })}
                  normalize={(value) => value ? dayjs(value).format("YYYY-MM-DD") : null}
                >
                  <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày sinh"
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="CMND/CCCD" name="personal_id">
                  <Input placeholder="001234567890" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Địa chỉ" name="address">
              <Input.TextArea
                placeholder="Nhập địa chỉ đầy đủ"
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Card>

          {/* Emergency Contact */}
          {/* <Card title="🚨 Liên hệ khẩn cấp" className="mb-6">
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Tên người liên hệ" name="emergency_contact_name">
                  <Input placeholder="Nguyễn Văn B" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="emergency_contact_phone"
                  rules={[
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="0987654321"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card> */}

          {/* Additional Notes */}
          <Card title="📝 Ghi chú" className="mb-6">
            <Form.Item
              name="notes"
              extra="Ghi chú thêm về bản thân (không bắt buộc)"
            >
              <Input.TextArea
                placeholder="Nhập ghi chú..."
                rows={4}
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Card>

          {/* Action Buttons */}
          <Card className="sticky bottom-4 shadow-lg border-t-4 border-blue-500">
            <div className="flex justify-end items-center gap-3">
              <AntButton 
                size="large" 
                icon={<CloseOutlined />} 
                onClick={() => router.push("/profile")}
              >
                Hủy
              </AntButton>
              <AntButton
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                htmlType="submit"
              >
                Cập nhật thông tin
              </AntButton>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
};
