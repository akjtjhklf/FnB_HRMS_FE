"use client";

import { useState } from "react";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Table,
  Space,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { Position, CreatePositionDto, UpdatePositionDto } from "@/types/employee";

export function PositionsManagement() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
    pagination: { pageSize: 100 },
  });
  const positions = positionsQuery.data?.data || [];
  const isLoading = positionsQuery.isLoading;

  const { mutate: createPosition, mutation: createMutation } = useCreate<Position>();
  const { mutate: updatePosition, mutation: updateMutation } = useUpdate<Position>();
  const { mutate: deletePosition } = useDelete<Position>();

  const handleOpenModal = (position?: Position) => {
    if (position) {
      setEditingPosition(position);
      form.setFieldsValue(position);
    } else {
      setEditingPosition(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPosition(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreatePositionDto | UpdatePositionDto = values;

      if (editingPosition) {
        updatePosition(
          {
            resource: "positions",
            id: editingPosition.id,
            values: data,
          },
          {
            onSuccess: () => {
              message.success("Cập nhật vị trí thành công");
              handleCloseModal();
            },
            onError: (error: any) => {
              message.error(error?.message || "Cập nhật vị trí thất bại");
            },
          }
        );
      } else {
        createPosition(
          {
            resource: "positions",
            values: data,
          },
          {
            onSuccess: () => {
              message.success("Tạo vị trí thành công");
              handleCloseModal();
            },
            onError: (error: any) => {
              message.error(error?.message || "Tạo vị trí thất bại");
            },
          }
        );
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleDelete = (positionId: string) => {
    deletePosition(
      {
        resource: "positions",
        id: positionId,
      },
      {
        onSuccess: () => {
          message.success("Xóa vị trí thành công");
        },
        onError: (error: any) => {
          message.error(error?.message || "Xóa vị trí thất bại");
        },
      }
    );
  };

  const columns = [
    {
      title: "Tên vị trí",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => (
        <span className="text-gray-700">{desc || "-"}</span>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "is_priority",
      key: "is_priority",
      width: 100,
      render: (isPriority: boolean) => (
        <Tag color={isPriority ? "red" : "default"}>
          {isPriority ? "Cao" : "Thấp"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_: any, record: Position) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Xóa vị trí này?"
            description="Bạn có chắc chắn muốn xóa vị trí này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
              <TeamOutlined className="text-blue-600" />
              Quản lý Vị trí
            </h2>
            <p className="text-gray-700 mt-1">
              Quản lý các vị trí làm việc trong ca
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            size="large"
          >
            Thêm vị trí
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={positions}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} vị trí`,
          }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-600" />
            <span>{editingPosition ? "Chỉnh sửa vị trí" : "Thêm vị trí mới"}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={<><SaveOutlined /> {editingPosition ? "Cập nhật" : "Tạo"}</>}
        cancelText="Hủy"
        width={600}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên vị trí"
            rules={[{ required: true, message: "Vui lòng nhập tên vị trí" }]}
          >
            <Input placeholder="Ví dụ: Phục vụ, Thu ngân, Bếp..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả chi tiết về vị trí này..."
            />
          </Form.Item>

          <Form.Item
            name="is_priority"
            label="Vị trí ưu tiên"
            tooltip="Vị trí ưu tiên sẽ được xếp trước trong thuật toán xếp lịch tự động"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PositionsManagement;
