"use client";

import React, { useEffect } from "react";
import { Form, Input, Select, DatePicker, InputNumber, Divider, Row, Col, Alert } from "antd";
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "@/types/employee";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

export interface EmployeeFormProps {
  initialValues?: Partial<Employee>;
  onSubmit?: (values: CreateEmployeeDto | UpdateEmployeeDto) => void;
  mode?: "create" | "edit";
  loading?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialValues,
  onSubmit,
  mode = "create",
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        dob: initialValues.dob ? dayjs(initialValues.dob) : null,
        hire_date: initialValues.hire_date ? dayjs(initialValues.hire_date) : null,
        termination_date: initialValues.termination_date ? dayjs(initialValues.termination_date) : null,
      };
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      hire_date: values.hire_date ? values.hire_date.format("YYYY-MM-DD") : null,
      termination_date: values.termination_date ? values.termination_date.format("YYYY-MM-DD") : null,
      // Convert InputNumber values to actual numbers
      default_work_hours_per_week: values.default_work_hours_per_week ? Number(values.default_work_hours_per_week) : null,
      max_hours_per_week: values.max_hours_per_week ? Number(values.max_hours_per_week) : null,
      max_consecutive_days: values.max_consecutive_days ? Number(values.max_consecutive_days) : null,
      min_rest_days_per_week: values.min_rest_days_per_week ? Number(values.min_rest_days_per_week) : null,
    };

    if (onSubmit) {
      onSubmit(formattedValues);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="space-y-4"
    >
      {mode === "create" && (
        <Alert
          message="Thêm nhân viên mới"
          description="Vui lòng điền đầy đủ thông tin bắt buộc (*) để thêm nhân viên mới vào hệ thống."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      {/* Thông tin cơ bản */}
      <Divider orientation="left" className="text-gray-700 font-semibold">
        Thông tin cơ bản
      </Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="employee_code"
            label="Mã nhân viên"
            rules={[
              { required: true, message: "Vui lòng nhập mã nhân viên" },
              { pattern: /^[A-Z0-9]+$/, message: "Mã chỉ chứa chữ hoa và số" },
            ]}
          >
            <Input placeholder="VD: EMP001" disabled={mode === "edit"} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="active"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang làm việc</Option>
              <Option value="on_leave">Nghỉ phép</Option>
              <Option value="suspended">Tạm ngưng</Option>
              <Option value="terminated">Đã nghỉ việc</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="first_name"
            label="Họ và tên đệm"
            rules={[{ required: true, message: "Vui lòng nhập họ" }]}
          >
            <Input placeholder="VD: Nguyễn Văn" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="last_name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="VD: A" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="full_name"
        label="Họ và tên đầy đủ"
        rules={[{ required: true, message: "Vui lòng nhập họ tên đầy đủ" }]}
      >
        <Input placeholder="VD: Nguyễn Văn A" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="dob"
            label="Ngày sinh"
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="personal_id"
            label="CMND/CCCD"
            rules={[
              { pattern: /^[0-9]{9,12}$/, message: "CMND/CCCD không hợp lệ" },
            ]}
          >
            <Input placeholder="VD: 001234567890" maxLength={12} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="VD: 0901234567" maxLength={11} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="email"
        label="Thư điện tử"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input placeholder="VD: nguyenvana@example.com" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
      >
        <TextArea
          placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
          rows={3}
        />
      </Form.Item>

      {/* Thông tin công việc */}
      <Divider orientation="left" className="text-gray-700 font-semibold mt-6">
        Thông tin công việc
      </Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="hire_date"
            label="Ngày vào làm"
            rules={[{ required: true, message: "Vui lòng chọn ngày vào làm" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày vào làm"
              className="w-full"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="termination_date"
            label="Ngày nghỉ việc"
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày nghỉ việc"
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="default_work_hours_per_week"
            label="Giờ làm mặc định/tuần"
            initialValue={40}
          >
            <InputNumber
              min={0}
              max={168}
              placeholder="VD: 40"
              className="w-full"
              addonAfter="giờ"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="max_hours_per_week"
            label="Giờ làm tối đa/tuần"
            initialValue={48}
          >
            <InputNumber
              min={0}
              max={168}
              placeholder="VD: 48"
              className="w-full"
              addonAfter="giờ"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="max_consecutive_days"
            label="Số ngày làm liên tiếp tối đa"
            initialValue={6}
          >
            <InputNumber
              min={1}
              max={14}
              placeholder="VD: 6"
              className="w-full"
              addonAfter="ngày"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="min_rest_hours_between_shifts"
            label="Giờ nghỉ tối thiểu giữa ca"
            initialValue={12}
          >
            <InputNumber
              min={0}
              max={24}
              placeholder="VD: 12"
              className="w-full"
              addonAfter="giờ"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Liên hệ khẩn cấp */}
      <Divider orientation="left" className="text-gray-700 font-semibold mt-6">
        Liên hệ khẩn cấp
      </Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="emergency_contact_name"
            label="Tên người liên hệ"
          >
            <Input placeholder="VD: Nguyễn Văn B" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="emergency_contact_phone"
            label="Số điện thoại"
            rules={[
              { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="VD: 0901234567" maxLength={11} />
          </Form.Item>
        </Col>
      </Row>

      {/* Ghi chú */}
      <Divider orientation="left" className="text-gray-700 font-semibold mt-6">
        Ghi chú
      </Divider>

      <Form.Item
        name="notes"
        label="Ghi chú thêm"
      >
        <TextArea
          placeholder="Nhập ghi chú về nhân viên (nếu có)"
          rows={4}
        />
      </Form.Item>

      {/* Hidden submit button for external trigger */}
      <button type="submit" style={{ display: "none" }} id="employee-form-submit" />
    </Form>
  );
};

export default EmployeeForm;
