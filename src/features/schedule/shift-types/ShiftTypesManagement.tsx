"use client";

import { useState } from "react";
import { useTable } from "@refinedev/antd";
import { useCreate, useUpdate, useDelete, useGetIdentity } from "@refinedev/core";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  TimePicker,
  Switch,
  App,
  Space,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs, { DATE_FORMATS } from "@/lib/dayjs";
import type { ShiftType, CreateShiftTypeDto, UpdateShiftTypeDto } from "@/types/schedule";
import { useCanManageSchedule } from "@/hooks/usePermissions";

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Shift Types Management - Manager Only
 * 
 * RBAC: Dynamic permissions based on user's role policies
 * 
 * Features:
 * - CRUD operations for shift types (morning, afternoon, evening, night)
 * - Define start/end times for each shift type
 * - Mark if shift crosses midnight
 * - Based on BE shift-type.dto.ts
 */
export function ShiftTypesManagement() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // RBAC: Dynamic permission check
  const canManage = useCanManageSchedule();

  // Fetch shift types with meta fields
  const { tableProps } = useTable<ShiftType>({
    resource: "shift-types",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    },
    meta: {
      fields: ["*"],
    },
  });

  // Mutations
  const { mutate: createShiftType } = useCreate();
  const { mutate: updateShiftType } = useUpdate();
  const { mutate: deleteShiftType } = useDelete();

  // Handle create/update
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Build DTO according to BE schema
      const dto: CreateShiftTypeDto | UpdateShiftTypeDto = {
        name: values.name,
        start_time: values.start_time.format(DATE_FORMATS.TIME_ONLY),
        end_time: values.end_time.format(DATE_FORMATS.TIME_ONLY),
        cross_midnight: values.cross_midnight || null,
        notes: values.notes || null,
      };

      if (editingId) {
        updateShiftType(
          {
            resource: "shift-types",
            id: editingId,
            values: dto,
          },
          {
            onSuccess: () => {
              message.success("Cập nhật loại ca thành công!");
              handleCloseModal();
            },
            onError: (error: any) => {
              message.error(error?.message || "Có lỗi xảy ra khi cập nhật");
            },
          }
        );
      } else {
        createShiftType(
          {
            resource: "shift-types",
            values: dto,
          },
          {
            onSuccess: () => {
              message.success("Tạo loại ca thành công!");
              handleCloseModal();
            },
            onError: (error: any) => {
              message.error(error?.message || "Có lỗi xảy ra khi tạo loại ca");
            },
          }
        );
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Handle edit
  const handleEdit = (record: ShiftType) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      start_time: dayjs(record.start_time, "HH:mm:ss"),
      end_time: dayjs(record.end_time, "HH:mm:ss"),
      cross_midnight: record.cross_midnight || false,
      notes: record.notes,
    });
    setModalOpen(true);
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
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra khi xóa");
        },
      }
    );
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  // RBAC Check: Only managers can access
  if (!canManage) {
    return (
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
            <WarningOutlined style={{ fontSize: "64px", color: "#faad14" }} />
            <Title level={3}>Bạn không có quyền truy cập trang này</Title>
            <Text type="secondary">
              Chỉ Quản lý mới có thể quản lý loại ca làm việc.
            </Text>
          </Space>
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: "Tên loại ca",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "start_time",
      key: "start_time",
      width: 130,
      render: (time: string) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {time}
        </Tag>
      ),
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "end_time",
      key: "end_time",
      width: 130,
      render: (time: string) => (
        <Tag icon={<ClockCircleOutlined />} color="green">
          {time}
        </Tag>
      ),
    },
    {
      title: "Qua đêm",
      dataIndex: "cross_midnight",
      key: "cross_midnight",
      width: 100,
      align: "center" as const,
      render: (cross: boolean | null) =>
        cross ? <Tag color="orange">Có</Tag> : <Tag>Không</Tag>,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (notes: string | null) => notes || <Text type="secondary">-</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string | null) =>
        date ? dayjs(date).format(DATE_FORMATS.DISPLAY_DATETIME) : "-",
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
            description="Bạn có chắc muốn xóa loại ca này? Điều này có thể ảnh hưởng đến các ca làm việc đã tạo."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: tableProps.dataSource?.length || 0,
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ marginBottom: "8px" }}>
              <ClockCircleOutlined /> Quản Lý Loại Ca
            </Title>
            <Text type="secondary">
              Tạo và quản lý các loại ca làm việc (sáng, trưa, chiều, tối...)
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Tạo Loại Ca
            </Button>
          </Col>
        </Row>
      </div>

      {/* Info Alert */}
      <Alert
        message="Thông tin"
        description="Loại ca định nghĩa khung giờ làm việc cố định. Sau khi tạo loại ca, bạn có thể sử dụng chúng khi tạo lịch tuần và ca làm việc cụ thể."
        type="info"
        showIcon
        closable
        style={{ marginBottom: "24px" }}
      />

      {/* Statistics */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng số loại ca"
              value={stats.total}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row> */}

      {/* Table */}
      <Card>
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            <ClockCircleOutlined />
            <span>{editingId ? "Chỉnh Sửa Loại Ca" : "Tạo Loại Ca Mới"}</span>
          </Space>
        }
        open={modalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        width={600}
        okText={editingId ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Tên loại ca"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại ca" },
              { min: 2, message: "Tên loại ca phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="VD: Ca sáng, Ca chiều, Ca tối..." size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Giờ bắt đầu"
                name="start_time"
                rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
              >
                <TimePicker
                  format="HH:mm:ss"
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Chọn giờ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giờ kết thúc"
                name="end_time"
                rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
              >
                <TimePicker
                  format="HH:mm:ss"
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Chọn giờ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ca qua đêm"
            name="cross_midnight"
            valuePropName="checked"
            extra="Đánh dấu nếu ca làm việc này kéo dài qua nửa đêm (VD: 22:00 - 06:00)"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item label="Ghi chú (không bắt buộc)" name="notes">
            <TextArea
              rows={3}
              placeholder="Ghi chú về loại ca này..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
