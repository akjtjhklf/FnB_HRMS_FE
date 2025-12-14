"use client";

import { useState } from "react";
import { useTable } from "@refinedev/antd";
import { useCreate, useUpdate, useDelete, useList, useCustom } from "@refinedev/core";
import {
  Table,
  Button,
  Modal,
  Form,
  App,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Alert,
  Descriptions,
  Input,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ThunderboltOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs, { DATE_FORMATS } from "@/lib/dayjs";

interface ScheduleAssignment {
  id: string;
  shift_id: string;
  employee_id: string;
  position_id: string;
  assigned_by?: string;
  assigned_at?: string;
  notes?: string;
  shift?: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    shift_type?: {
      name: string;
    };
  };
  employee?: {
    id: string;
    full_name: string;
  };
  position?: {
    id: string;
    name: string;
  };
}

interface Shift {
  id: string;
  weekly_schedule_id: string;
  date: string;
  start_time: string;
  end_time: string;
  shift_type?: {
    name: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
}

interface Position {
  id: string;
  name: string;
}

interface WeeklySchedule {
  id: string;
  week_start: string;
  week_end: string;
  status: string;
}

/**
 * AssignmentManagement - Quản lý Phân công Ca làm việc
 * 
 * Chức năng:
 * - Xem danh sách phân công hiện tại
 * - Phân công thủ công: chọn ca + nhân viên + vị trí
 * - Phân công tự động: gọi API auto-schedule
 * - Xem khả năng đăng ký của nhân viên
 * - Sửa/xóa phân công
 * 
 * Luồng:
 * 1. Chọn lịch tuần đã công bố
 * 2. Xem các ca và khả năng đăng ký
 * 3. Phân công thủ công hoặc tự động
 * 4. Kiểm tra xung đột
 */
export function AssignmentManagement() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ScheduleAssignment | null>(null);
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [selectedWeeklyScheduleId, setSelectedWeeklyScheduleId] = useState<string | null>(null);

  // Fetch assignments
  const { tableProps } = useTable<ScheduleAssignment>({
    resource: "schedule-assignments",
    sorters: {
      initial: [{ field: "assigned_at", order: "desc" }],
    },
  });

  const { query: assignmentsQuery } = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
  });

  // Fetch weekly schedules (published only)
  const { query: schedulesQuery } = useList<WeeklySchedule>({
    resource: "weekly-schedules",
    // filters: [
    //   {
    //     field: "status",
    //     operator: "eq",
    //     value: "published",
    //   },
    // ],
  });

  // Fetch shifts for selected schedule
  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    filters: selectedWeeklyScheduleId
      ? [
        {
          field: "weekly_schedule_id",
          operator: "eq",
          value: selectedWeeklyScheduleId,
        },
      ]
      : [],
    queryOptions: {
      enabled: !!selectedWeeklyScheduleId || assignModalOpen,
    },
  });

  // Fetch employees
  const { query: employeesQuery } = useList<Employee>({
    resource: "employees",
  });

  // Fetch positions
  const { query: positionsQuery } = useList<Position>({
    resource: "positions",
  });

  const assignments = assignmentsQuery.data?.data || [];
  const schedules = schedulesQuery.data?.data || [];
  const shifts = shiftsQuery.data?.data || [];
  const employees = employeesQuery.data?.data || [];
  const positions = positionsQuery.data?.data || [];

  // Mutations
  const { mutate: createAssignment } = useCreate();
  const { mutate: updateAssignment } = useUpdate();
  const { mutate: deleteAssignment } = useDelete();

  // Auto-schedule - we'll use useCustomMutation instead
  const autoScheduleMutation = useCustom<any>({
    url: `${process.env.NEXT_PUBLIC_API_URL}/schedule-assignments/auto-schedule`,
    method: "post",
    config: {
      payload: {
        weekly_schedule_id: selectedWeeklyScheduleId,
      },
    },
    queryOptions: {
      enabled: false,
    },
  });

  // Stats
  const stats = {
    total: assignments.length,
    thisWeek: assignments.filter((a: ScheduleAssignment) => {
      if (!a.shift?.date) return false;
      const shiftDate = dayjs(a.shift.date);
      return shiftDate.isSame(dayjs(), "week");
    }).length,
    unassigned: shifts.length - assignments.length,
  };

  // Handle manual assign
  const handleAssign = async () => {
    try {
      const values = await form.validateFields();

      createAssignment(
        {
          resource: "schedule-assignments",
          values: {
            shift_id: values.shift_id,
            employee_id: values.employee_id,
            position_id: values.position_id,
            notes: values.notes || null,
          },
        },
        {
          onSuccess: () => {
            message.success("Phân công thành công!");
            setAssignModalOpen(false);
            form.resetFields();
            assignmentsQuery.refetch();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi phân công");
          },
        }
      );
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Handle auto-schedule
  const handleAutoSchedule = () => {
    if (!selectedWeeklyScheduleId) {
      message.warning("Vui lòng chọn lịch tuần trước");
      return;
    }

    setAutoScheduling(true);
    createAssignment(
      {
        resource: "schedule-assignments/auto-schedule",
        values: {
          weekly_schedule_id: selectedWeeklyScheduleId,
        },
      },
      {
        onSuccess: () => {
          message.success("Phân công tự động thành công!");
          assignmentsQuery.refetch();
          setAutoScheduling(false);
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra khi phân công tự động");
          setAutoScheduling(false);
        },
      }
    );
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteAssignment(
      {
        resource: "schedule-assignments",
        id,
      },
      {
        onSuccess: () => {
          message.success("Xóa phân công thành công");
          assignmentsQuery.refetch();
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  const columns = [
    {
      title: "Ca làm việc",
      key: "shift",
      render: (_: any, record: ScheduleAssignment) => {
        if (!record.shift) return "Chưa có";
        return (
          <div>
            <div>
              <strong>{record.shift.shift_type?.name || "Ca làm việc"}</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              {dayjs(record.shift.date).format(DATE_FORMATS.DISPLAY_DATE)} - {record.shift.start_time} → {record.shift.end_time}
            </div>
          </div>
        );
      },
    },
    {
      title: "Nhân viên",
      key: "employee",
      render: (_: any, record: ScheduleAssignment) => (
        <Space>
          <UserOutlined />
          <span>{record.employee?.full_name || "Chưa có"}</span>
        </Space>
      ),
    },
    {
      title: "Vị trí",
      key: "position",
      render: (_: any, record: ScheduleAssignment) => (
        <Tag color="blue">{record.position?.name || "Chưa có"}</Tag>
      ),
    },
    {
      title: "Phân công lúc",
      dataIndex: "assigned_at",
      key: "assigned_at",
      width: 150,
      render: (date: string) => date ? dayjs(date).format(DATE_FORMATS.DISPLAY_DATETIME) : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: ScheduleAssignment) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAssignment(record);
              setViewModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
          <Popconfirm
            title="Xóa phân công"
            description="Bạn có chắc muốn xóa phân công này?"
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
      <h1 style={{ marginBottom: "24px" }}>Quản lý Phân công Ca làm việc</h1>

      <Alert
        message="Hướng dẫn"
        description="Chọn lịch tuần để xem các ca cần phân công. Bạn có thể phân công thủ công hoặc sử dụng thuật toán tự động dựa trên khả năng đăng ký của nhân viên."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng phân công"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tuần này"
              value={stats.thisWeek}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca chưa phân công"
              value={stats.unassigned}
              valueStyle={{ color: stats.unassigned > 0 ? "#cf1322" : "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Schedule selector */}
      <Card style={{ marginBottom: "16px" }}>
        <Form layout="inline">
          <Form.Item label="Chọn lịch tuần">
            <Select
              style={{ width: 300 }}
              placeholder="Chọn lịch tuần"
              value={selectedWeeklyScheduleId}
              onChange={(value) => setSelectedWeeklyScheduleId(value)}
              loading={schedulesQuery.isLoading}
            >
              {schedules.map((schedule: WeeklySchedule) => (
                <Select.Option key={schedule.id} value={schedule.id}>
                  Tuần {dayjs(schedule.week_start).isoWeek()} ({dayjs(schedule.week_start).format("DD/MM")} - {dayjs(schedule.week_end).format("DD/MM")})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Card>

      {/* Action buttons */}
      <Space style={{ marginBottom: "16px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setAssignModalOpen(true);
          }}
        >
          Phân công thủ công
        </Button>
        <Button
          type="default"
          icon={<ThunderboltOutlined />}
          onClick={handleAutoSchedule}
          loading={autoScheduling}
          disabled={!selectedWeeklyScheduleId}
        >
          Phân công tự động
        </Button>
      </Space>

      {/* Table */}
      <Table
        {...tableProps}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1000 }}
      />

      {/* Assign Modal */}
      <Modal
        title="Phân công thủ công"
        open={assignModalOpen}
        onCancel={() => {
          setAssignModalOpen(false);
          form.resetFields();
        }}
        onOk={handleAssign}
        width={700}
        okText="Phân công"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Alert
            message="Lưu ý"
            description="Chọn ca làm việc, nhân viên và vị trí để phân công. Hệ thống sẽ kiểm tra xung đột."
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />

          <Form.Item
            label="Chọn ca làm việc"
            name="shift_id"
            rules={[{ required: true, message: "Vui lòng chọn ca" }]}
          >
            <Select
              placeholder="Chọn ca làm việc"
              showSearch
              optionFilterProp="children"
              loading={shiftsQuery.isLoading}
            >
              {shifts.map((shift: Shift) => (
                <Select.Option key={shift.id} value={shift.id}>
                  {shift.shift_type?.name || "Ca làm việc"} - {dayjs(shift.date).format(DATE_FORMATS.DISPLAY_DATE)} ({shift.start_time} - {shift.end_time})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Chọn nhân viên"
            name="employee_id"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="children"
              loading={employeesQuery.isLoading}
            >
              {employees.map((employee: Employee) => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Chọn vị trí"
            name="position_id"
            rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
          >
            <Select
              placeholder="Chọn vị trí"
              loading={positionsQuery.isLoading}
            >
              {positions.map((position: Position) => (
                <Select.Option key={position.id} value={position.id}>
                  {position.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={2} placeholder="Ghi chú về phân công (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Chi tiết phân công"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedAssignment(null);
        }}
        footer={
          <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
        }
        width={700}
      >
        {selectedAssignment && (
          <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
            <Descriptions.Item label="Ca làm việc">
              {selectedAssignment.shift ? (
                <>
                  {selectedAssignment.shift.shift_type?.name || "Ca làm việc"} <br />
                  {dayjs(selectedAssignment.shift.date).format(DATE_FORMATS.DISPLAY_DATE)} - {selectedAssignment.shift.start_time} → {selectedAssignment.shift.end_time}
                </>
              ) : (
                "Chưa có"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên">
              {selectedAssignment.employee?.full_name || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí">
              <Tag color="blue">{selectedAssignment.position?.name || "Chưa có"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phân công lúc">
              {selectedAssignment.assigned_at ? dayjs(selectedAssignment.assigned_at).format(DATE_FORMATS.DISPLAY_DATETIME) : "-"}
            </Descriptions.Item>
            {selectedAssignment.notes && (
              <Descriptions.Item label="Ghi chú">
                {selectedAssignment.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
