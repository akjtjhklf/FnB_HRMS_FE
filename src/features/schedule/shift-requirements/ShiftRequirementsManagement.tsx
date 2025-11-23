"use client";

import { useState } from "react";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import {
  Card,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  message,
  Table,
  Space,
  Popconfirm,
  Tag,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SaveOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type {
  ShiftPositionRequirement,
  CreateShiftPositionRequirementDto,
  UpdateShiftPositionRequirementDto,
} from "@/types/schedule/shift-position-requirement.types";
import type { Shift } from "@/types/schedule/shift.types";
import type { Position } from "@/types/employee";
import type { WeeklySchedule } from "@/types/schedule/weekly-schedule.types";

export function ShiftRequirementsManagement() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<ShiftPositionRequirement | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");

  // Fetch schedules
  const { query: schedulesQuery } = useList<WeeklySchedule>({
    resource: "weekly-schedules",
    filters: [{ field: "status", operator: "in", value: ["draft", "published"] }],
  });
  const schedules = schedulesQuery.data?.data || [];

  // Fetch shifts for selected schedule
  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    queryOptions: { enabled: !!selectedSchedule },
    filters: selectedSchedule
      ? [{ field: "schedule_id", operator: "eq", value: selectedSchedule }]
      : [],
    meta: { fields: ["*", "shift_type.*"] },
  });
  const shifts = shiftsQuery.data?.data || [];

  // Fetch positions
  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
    pagination: { pageSize: 100 },
  });
  const positions = positionsQuery.data?.data || [];

  // Fetch requirements for selected schedule's shifts with pagination
  const shiftIds = shifts.map((s: any) => s.id);
  const { tableProps, tableQuery: requirementsQuery } = useTable<ShiftPositionRequirement>({
    resource: "shift-position-requirements",
    queryOptions: { enabled: shiftIds.length > 0 },
    filters: {
      permanent: shiftIds.length > 0
        ? [{ field: "shift_id", operator: "in", value: shiftIds }]
        : [],
    },
    pagination: {
      pageSize: 20,
    },
    meta: { fields: ["*", "position.*"] },
  });

  const { mutate: createRequirement, mutation: createMutation } = useCreate<ShiftPositionRequirement>();
  const { mutate: updateRequirement, mutation: updateMutation } = useUpdate<ShiftPositionRequirement>();
  const { mutate: deleteRequirement } = useDelete<ShiftPositionRequirement>();

  const handleOpenModal = (requirement?: ShiftPositionRequirement) => {
    if (requirement) {
      setEditingRequirement(requirement);
      form.setFieldsValue(requirement);
    } else {
      setEditingRequirement(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRequirement(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateShiftPositionRequirementDto | UpdateShiftPositionRequirementDto = values;

      if (editingRequirement) {
        updateRequirement(
          {
            resource: "shift-position-requirements",
            id: editingRequirement.id,
            values: data,
          },
          {
            onSuccess: () => {
              message.success("Cập nhật yêu cầu thành công");
              handleCloseModal();
              requirementsQuery.refetch();
            },
            onError: (error: any) => {
              message.error(error?.message || "Cập nhật yêu cầu thất bại");
            },
          }
        );
      } else {
        createRequirement(
          {
            resource: "shift-position-requirements",
            values: data,
          },
          {
            onSuccess: () => {
              message.success("Tạo yêu cầu thành công");
              handleCloseModal();
              requirementsQuery.refetch();
            },
            onError: (error: any) => {
              message.error(error?.message || "Tạo yêu cầu thất bại");
            },
          }
        );
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleDelete = (requirementId: string) => {
    deleteRequirement(
      {
        resource: "shift-position-requirements",
        id: requirementId,
      },
      {
        onSuccess: () => {
          message.success("Xóa yêu cầu thành công");
          requirementsQuery.refetch();
        },
        onError: (error: any) => {
          message.error(error?.message || "Xóa yêu cầu thất bại");
        },
      }
    );
  };

  const columns = [
    {
      title: "Ca làm việc",
      dataIndex: "shift_id",
      key: "shift_id",
      render: (shiftId: string) => {
        const shift = shifts.find((s: any) => s.id === shiftId) as any;
        if (!shift) return "-";
        const shiftType = shift.shift_type || {};
        return (
          <div>
            <Tag color={shiftType.color_code || "blue"}>
              {shiftType.name || shiftType.type_name || "N/A"}
            </Tag>
            <div className="text-xs text-gray-500 mt-1">
              {dayjs(shift.shift_date).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      },
    },
    {
      title: "Vị trí",
      dataIndex: "position_id",
      key: "position_id",
      render: (_: any, record: any) => {
        const position = record.position || positions.find((p: any) => p.id === record.position_id);
        return (
          <span className="font-medium text-gray-900">
            {position?.name || "N/A"}
          </span>
        );
      },
    },
    {
      title: "Số lượng cần",
      dataIndex: "required_count",
      key: "required_count",
      width: 120,
      render: (count: number) => (
        <Tag color="green" className="text-base font-semibold">
          {count} người
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => (
        <span className="text-gray-600">{notes || "-"}</span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_: any, record: ShiftPositionRequirement) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Xóa yêu cầu này?"
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
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <TeamOutlined className="text-blue-600" />
              Yêu cầu Vị trí cho Ca
            </h2>
            <p className="text-gray-600 mt-1">
              Quản lý số lượng nhân viên cần thiết cho mỗi vị trí trong ca
            </p>
          </div>
          {selectedSchedule && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              size="large"
            >
              Thêm yêu cầu
            </Button>
          )}
        </div>

        <div className="mt-4">
          <Select
            placeholder="Chọn lịch tuần"
            value={selectedSchedule}
            onChange={setSelectedSchedule}
            className="w-full md:w-96"
            size="large"
            options={schedules.map((s: any) => ({
              label: `${s.schedule_name || "Lịch tuần"} (${dayjs(s.week_start).format("DD/MM")} - ${dayjs(s.week_end).format("DD/MM")})`,
              value: s.id,
            }))}
          />
        </div>
      </Card>

      {selectedSchedule ? (
        <Card>
          <Table
            {...tableProps}
            columns={columns}
            rowKey="id"
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
          />
        </Card>
      ) : (
        <Card>
          <Empty description="Vui lòng chọn lịch tuần để xem yêu cầu vị trí" />
        </Card>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-600" />
            <span>{editingRequirement ? "Chỉnh sửa yêu cầu" : "Thêm yêu cầu mới"}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={<><SaveOutlined /> {editingRequirement ? "Cập nhật" : "Tạo"}</>}
        cancelText="Hủy"
        width={600}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="shift_id"
            label="Ca làm việc"
            rules={[{ required: true, message: "Vui lòng chọn ca làm việc" }]}
          >
            <Select
              placeholder="Chọn ca làm việc"
              showSearch
              filterOption={(input, option) =>
                (option?.label?.toString() ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={shifts.map((shift: any) => {
                const shiftType = shift.shift_type || {};
                return {
                  label: `${shiftType.name || shiftType.type_name || "N/A"} - ${dayjs(shift.shift_date).format("DD/MM/YYYY")}`,
                  value: shift.id,
                };
              })}
            />
          </Form.Item>

          <Form.Item
            name="position_id"
            label="Vị trí"
            rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
          >
            <Select
              placeholder="Chọn vị trí"
              options={positions.map((p: any) => ({
                label: p.name,
                value: p.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="required_count"
            label="Số lượng cần"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber
              min={1}
              className="w-full"
              placeholder="Số người cần cho vị trí này"
            />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ShiftRequirementsManagement;
