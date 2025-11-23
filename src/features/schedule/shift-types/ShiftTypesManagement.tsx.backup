"use client";

import { useState } from "react";
import { useTable, useSelect } from "@refinedev/antd";
import { useCreate, useUpdate, useDelete, useList } from "@refinedev/core";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  TimePicker,
  App,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface ShiftType {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  cross_midnight?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * ShiftTypesManagement - Quản lý Loại Ca Làm Việc
 * 
 * Chức năng:
 * - CRUD loại ca (Sáng, Chiều, Tối, v.v.)
 * - Cấu hình thời gian bắt đầu/kết thúc
 * - Đánh dấu ca qua đêm (cross_midnight)
 * 
 * Luồng: Sau khi tạo loại ca → Dùng khi tạo lịch tuần
 */
export function ShiftTypesManagement() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null);

  // Fetch shift types
  const { tableProps } = useTable<ShiftType>({
    resource: "shift-types",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    },
  });

  const { query: shiftTypesQuery } = useList<ShiftType>({
    resource: "shift-types",
  });

  const shiftTypes = shiftTypesQuery.data?.data || [];

  // Mutations
  const { mutate: createShiftType } = useCreate();
  const { mutate: updateShiftType } = useUpdate();
  const { mutate: deleteShiftType } = useDelete();

  // Stats
  const stats = {
    total: shiftTypes.length,
    active: shiftTypes.filter((s: ShiftType) => !s.cross_midnight).length,
    overnight: shiftTypes.filter((s: ShiftType) => s.cross_midnight).length,
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const shiftTypeData = {
        name: values.name,
        start_time: values.start_time ? dayjs(values.start_time).format("HH:mm:ss") : "00:00:00",
        end_time: values.end_time ? dayjs(values.end_time).format("HH:mm:ss") : "00:00:00",
        cross_midnight: values.cross_midnight || false,
        notes: values.notes || null,
      };

      if (editingShiftType) {
        updateShiftType(
          {
            resource: "shift-types",
            id: editingShiftType.id,
            values: shiftTypeData,
          },
          {
            onSuccess: () => {
              message.success("Cập nhật loại ca thành công");
              setModalOpen(false);
              setEditingShiftType(null);
              form.resetFields();
              shiftTypesQuery.refetch();
            },
            onError: (error: any) => {
              message.error(error?.message || "Có lỗi xảy ra");
            },
          }
        );
      } else {
        createShiftType(
          {
            resource: "shift-types",
            values: shiftTypeData,
          },
          {
            onSuccess: () => {
              message.success("Tạo loại ca thành công");
              setModalOpen(false);
              form.resetFields();
              shiftTypesQuery.refetch();
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

  // Handle delete
  const handleDelete = (id: string) => {
    deleteShiftType(
      {
        resource: "shift-types",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa loại ca thành công");
          shiftTypesQuery.refetch();
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  // Handle edit
  const handleEdit = (record: ShiftType) => {
    setEditingShiftType(record);
    form.setFieldsValue({
      name: record.name,
      start_time: record.start_time ? dayjs(record.start_time, "HH:mm:ss") : null,
      end_time: record.end_time ? dayjs(record.end_time, "HH:mm:ss") : null,
      cross_midnight: record.cross_midnight || false,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: "Tên loại ca",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_: any, record: ShiftType) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {record.start_time} - {record.end_time}
        </div>
      ),
    },
    {
      title: "Qua đêm",
      dataIndex: "cross_midnight",
      key: "cross_midnight",
      width: 100,
      render: (cross: boolean) => (
        <Tag color={cross ? "orange" : "default"}>
          {cross ? "Có" : "Không"}
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
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: ShiftType) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa loại ca"
            description="Bạn có chắc muốn xóa loại ca này?"
            onConfirm={() => handleDelete(record.id)}
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

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Quản lý Loại Ca Làm Việc</h1>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng loại ca"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca thường"
              value={stats.active}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca qua đêm"
              value={stats.overnight}
              valueStyle={{ color: "#fa8c16" }}
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
            setEditingShiftType(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Tạo loại ca mới
        </Button>
      </div>

      {/* Table */}
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1000 }}
      />

      {/* Modal */}
      <Modal
        title={editingShiftType ? "Chỉnh sửa loại ca" : "Tạo loại ca mới"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingShiftType(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        width={600}
        okText={editingShiftType ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Tên loại ca"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên loại ca" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng, Ca chiều, Ca tối" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giờ bắt đầu"
                name="start_time"
                rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ kết thúc"
                name="end_time"
                rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ca qua đêm"
            name="cross_midnight"
            valuePropName="checked"
            tooltip="Đánh dấu nếu ca làm việc kéo dài qua 00:00"
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về loại ca này" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
