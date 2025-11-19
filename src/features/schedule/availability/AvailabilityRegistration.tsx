"use client";

import { useState, useMemo } from "react";
import { useTable } from "@refinedev/antd";
import { useCreate, useDelete, useList, useGetIdentity } from "@refinedev/core";
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
  Calendar,
  Badge,
  Divider,
  Typography,
  Tooltip,
  Input,
} from "antd";

const { TextArea } = Input;
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { BadgeProps } from "antd";

const { Title, Text } = Typography;

interface User {
  id: string;
  employee_id: string;
  role: string;
}

interface EmployeeAvailability {
  id: string;
  employee_id: string;
  shift_id: string;
  priority?: number;
  note?: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  shift?: Shift;
}

interface Shift {
  id: string;
  weekly_schedule_id: string;
  shift_type_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status?: string;
  shift_type?: {
    id: string;
    name: string;
    description?: string;
  };
  weekly_schedule?: {
    id: string;
    status: string;
    start_date: string;
    end_date: string;
  };
}

interface Position {
  id: string;
  name: string;
}

/**
 * AvailabilityRegistration - Đăng ký Khả năng Làm việc
 * 
 * Chức năng:
 * - Xem lịch ca làm việc dưới dạng Calendar
 * - Click vào ngày để đăng ký ca
 * - Priority tự động theo role (Manager: 10, Senior: 7, Junior: 5)
 * - Xem trạng thái đăng ký (pending/approved/rejected)
 * 
 * Luồng:
 * 1. Xem Calendar với các ca đã công bố
 * 2. Click vào ngày → chọn ca
 * 3. Gửi đăng ký (priority tự động)
 */
export function AvailabilityRegistration() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<EmployeeAvailability | null>(null);

  // Get current user
  const { data: user } = useGetIdentity<User>();

  // Auto calculate priority based on role
  const getPriorityByRole = (role: string): number => {
    const rolePriority: Record<string, number> = {
      manager: 10,
      "team_lead": 8,
      senior: 7,
      staff: 5,
      junior: 3,
    };
    const roleKey = typeof role === 'string' ? role.toLowerCase() : 'staff';
    return rolePriority[roleKey] || 5;
  };

  const userPriority = useMemo(() => {
    return user?.role ? getPriorityByRole(user.role) : 5;
  }, [user]);

  // Fetch user's availabilities
  const { tableProps } = useTable<EmployeeAvailability>({
    resource: "employee-availability",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    },
    meta: {
      fields: ["*", "shift.id", "shift.shift_date", "shift.start_time", "shift.end_time", "shift.shift_type.name"],
    },
  });

  const { query: availabilitiesQuery } = useList<EmployeeAvailability>({
    resource: "employee-availability",
    meta: {
      fields: ["*", "shift.id", "shift.shift_date", "shift.shift_type.name"],
    },
  });

  // Fetch published shifts
  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    pagination: { pageSize: 1000 },
    filters: [
      {
        field: "weekly_schedule.status",
        operator: "eq",
        value: "published",
      },
    ],
    meta: {
      fields: [
        "*",
        "shift_type.id",
        "shift_type.name",
        "shift_type.description",
        "weekly_schedule.id",
        "weekly_schedule.status",
        "weekly_schedule.start_date",
        "weekly_schedule.end_date",
      ],
    },
  });

  // Mutations
  const { mutate: createAvailability } = useCreate();
  const { mutate: deleteAvailability } = useDelete();

  // Memoized data
  const availabilities = useMemo(() => availabilitiesQuery.data?.data || [], [availabilitiesQuery.data?.data]);
  const shifts = useMemo(() => shiftsQuery.data?.data || [], [shiftsQuery.data?.data]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: availabilities.length,
      pending: availabilities.filter((a) => a.status === "pending").length,
      approved: availabilities.filter((a) => a.status === "approved").length,
      rejected: availabilities.filter((a) => a.status === "rejected").length,
    };
  }, [availabilities]);

  // Group shifts by date for calendar
  const shiftsByDate = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach((shift) => {
      const dateKey = dayjs(shift.shift_date).format("YYYY-MM-DD");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(shift);
    });
    return map;
  }, [shifts]);

  // Group availabilities by shift_id
  const registeredShiftIds = useMemo(() => {
    return new Set(availabilities.map((a) => a.shift_id));
  }, [availabilities]);

  // Get shifts for selected date
  const shiftsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.format("YYYY-MM-DD");
    return shiftsByDate[dateKey] || [];
  }, [selectedDate, shiftsByDate]);

  // Handle create registration
  const handleRegister = async () => {
    try {
      const values = await form.validateFields();

      createAvailability(
        {
          resource: "employee-availability",
          values: {
            employee_id: user?.employee_id,
            shift_id: values.shift_id,
            priority: userPriority, // Auto set by role
            note: values.note || null,
          },
        },
        {
          onSuccess: () => {
            message.success("Đăng ký ca làm việc thành công!");
            setRegisterModalOpen(false);
            form.resetFields();
            setSelectedDate(null);
            availabilitiesQuery.refetch();
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi đăng ký");
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
          availabilitiesQuery.refetch();
        },
        onError: (error: any) => {
          message.error(error?.message || "Có lỗi xảy ra");
        },
      }
    );
  };

  // Calendar cell render
  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const dayShifts = shiftsByDate[dateKey] || [];

    if (dayShifts.length === 0) return null;

    const registered = dayShifts.filter((s) => registeredShiftIds.has(s.id)).length;
    const total = dayShifts.length;

    return (
      <div style={{ fontSize: "12px" }}>
        <Badge
          status={registered > 0 ? "success" : "default"}
          text={`${registered}/${total} ca`}
        />
      </div>
    );
  };

  const getStatusTag = (status: string) => {
    const configs = {
      pending: { color: "processing", icon: <ClockCircleOutlined />, text: "Chờ duyệt" },
      approved: { color: "success", icon: <CheckCircleOutlined />, text: "Đã duyệt" },
      rejected: { color: "error", icon: <DeleteOutlined />, text: "Từ chối" },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Ca làm việc",
      key: "shift",
      render: (_: any, record: EmployeeAvailability) => {
        const shift = record.shift;
        if (!shift) return "N/A";
        return (
          <div>
            <div>
              <strong>{shift.shift_type?.name || "Ca làm việc"}</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              {dayjs(shift.shift_date).format("DD/MM/YYYY")} • {shift.start_time} - {shift.end_time}
            </div>
          </div>
        );
      },
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority: number) => (
        <Tag color={priority >= 8 ? "red" : priority >= 5 ? "blue" : "default"}>
          {priority || 5}/10
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right" as const,
      render: (_: any, record: EmployeeAvailability) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAvailability(record);
              setViewModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
          {record.status === "pending" && (
            <Popconfirm
              title="Hủy đăng ký"
              description="Bạn có chắc muốn hủy đăng ký này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Hủy đăng ký"
              cancelText="Không"
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px" }}>
          <CalendarOutlined /> Đăng ký Ca Làm Việc
        </Title>
        <Text type="secondary">
          Chọn ngày trên lịch để xem và đăng ký ca làm việc. Độ ưu tiên được tự động thiết lập theo vị trí của bạn.
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đăng ký"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              valueStyle={{ color: "#cf1322" }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* User Priority Info */}
      <Alert
        message={
          <Space>
            <InfoCircleOutlined />
            <Text strong>Độ ưu tiên của bạn: {userPriority}/10</Text>
            {user?.role && <Tag color="blue">{typeof user.role === 'string' ? user.role.toUpperCase() : String(user.role)}</Tag>}
          </Space>
        }
        description="Độ ưu tiên được tự động xác định dựa trên vai trò của bạn. Manager (10), Senior (7), Staff (5), Junior (3)."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      {/* Calendar */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>Lịch Ca Làm Việc</span>
          </Space>
        }
        style={{ marginBottom: "24px" }}
      >
        <Calendar
          cellRender={dateCellRender}
          onSelect={(date) => {
            const dateKey = date.format("YYYY-MM-DD");
            const dayShifts = shiftsByDate[dateKey] || [];
            if (dayShifts.length > 0) {
              setSelectedDate(date);
              setRegisterModalOpen(true);
            } else {
              message.info("Không có ca làm việc nào trong ngày này");
            }
          }}
        />
      </Card>

      <Divider />

      {/* Table */}
      <Card title="Lịch sử đăng ký">
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Register Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>
              Đăng ký Ca Làm Việc
              {selectedDate && ` - ${selectedDate.format("DD/MM/YYYY")}`}
            </span>
          </Space>
        }
        open={registerModalOpen}
        onCancel={() => {
          setRegisterModalOpen(false);
          setSelectedDate(null);
          form.resetFields();
        }}
        onOk={handleRegister}
        width={600}
        okText="Đăng ký"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Alert
            message="Thông tin đăng ký"
            description={
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text>• Độ ưu tiên: <Tag color="blue">{userPriority}/10</Tag> (Tự động theo vai trò {user?.role})</Text>
                <Text>• Chọn ca làm việc từ danh sách bên dưới</Text>
              </Space>
            }
            type="info"
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
              loading={shiftsQuery.isLoading}
            >
              {shiftsForSelectedDate.map((shift) => {
                const isRegistered = registeredShiftIds.has(shift.id);
                return (
                  <Select.Option
                    key={shift.id}
                    value={shift.id}
                    disabled={isRegistered}
                  >
                    <Space>
                      <span>{shift.shift_type?.name || "Ca làm việc"}</span>
                      <span style={{ color: "#888" }}>({shift.start_time} - {shift.end_time})</span>
                      {isRegistered && <Tag color="green">Đã đăng ký</Tag>}
                    </Space>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú (không bắt buộc)" name="note">
            <TextArea rows={3} placeholder="Ghi chú về khả năng làm việc của bạn..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Chi tiết đăng ký"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedAvailability(null);
        }}
        footer={
          <Button onClick={() => setViewModalOpen(false)}>Đóng</Button>
        }
        width={600}
      >
        {selectedAvailability && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Ca làm việc">
              {(() => {
                const shift = selectedAvailability.shift;
                if (!shift) return "N/A";
                return `${shift.shift_type?.name || "Ca làm việc"} - ${dayjs(shift.shift_date).format("DD/MM/YYYY")} (${shift.start_time} - ${shift.end_time})`;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Độ ưu tiên">
              <Tag color={selectedAvailability.priority && selectedAvailability.priority >= 8 ? "red" : selectedAvailability.priority && selectedAvailability.priority >= 5 ? "blue" : "default"}>
                {selectedAvailability.priority || 5}/10
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedAvailability.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đăng ký">
              {dayjs(selectedAvailability.created_at).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {selectedAvailability.note && (
              <Descriptions.Item label="Ghi chú">
                {selectedAvailability.note}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
