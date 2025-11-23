"use client";

import { useState } from "react";
import { useTable, useSelect } from "@refinedev/antd";
import { useCreate, useUpdate, useDelete, useList } from "@refinedev/core";
import { Table, Button, Modal, Form, Select, Input, TimePicker, InputNumber, App, Tag, Space, Popconfirm, Row, Col, Card, Statistic, Tabs } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import type { Shift, ShiftPositionRequirement, Position } from "@/types/schedule";
import dayjs from "dayjs";

/**
 * ShiftManagement - Component to manage shifts and position requirements
 * 
 * Features:
 * - View and manage shifts
 * - Create/edit/delete shifts
 * - Manage position requirements for each shift
 * - Shows shift schedule statistics
 */
export function ShiftManagement() {
  const { message } = App.useApp();
  const [shiftForm] = Form.useForm();
  const [requirementForm] = Form.useForm();
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  // Fetch shifts
  const { tableProps: shiftsTableProps } = useTable<Shift>({
    resource: "shifts",
    sorters: {
      initial: [{ field: "shift_date", order: "desc" }],
    },
  });
  
  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
  });
  const shifts = shiftsQuery.data?.data || [];
  const refetchShifts = shiftsQuery.refetch;

  // Fetch position requirements
  const { tableProps: requirementsTableProps } = useTable<ShiftPositionRequirement>({
    resource: "shift-position-requirements",
    filters: {
      permanent: selectedShiftId
        ? [{ field: "shift_id", operator: "eq", value: selectedShiftId }]
        : [],
    },
    queryOptions: {
      enabled: !!selectedShiftId,
    },
  });
  
  const { query: requirementsQuery } = useList<ShiftPositionRequirement>({
    resource: "shift-position-requirements",
    filters: selectedShiftId
      ? [{ field: "shift_id", operator: "eq", value: selectedShiftId }]
      : [],
    queryOptions: {
      enabled: !!selectedShiftId,
    },
  });
  const requirements = requirementsQuery.data?.data || [];
  const refetchRequirements = requirementsQuery.refetch;

  // Fetch positions for dropdown
  const { selectProps: positionSelectProps } = useSelect<Position>({
    resource: "positions",
    optionLabel: "name",
    optionValue: "id",
  });

  // Shifts mutations
  const { mutate: createShift } = useCreate();
  const { mutate: updateShift } = useUpdate();
  const { mutate: deleteShift } = useDelete();

  // Requirements mutations
  const { mutate: createRequirement } = useCreate();
  const { mutate: deleteRequirement } = useDelete();



  // Calculate statistics
  const stats = {
    totalShifts: shifts.length,
    activeShifts: shifts.filter((s: Shift) => s.is_active).length,
    totalPositions: requirements.reduce((sum: number, r: ShiftPositionRequirement) => sum + (r.required_count || 0), 0),
  };

  // Handle create/edit shift
  const handleShiftSubmit = async () => {
    try {
      const values = await shiftForm.validateFields();
      
      const shiftData = {
        shift_type_id: values.shift_type_id,
        shift_date: values.shift_date ? dayjs(values.shift_date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        start_at: values.start_at ? dayjs(values.start_at).format("HH:mm:ss") : "00:00:00",
        end_at: values.end_at ? dayjs(values.end_at).format("HH:mm:ss") : "00:00:00",
        total_required: values.total_required || 0,
        notes: values.notes || null,
      };

      if (editingShift) {
        updateShift(
          {
            resource: "shifts",
            id: editingShift.id,
            values: shiftData,
          },
          {
            onSuccess: () => {
              message.success("Cập nhật ca thành công");
              setShiftModalOpen(false);
              setEditingShift(null);
              shiftForm.resetFields();
              refetchShifts();
            },
            onError: (error: any) => {
              message.error(error?.message || "Có lỗi xảy ra");
            },
          }
        );
      } else {
        createShift(
          {
            resource: "shifts",
            values: shiftData,
          },
          {
            onSuccess: () => {
              message.success("Tạo ca thành công");
              setShiftModalOpen(false);
              shiftForm.resetFields();
              refetchShifts();
            },
            onError: (error: any) => {
              message.error(error?.message || "Có lỗi xảy ra");
            },
          }
        );
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Handle delete shift
  const handleDeleteShift = (id: string) => {
    deleteShift(
      {
        resource: "shifts",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa ca thành công");
          refetchShifts();
          if (selectedShiftId === id) {
            setSelectedShiftId(null);
          }
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  // Handle add position requirement
  const handleAddRequirement = async () => {
    try {
      const values = await requirementForm.validateFields();
      
      createRequirement(
        {
          resource: "shift-position-requirements",
          values: {
            shift_id: selectedShiftId,
            position_id: values.position_id,
            required_count: values.required_count,
            notes: values.notes || null,
          },
        },
        {
          onSuccess: () => {
            message.success("Thêm yêu cầu vị trí thành công");
            setRequirementModalOpen(false);
            requirementForm.resetFields();
            refetchRequirements();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra");
          },
        }
      );
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Handle delete requirement
  const handleDeleteRequirement = (id: string) => {
    deleteRequirement(
      {
        resource: "shift-position-requirements",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa yêu cầu thành công");
          refetchRequirements();
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  const shiftColumns = [
    {
      title: "Tên ca",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: "Ngày",
      dataIndex: "shift_date",
      key: "shift_date",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thời gian",
      key: "time",
      width: 150,
      render: (_: any, record: Shift) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {record.start_at} - {record.end_at}
        </div>
      ),
    },
    {
      title: "Số người cần",
      dataIndex: "total_required",
      key: "total_required",
      width: 120,
      render: (count: number) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {count || 0}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Hoạt động" : "Ngừng"}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: Shift) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => setSelectedShiftId(record.id)}
          >
            Xem vị trí
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingShift(record);
              shiftForm.setFieldsValue({
                ...record,
                start_at: record.start_at ? dayjs(record.start_at, "HH:mm:ss") : null,
                end_at: record.end_at ? dayjs(record.end_at, "HH:mm:ss") : null,
                shift_date: record.shift_date ? dayjs(record.shift_date) : null,
              });
              setShiftModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa ca"
            description="Bạn có chắc muốn xóa ca này?"
            onConfirm={() => handleDeleteShift(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const requirementColumns = [
    {
      title: "Vị trí",
      dataIndex: "position_id",
      key: "position_id",
      render: (position: any) => {
        if (typeof position === "object" && position?.name) {
          return position.name;
        }
        return position || "N/A";
      },
    },
    {
      title: "Số lượng cần",
      dataIndex: "required_count",
      key: "required_count",
      width: 120,
      render: (count: number) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_: any, record: ShiftPositionRequirement) => (
        <Popconfirm
          title="Xóa yêu cầu"
          description="Bạn có chắc muốn xóa yêu cầu này?"
          onConfirm={() => handleDeleteRequirement(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const selectedShift = shifts.find((s: Shift) => s.id === selectedShiftId);

  return (
    <div>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số ca"
              value={stats.totalShifts}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca đang hoạt động"
              value={stats.activeShifts}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng vị trí cần"
              value={stats.totalPositions}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Action buttons */}
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingShift(null);
            shiftForm.resetFields();
            setShiftModalOpen(true);
          }}
        >
          Tạo ca mới
        </Button>
      </div>

      {/* Shifts Table */}
      <Table
        {...shiftsTableProps}
        columns={shiftColumns}
        rowKey="id"
        scroll={{ x: 1000 }}
      />

      {/* Position Requirements Section */}
      {selectedShiftId && selectedShift && (
        <Card
          title={`Yêu cầu vị trí cho ca: ${selectedShift.name}`}
          style={{ marginTop: "24px" }}
          extra={
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setRequirementModalOpen(true)}
              >
                Thêm vị trí
              </Button>
              <Button size="small" onClick={() => setSelectedShiftId(null)}>
                Đóng
              </Button>
            </Space>
          }
        >
          <Table
            {...requirementsTableProps}
            columns={requirementColumns}
            rowKey="id"
            scroll={{ x: 600 }}
            pagination={false}
          />
        </Card>
      )}

      {/* Shift Modal */}
      <Modal
        title={editingShift ? "Chỉnh sửa ca" : "Tạo ca mới"}
        open={shiftModalOpen}
        onCancel={() => {
          setShiftModalOpen(false);
          setEditingShift(null);
          shiftForm.resetFields();
        }}
        onOk={handleShiftSubmit}
        width={600}
        okText={editingShift ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={shiftForm} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Loại ca"
            name="shift_type_id"
            rules={[{ required: true, message: "Vui lòng chọn loại ca" }]}
          >
            <Select placeholder="Chọn loại ca">
              <Select.Option value="morning">Ca sáng</Select.Option>
              <Select.Option value="afternoon">Ca chiều</Select.Option>
              <Select.Option value="night">Ca tối</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày"
            name="shift_date"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giờ bắt đầu"
                name="start_at"
                rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ kết thúc"
                name="end_at"
                rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Số người cần" name="total_required">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Position Requirement Modal */}
      <Modal
        title="Thêm yêu cầu vị trí"
        open={requirementModalOpen}
        onCancel={() => {
          setRequirementModalOpen(false);
          requirementForm.resetFields();
        }}
        onOk={handleAddRequirement}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={requirementForm} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Vị trí"
            name="position_id"
            rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
          >
            <Select {...positionSelectProps} placeholder="Chọn vị trí" showSearch />
          </Form.Item>

          <Form.Item
            label="Số lượng cần"
            name="required_count"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
