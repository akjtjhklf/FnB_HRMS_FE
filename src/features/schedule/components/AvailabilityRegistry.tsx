"use client";

import { useState } from "react";
import { useTable, useSelect } from "@refinedev/antd";
import { useCreate, useDelete, useList } from "@refinedev/core";
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Input, App, Tag, Space, Popconfirm, Row, Col, Card, Statistic } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { EmployeeAvailability, Shift, Position } from "@/types/schedule";
import dayjs from "@/lib/dayjs";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

/**
 * AvailabilityRegistry - Component for employees to register shift preferences
 * 
 * Features:
 * - View all employee shift availability registrations
 * - Register new availability with priority and positions
 * - Delete expired or unwanted registrations
 * - Filter by employee
 * - Shows statistics
 */
export function AvailabilityRegistry() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Fetch availabilities
  const { tableProps } = useTable<EmployeeAvailability>({
    resource: "employee-availability",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    },
  });
  
  const { query: availabilitiesQuery } = useList<EmployeeAvailability>({
    resource: "employee-availability",
  });
  
  const availabilities = availabilitiesQuery.data?.data || [];
  const refetch = availabilitiesQuery.refetch;

  // Fetch employees for dropdown
  const { selectProps: employeeSelectProps } = useSelect<Employee>({
    resource: "employees",
    optionLabel: "full_name",
    optionValue: "id",
  });

  // Fetch shifts for dropdown
  const { selectProps: shiftSelectProps } = useSelect<Shift>({
    resource: "shifts",
    optionLabel: (item) => {
      // Get name from shift_type
      if (item.shift_type?.name) return `${item.shift_type.name} - ${item.shift_date}`;
      if (typeof item.shift_type_id === 'object' && item.shift_type_id?.name) {
        return `${item.shift_type_id.name} - ${item.shift_date}`;
      }
      return `Ca ${item.shift_date}`;
    },
    optionValue: "id",
  });

  // Fetch positions for multi-select
  const { selectProps: positionSelectProps } = useSelect<Position>({
    resource: "positions",
    optionLabel: "name",
    optionValue: "id",
  });

  // Create mutation
  const { mutate: createAvailability } = useCreate();

  // Delete mutation
  const { mutate: deleteAvailability } = useDelete();



  // Calculate statistics
  const stats = {
    total: availabilities.length,
    active: availabilities.filter((a: EmployeeAvailability) => !a.expires_at || dayjs(a.expires_at).isAfter(dayjs())).length,
    expired: availabilities.filter((a: EmployeeAvailability) => a.expires_at && dayjs(a.expires_at).isBefore(dayjs())).length,
  };

  // Handle create
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      
      createAvailability(
        {
          resource: "employee-availability",
          values: {
            employee_id: values.employee_id,
            shift_id: values.shift_id,
            priority: values.priority || 5,
            expires_at: values.expires_at ? dayjs(values.expires_at).format("YYYY-MM-DD") : null,
            note: values.note || null,
            positions: values.positions || [],
          },
        },
        {
          onSuccess: () => {
            message.success("Đăng ký ca thành công");
            setCreateModalOpen(false);
            form.resetFields();
            refetch();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi đăng ký ca");
          },
        }
      );
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteAvailability(
      {
        resource: "employee-availability",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa đăng ký thành công");
          refetch();
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra khi xóa");
        },
      }
    );
  };

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "employee_id",
      key: "employee_id",
      render: (_: any, record: EmployeeAvailability) => {
        // Try to get employee info from expand if available
        return record.employee_id || "N/A";
      },
    },
    {
      title: "Ca làm việc",
      dataIndex: "shift_id",
      key: "shift_id",
      render: (_: any, record: EmployeeAvailability) => {
        const shift = record.shift_id as any;
        if (typeof shift === "object" && shift) {
          // Get shift name from shift_type
          const shiftName = shift.shift_type?.name 
            || (typeof shift.shift_type_id === 'object' ? shift.shift_type_id?.name : null)
            || `Ca ${shift.shift_date || 'N/A'}`;
          return (
            <div>
              <div>{shiftName}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {shift.start_at || 'N/A'} - {shift.end_at || 'N/A'}
              </div>
            </div>
          );
        }
        return shift || "N/A";
      },
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority: number | null) => {
        if (!priority) return <Tag>5</Tag>;
        const color = priority >= 8 ? "green" : priority >= 5 ? "blue" : "default";
        return <Tag color={color}>{priority}/10</Tag>;
      },
    },
    {
      title: "Hết hạn",
      dataIndex: "expires_at",
      key: "expires_at",
      width: 120,
      render: (expires_at: string | null) => {
        if (!expires_at) return <Tag color="green">Vô thời hạn</Tag>;
        const isExpired = dayjs(expires_at).isBefore(dayjs());
        return (
          <Tag color={isExpired ? "red" : "blue"} icon={isExpired ? undefined : <ClockCircleOutlined />}>
            {dayjs(expires_at).format("DD/MM/YYYY")}
          </Tag>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: EmployeeAvailability) => (
        <Space>
          <Popconfirm
            title="Xóa đăng ký"
            description="Bạn có chắc muốn xóa đăng ký ca này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng đăng ký"
              value={stats.total}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Còn hiệu lực"
              value={stats.active}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={stats.expired}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action buttons */}
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Đăng ký ca mới
        </Button>
      </div>

      {/* Table */}
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1000 }}
      />

      {/* Create Modal */}
      <Modal
        title="Đăng ký ca làm việc"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        width={600}
        okText="Đăng ký"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Nhân viên"
            name="employee_id"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select {...employeeSelectProps} placeholder="Chọn nhân viên" showSearch />
          </Form.Item>

          <Form.Item
            label="Ca làm việc"
            name="shift_id"
            rules={[{ required: true, message: "Vui lòng chọn ca" }]}
          >
            <Select {...shiftSelectProps} placeholder="Chọn ca làm việc" showSearch />
          </Form.Item>

          <Form.Item
            label="Vị trí mong muốn"
            name="positions"
            tooltip="Chọn các vị trí nhân viên có thể đảm nhận trong ca này"
          >
            <Select
              {...positionSelectProps}
              mode="multiple"
              placeholder="Chọn vị trí"
              showSearch
            />
          </Form.Item>

          <Form.Item
            label="Độ ưu tiên (1-10)"
            name="priority"
            tooltip="Mức độ ưu tiên đăng ký ca này (10 = cao nhất)"
          >
            <InputNumber min={1} max={10} placeholder="5" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Ngày hết hạn"
            name="expires_at"
            tooltip="Để trống nếu đăng ký vô thời hạn"
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày hết hạn"
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
