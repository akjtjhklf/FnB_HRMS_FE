"use client";

import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "@/types/employee";
import { useCreate, useUpdate, useList } from "@refinedev/core";
import { Form, Input, Select, DatePicker, message, Row, Col, Upload, Avatar } from "antd";
import { Button } from "@/components/ui/Button";
import { Save, X, Upload as UploadIcon, User } from "lucide-react";
import { useState } from "react";
import dayjs from "dayjs";

interface EmployeeFormProps {
  employee?: Employee;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  mode,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(employee?.avatar || "");
  const [loading, setLoading] = useState(false);

  // Fetch positions for dropdown
  const { query: positionsQuery } = useList({
    resource: "positions",
  });
  const positions = positionsQuery.data?.data || [];

  const { mutate: createEmployee } = useCreate();
  const { mutate: updateEmployee } = useUpdate();

  const handleSubmit = async (values: any) => {
    setLoading(true);

    const formData: CreateEmployeeDto | UpdateEmployeeDto = {
      employee_code: values.employee_code,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      date_of_birth: values.date_of_birth
        ? dayjs(values.date_of_birth).format("YYYY-MM-DD")
        : undefined,
      gender: values.gender,
      address: values.address,
      position_id: values.position_id,
      hire_date: values.hire_date
        ? dayjs(values.hire_date).format("YYYY-MM-DD")
        : undefined,
      employment_status: values.employment_status,
      rfid_card_id: values.rfid_card_id,
    };

    if (avatarUrl) {
      (formData as any).avatar = avatarUrl;
    }

    if (mode === "create") {
      createEmployee(
        {
          resource: "employees",
          values: formData,
        },
        {
          onSuccess: () => {
            message.success("Thêm nhân viên thành công!");
            setLoading(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi thêm nhân viên!");
            setLoading(false);
          },
        }
      );
    } else {
      updateEmployee(
        {
          resource: "employees",
          id: employee?.id || "",
          values: formData,
        },
        {
          onSuccess: () => {
            message.success("Cập nhật nhân viên thành công!");
            setLoading(false);
            onSuccess?.();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi cập nhật nhân viên!");
            setLoading(false);
          },
        }
      );
    }
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === "done") {
      // Mock upload - in real app, upload to server
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={
        employee
          ? {
              ...employee,
              date_of_birth: employee.date_of_birth
                ? dayjs(employee.date_of_birth)
                : undefined,
              hire_date: employee.hire_date ? dayjs(employee.hire_date) : undefined,
              position_id:
                typeof employee.position_id === "object"
                  ? employee.position_id.id
                  : employee.position_id,
            }
          : {
              employment_status: "active",
              gender: "male",
            }
      }
    >
      {/* Avatar Upload */}
      <div className="mb-6 text-center">
        <div className="inline-block">
          <Upload
            name="avatar"
            showUploadList={false}
            onChange={handleUploadChange}
            beforeUpload={() => false}
          >
            <div className="cursor-pointer">
              {avatarUrl ? (
                <Avatar src={avatarUrl} size={120} />
              ) : (
                <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="mt-2 text-blue-600 text-sm flex items-center justify-center gap-2">
                <UploadIcon className="w-4 h-4" />
                Tải ảnh lên
              </div>
            </div>
          </Upload>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Mã nhân viên"
            name="employee_code"
            rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }]}
          >
            <Input placeholder="VD: NV001" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Họ"
            name="first_name"
            rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
          >
            <Input placeholder="Nguyễn" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Tên"
            name="last_name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Văn A" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="0912345678" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Giới tính" name="gender">
            <Select
              size="large"
              options={[
                { label: "Nam", value: "male" },
                { label: "Nữ", value: "female" },
                { label: "Khác", value: "other" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Ngày sinh" name="date_of_birth">
            <DatePicker
              size="large"
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ngày vào làm" name="hire_date">
            <DatePicker
              size="large"
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày vào làm"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Địa chỉ" name="address">
        <Input.TextArea
          placeholder="Nhập địa chỉ đầy đủ"
          rows={3}
          size="large"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Chức vụ"
            name="position_id"
            rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}
          >
            <Select
              size="large"
              placeholder="Chọn chức vụ"
              options={positions.map((pos: any) => ({
                label: pos.name,
                value: pos.id,
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Trạng thái" name="employment_status">
            <Select
              size="large"
              options={[
                { label: "Đang làm việc", value: "active" },
                { label: "Nghỉ phép", value: "on_leave" },
                { label: "Không hoạt động", value: "inactive" },
                { label: "Đã nghỉ việc", value: "terminated" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Mã thẻ RFID" name="rfid_card_id">
        <Input placeholder="Nhập mã thẻ RFID (nếu có)" size="large" />
      </Form.Item>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? "Đang lưu..." : mode === "create" ? "Thêm nhân viên" : "Cập nhật"}
        </button>
      </div>
    </Form>
  );
};
