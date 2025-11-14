"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Select,
  message,
  Tabs,
  Space,
  Tag,
  Popconfirm,
  Popover,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useShiftTypes,
  useCreateShiftType,
  useUpdateShiftType,
  useDeleteShiftType,
  useShiftsList,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
} from "@/hooks/useShiftManagement";
import { useWeeklySchedules } from "@/hooks/useSchedule";
import CustomDataTable, {
  CustomColumnType,
} from "@/components/common/CustomDataTable";
import { Shift, ShiftType } from "@/types/schedule";
import { useList, useCreate } from "@refinedev/core";

export function ShiftManagementTab() {
  const [activeTab, setActiveTab] = useState("shift-types");
  const [isShiftTypeModalOpen, setIsShiftTypeModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isWeeklyScheduleModalOpen, setIsWeeklyScheduleModalOpen] =
    useState(false);
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(
    null
  );
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftTypeForm] = Form.useForm();
  const [shiftForm] = Form.useForm();
  const [weeklyScheduleForm] = Form.useForm();

  // Fetch data
  //   const { shiftTypes, isLoading: shiftTypesLoading, refetch: refetchShiftTypes } =
  //     useShiftTypes();
  const { query } = useList<ShiftType>({
    resource: "shift-types",
  });
  const {
    shifts,
    isLoading: shiftsLoading,
    refetch: refetchShifts,
  } = useShiftsList();
  const { schedules } = useWeeklySchedules();

  const {
    data,
    isLoading: shiftTypesLoading,
    refetch: refetchShiftTypes,
  } = query;
  const shiftTypes = (data?.data || []) as unknown as ShiftType[];

  // Mutations for Shift Types
  const { create: createShiftType } = useCreateShiftType();
  const { update: updateShiftType } = useUpdateShiftType();
  const { remove: deleteShiftType } = useDeleteShiftType();

  // Mutations for Shifts
  const { create: createShift } = useCreateShift();
  const { update: updateShift } = useUpdateShift();
  const { remove: deleteShift } = useDeleteShift();

  // Mutation for Weekly Schedule
  const { mutate: createWeeklySchedule } = useCreate();

  // Shift Type handlers
  const handleAddShiftType = () => {
    setEditingShiftType(null);
    shiftTypeForm.resetFields();
    setIsShiftTypeModalOpen(true);
  };

  const handleEditShiftType = (record: ShiftType) => {
    setEditingShiftType(record);
    shiftTypeForm.setFieldsValue({
      ...record,
      start_time: dayjs(record.start_time, "HH:mm:ss"),
      end_time: dayjs(record.end_time, "HH:mm:ss"),
    });
    setIsShiftTypeModalOpen(true);
  };

  const handleDeleteShiftType = async (id: string) => {
    try {
      await deleteShiftType(id);
      message.success("Xóa loại ca thành công!");
      refetchShiftTypes();
    } catch (error) {
      message.error("Xóa loại ca thất bại!");
    }
  };

  const handleShiftTypeSubmit = async (values: any) => {
    const data = {
      name: values.name,
      start_time: values.start_time.format("HH:mm:ss"),
      end_time: values.end_time.format("HH:mm:ss"),
      cross_midnight: values.cross_midnight || false,
      notes: values.notes,
    };

    try {
      if (editingShiftType) {
        await updateShiftType(editingShiftType.id, data);
        message.success("Cập nhật loại ca thành công!");
      } else {
        await createShiftType(data);
        message.success("Thêm loại ca thành công!");
      }
      setIsShiftTypeModalOpen(false);
      shiftTypeForm.resetFields();
      refetchShiftTypes();
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra!");
    }
  };

  // Shift handlers
  const handleAddShift = () => {
    setEditingShift(null);
    shiftForm.resetFields();
    setIsShiftModalOpen(true);
  };

  const handleEditShift = (record: Shift) => {
    setEditingShift(record);
    const shiftTypeId =
      typeof record.shift_type_id === "string"
        ? record.shift_type_id
        : record.shift_type_id.id;

    shiftForm.setFieldsValue({
      ...record,
      shift_type_id: shiftTypeId,
      shift_date: dayjs(record.shift_date),
      start_at: record.start_at ? dayjs(record.start_at) : null,
      end_at: record.end_at ? dayjs(record.end_at) : null,
    });
    setIsShiftModalOpen(true);
  };

  const handleDeleteShift = async (id: string) => {
    try {
      await deleteShift(id);
      message.success("Xóa ca làm việc thành công!");
      refetchShifts();
    } catch (error) {
      message.error("Xóa ca làm việc thất bại!");
    }
  };

  const handleShiftSubmit = async (values: any) => {
    const data = {
      schedule_id: values.schedule_id || null,
      shift_type_id: values.shift_type_id,
      shift_date: values.shift_date.format("YYYY-MM-DD"),
      start_at: values.start_at ? values.start_at.toISOString() : null,
      end_at: values.end_at ? values.end_at.toISOString() : null,
      total_required: values.total_required || null,
      notes: values.notes,
    };

    try {
      if (editingShift) {
        await updateShift(editingShift.id, data);
        message.success("Cập nhật ca làm việc thành công!");
      } else {
        await createShift(data);
        message.success("Thêm ca làm việc thành công!");
      }
      setIsShiftModalOpen(false);
      shiftForm.resetFields();
      refetchShifts();
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra!");
    }
  };

  const handleCreateWeeklySchedule = async (values: any) => {
  const startDate = values.start_date.toDate(); // Convert trước
  const iso = startDate.toISOString();

  createWeeklySchedule(
    {
      resource: "weekly-schedule/with-shifts",
      values: { start_date: iso },
    },
    {
      onSuccess: () => {
        message.success("Tạo lịch tuần mới thành công!");
        setIsWeeklyScheduleModalOpen(false);
        weeklyScheduleForm.resetFields();
        // refresh local lists where possible
        refetchShifts();
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.message ||
            "Có lỗi xảy ra khi tạo lịch tuần mới!"
        );
      },
    }
  );
};


  // Columns for Shift Types
  const shiftTypeColumns: CustomColumnType<ShiftType>[] = [
    {
      title: "Tên ca",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "start_time",
      key: "start_time",
      width: 150,
      render: (text) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {text}
        </Tag>
      ),
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "end_time",
      key: "end_time",
      width: 150,
      render: (text) => (
        <Tag icon={<ClockCircleOutlined />} color="purple">
          {text}
        </Tag>
      ),
    },
    {
      title: "Qua đêm",
      dataIndex: "cross_midnight",
      key: "cross_midnight",
      width: 120,
      render: (value) =>
        value ? <Tag color="orange">Có</Tag> : <Tag color="default">Không</Tag>,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: ShiftType) => (
        <Popover
          content={
            <Space direction="vertical">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditShiftType(record)}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xác nhận xóa loại ca?"
                description="Hành động này không thể hoàn tác."
                onConfirm={() => handleDeleteShiftType(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          }
          title="Thao tác"
          trigger="click"
        >
          <Button type="link">Thao tác</Button>
        </Popover>
      ),
    },
  ];

  // Columns for Shifts
  const shiftColumns: CustomColumnType<Shift>[] = [
    {
      title: "Loại ca",
      dataIndex: "shift_type_id",
      key: "shift_type_id",
      width: 150,
      render: (value) => {
        const shiftTypeId = typeof value === "string" ? value : value?.id;
        const shiftType = shiftTypes?.find(
          (st: ShiftType) => st.id === shiftTypeId
        );
        return <Tag color="blue">{shiftType?.name || "N/A"}</Tag>;
      },
    },
    {
      title: "Ngày",
      dataIndex: "shift_date",
      key: "shift_date",
      width: 150,
      render: (text) => (
        <Tag icon={<CalendarOutlined />} color="cyan">
          {dayjs(text).format("DD/MM/YYYY")}
        </Tag>
      ),
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "start_at",
      key: "start_at",
      width: 150,
      render: (text) =>
        text ? dayjs(text).format("HH:mm") : <Tag>Theo loại ca</Tag>,
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "end_at",
      key: "end_at",
      width: 150,
      render: (text) =>
        text ? dayjs(text).format("HH:mm") : <Tag>Theo loại ca</Tag>,
    },
    {
      title: "Số lượng yêu cầu",
      dataIndex: "total_required",
      key: "total_required",
      width: 150,
      render: (value) =>
        value !== null ? (
          <Tag color="green">{value} người</Tag>
        ) : (
          <Tag>Chưa xác định</Tag>
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
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: Shift) => (
        <Popover
          content={
            <Space direction="vertical">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditShift(record)}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xác nhận xóa ca làm việc?"
                description="Hành động này không thể hoàn tác."
                onConfirm={() => handleDeleteShift(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          }
          title="Thao tác"
          trigger="click"
        >
          <Button type="link">Thao tác</Button>
        </Popover>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "shift-types",
            label: (
              <span className="flex items-center gap-2">
                <ClockCircleOutlined />
                Loại ca làm việc
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Quản lý loại ca làm việc
                    </h3>
                    <p className="text-sm text-gray-500">
                      Định nghĩa các loại ca: Sáng, Trưa, Chiều, Tối
                    </p>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddShiftType}
                  >
                    Thêm loại ca
                  </Button>
                </div>

                <CustomDataTable<ShiftType>
                  data={shiftTypes}
                  columns={shiftTypeColumns}
                  loading={shiftTypesLoading}
                  rowKey="id"
                  searchable
                  searchPlaceholder="Tìm kiếm loại ca..."
                  showRefresh
                  onRefresh={() => refetchShiftTypes()}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                  }}
                />
              </div>
            ),
          },
          {
            key: "shifts",
            label: (
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                Ca làm việc
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Quản lý ca làm việc
                    </h3>
                    <p className="text-sm text-gray-500">
                      Ca làm việc cụ thể theo ngày và giờ
                    </p>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddShift}
                  >
                    Thêm ca làm việc
                  </Button>
                </div>

                <CustomDataTable<Shift>
                  data={shifts}
                  columns={shiftColumns}
                  loading={shiftsLoading}
                  rowKey="id"
                  searchable
                  searchPlaceholder="Tìm kiếm ca làm việc..."
                  showRefresh
                  onRefresh={() => refetchShifts()}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                  }}
                />
              </div>
            ),
          },
          {
            key: "weekly-schedule",
            label: (
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                Lịch tuần
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Quản lý lịch tuần</h3>
                  <Button
                    type="primary"
                    onClick={() => setIsWeeklyScheduleModalOpen(true)}
                  >
                    Tạo lịch tuần mới
                  </Button>
                </div>

                {/* Weekly Schedule Modal */}
                <Modal
                  title="Tạo lịch tuần mới"
                  open={isWeeklyScheduleModalOpen}
                  onCancel={() => {
                    setIsWeeklyScheduleModalOpen(false);
                    weeklyScheduleForm.resetFields();
                  }}
                  footer={null}
                >
                  <Form
                    form={weeklyScheduleForm}
                    layout="vertical"
                    onFinish={handleCreateWeeklySchedule}
                  >
                    <Form.Item
                      name="start_date"
                      label="Ngày bắt đầu tuần"
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                      ]}
                    >
                      <DatePicker className="w-full" format="DD/MM/YYYY" />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          setIsWeeklyScheduleModalOpen(false);
                          weeklyScheduleForm.resetFields();
                        }}
                      >
                        Hủy
                      </Button>
                      <Button type="primary" htmlType="submit">
                        Tạo mới
                      </Button>
                    </div>
                  </Form>
                </Modal>
              </div>
            ),
          },
        ]}
      />

      {/* Shift Type Modal */}
      <Modal
        title={editingShiftType ? "Chỉnh sửa loại ca" : "Thêm loại ca mới"}
        open={isShiftTypeModalOpen}
        onCancel={() => {
          setIsShiftTypeModalOpen(false);
          shiftTypeForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={shiftTypeForm}
          layout="vertical"
          onFinish={handleShiftTypeSubmit}
        >
          <Form.Item
            name="name"
            label="Tên loại ca"
            rules={[{ required: true, message: "Vui lòng nhập tên loại ca" }]}
          >
            <Input placeholder="VD: Ca sáng, Ca chiều..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="start_time"
              label="Giờ bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
            >
              <TimePicker format="HH:mm:ss" className="w-full" />
            </Form.Item>

            <Form.Item
              name="end_time"
              label="Giờ kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn giờ kết thúc" },
              ]}
            >
              <TimePicker format="HH:mm:ss" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="cross_midnight" valuePropName="checked">
            <Select placeholder="Ca có qua đêm không?">
              <Select.Option value={false}>Không qua đêm</Select.Option>
              <Select.Option value={true}>Qua đêm</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú về loại ca..." />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsShiftTypeModalOpen(false);
                shiftTypeForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingShiftType ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Shift Modal */}
      <Modal
        title={editingShift ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc mới"}
        open={isShiftModalOpen}
        onCancel={() => {
          setIsShiftModalOpen(false);
          shiftForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={shiftForm} layout="vertical" onFinish={handleShiftSubmit}>
          <Form.Item name="schedule_id" label="Lịch tuần (không bắt buộc)">
            <Select placeholder="Chọn lịch tuần" allowClear>
              {schedules.map((schedule) => (
                <Select.Option key={schedule.id} value={schedule.id}>
                  {dayjs(schedule.week_start).format("DD/MM/YYYY")} -{" "}
                  {dayjs(schedule.week_end).format("DD/MM/YYYY")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="shift_type_id"
            label="Loại ca"
            rules={[{ required: true, message: "Vui lòng chọn loại ca" }]}
          >
            <Select placeholder="Chọn loại ca">
              {shiftTypes.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name} ({type.start_time} - {type.end_time})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="shift_date"
            label="Ngày làm việc"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="start_at"
              label="Giờ bắt đầu (tùy chỉnh)"
              tooltip="Để trống nếu dùng giờ mặc định của loại ca"
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="end_at"
              label="Giờ kết thúc (tùy chỉnh)"
              tooltip="Để trống nếu dùng giờ mặc định của loại ca"
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="total_required"
            label="Số lượng nhân viên yêu cầu"
            tooltip="Tổng số nhân viên cần cho ca này"
          >
            <InputNumber
              min={0}
              className="w-full"
              placeholder="VD: 5"
              addonAfter="người"
            />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú về ca làm việc..." />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsShiftModalOpen(false);
                shiftForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingShift ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
