"use client";

import { Link, useForm, useGetIdentity } from "@refinedev/core";
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

export const ProfileEdit: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Get current user's identity
  const { data: identity } = useGetIdentity<{ employee_id: string }>();
  const employeeId = identity?.employee_id || "1"; // Fallback to "1" for demo

  const { formProps, onFinish, form, queryResult } = useForm<Employee>({
    action: "edit",
    resource: "employees",
    id: employeeId,
    redirect: false,
    queryOptions: {
      enabled: true, // Always enabled for demo
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

  // Mock data for demo if no data available
  const employee = queryResult?.data?.data || {
    id: "1",
    employee_code: "EMP001",
    first_name: "Nguyễn",
    last_name: "An",
    full_name: "Nguyễn Văn An",
    email: "nguyen.van.an@company.com",
    phone: "0912345678",
    gender: "male",
    dob: "1990-01-15",
    personal_id: "001234567890",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    hire_date: "2020-01-01",
    status: "active",
    photo_url: "",
    emergency_contact_name: "Nguyễn Văn B",
    emergency_contact_phone: "0987654321",
    notes: "Nhân viên xuất sắc",
  };

  // Handle form values transformation
  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null,
      hire_date: values.hire_date
        ? dayjs(values.hire_date).format("YYYY-MM-DD")
        : null,
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

  // Transform date fields for edit mode
  React.useEffect(() => {
    if (employee && form) {
      form.setFieldsValue({
        ...employee,
        dob: employee.dob ? dayjs(employee.dob) : undefined,
        hire_date: employee.hire_date ? dayjs(employee.hire_date) : undefined,
      });
    }
  }, [employee, form]);

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
                <Form.Item label="Ngày sinh" name="dob">
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
