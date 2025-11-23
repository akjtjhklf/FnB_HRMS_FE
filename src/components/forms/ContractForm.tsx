"use client";

import React, { useEffect } from "react";
import { Form, Input, Select, DatePicker, InputNumber, Divider, Row, Col, Switch, Alert } from "antd";
import { Contract, CreateContractDto, UpdateContractDto } from "@/types/employee";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

export interface ContractFormProps {
  initialValues?: Partial<Contract>;
  onSubmit?: (values: CreateContractDto | UpdateContractDto) => void;
  mode?: "create" | "edit";
  loading?: boolean;
  employeeId?: string; // For create mode
}

export const ContractForm: React.FC<ContractFormProps> = ({
  initialValues,
  onSubmit,
  mode = "create",
  loading = false,
  employeeId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        start_date: initialValues.start_date ? dayjs(initialValues.start_date) : null,
        end_date: initialValues.end_date ? dayjs(initialValues.end_date) : null,
        probation_end_date: initialValues.probation_end_date ? dayjs(initialValues.probation_end_date) : null,
      };
      form.setFieldsValue(formValues);
    } else if (mode === "create" && employeeId) {
      form.setFieldsValue({ employee_id: employeeId });
    }
  }, [initialValues, employeeId, mode, form]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
      end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
      probation_end_date: values.probation_end_date ? values.probation_end_date.format("YYYY-MM-DD") : null,
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
          message="Thêm hợp đồng mới"
          description="Vui lòng điền đầy đủ thông tin bắt buộc (*) để thêm hợp đồng cho nhân viên."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      {/* Hidden employee_id for create mode */}
      {mode === "create" && (
        <Form.Item name="employee_id" hidden>
          <Input />
        </Form.Item>
      )}

      {/* Thông tin hợp đồng */}
      <Divider orientation="left" className="text-gray-700 font-semibold">
        Thông tin hợp đồng
      </Divider>

      <Form.Item
        name="contract_type"
        label="Loại hợp đồng"
        rules={[{ required: true, message: "Vui lòng chọn loại hợp đồng" }]}
      >
        <Select placeholder="Chọn loại hợp đồng">
          <Option value="full_time">Toàn thời gian</Option>
          <Option value="part_time">Bán thời gian</Option>
          <Option value="casual">Thời vụ</Option>
          <Option value="probation">Thử việc</Option>
        </Select>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bắt đầu"
              className="w-full"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày kết thúc"
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="base_salary"
        label="Lương cơ bản"
        rules={[{ required: true, message: "Vui lòng nhập lương cơ bản" }]}
      >
        <InputNumber
          min={0}
          placeholder="VD: 8000000"
          className="w-full"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          parser={(value) => Number(value!.replace(/\./g, '')) as any}
        />
      </Form.Item>

      <Form.Item
        name="probation_end_date"
        label="Ngày kết thúc thử việc"
        tooltip="Chỉ áp dụng cho hợp đồng thử việc"
      >
        <DatePicker
          format="DD/MM/YYYY"
          placeholder="Chọn ngày kết thúc thử việc"
          className="w-full"
        />
      </Form.Item>

      <Form.Item
        name="is_active"
        label="Trạng thái"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch 
          checkedChildren="Hiệu lực" 
          unCheckedChildren="Hết hiệu lực"
        />
      </Form.Item>

      {/* Ghi chú */}
      <Divider orientation="left" className="text-gray-700 font-semibold mt-6">
        Thông tin bổ sung
      </Divider>

      <Form.Item
        name="signed_doc_url"
        label="Link tài liệu hợp đồng"
        rules={[
          { type: "url", message: "Vui lòng nhập URL hợp lệ" },
        ]}
      >
        <Input placeholder="https://..." />
      </Form.Item>

      <Form.Item
        name="notes"
        label="Ghi chú"
      >
        <TextArea
          placeholder="Nhập ghi chú về hợp đồng (nếu có)"
          rows={4}
        />
      </Form.Item>

      {/* Hidden submit button for external trigger */}
      <button type="submit" style={{ display: "none" }} id="contract-form-submit" />
    </Form>
  );
};

export default ContractForm;
