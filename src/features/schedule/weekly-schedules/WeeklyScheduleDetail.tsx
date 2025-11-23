"use client";

import { useState } from "react";
import { useShow, useList, useNavigation } from "@refinedev/core";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Timeline,
  Empty,
  Spin,
  Tabs,
  Table,
  App,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  SendOutlined,
  LockOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { WeeklySchedule } from "@/types/schedule";
import type { Shift } from "@/types/schedule/shift.types";
import type { ScheduleAssignment } from "@/types/schedule/schedule-assignment.types";
import { useCanManageSchedule } from "@/hooks/usePermissions";
import {
  usePublishSchedule,
  useFinalizeSchedule,
} from "@/hooks/useScheduleWorkflow";
import { ValidationChecker } from "../components/ValidationChecker";
import { useConfirmModalStore } from "@/store/confirmModalStore";

dayjs.extend(isoWeek);

const { Title, Text } = Typography;

interface WeeklyScheduleDetailProps {
  id: string;
}

export function WeeklyScheduleDetail({ id }: WeeklyScheduleDetailProps) {
  const { list, show } = useNavigation();
  const canManage = useCanManageSchedule();
  const { message } = App.useApp();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Workflow hooks
  const { publishSchedule: publishScheduleFn, isLoading: isPublishing } = usePublishSchedule();
  const { finalizeSchedule: finalizeScheduleFn, isLoading: isFinalizing } = useFinalizeSchedule();

  // Fetch schedule
  const { query: scheduleQuery } = useShow<WeeklySchedule>({
    resource: "weekly-schedules",
    id,
    meta: {
      fields: ["*"],
    },
  });

  // Fetch shifts for this schedule
  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    filters: [{ field: "schedule_id", operator: "eq", value: id }],
    meta: {
      fields: ["*", "shift_type_id.*"],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: !!id,
    },
  });

  // Fetch assignments for this schedule
  const { query: assignmentsQuery } = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
    filters: [{ field: "schedule_id", operator: "eq", value: id }],
    meta: {
      fields: ["*", "employee_id.*", "position_id.*"],
    },
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: !!id,
    },
  });

  const schedule = scheduleQuery.data?.data;
  const shifts = shiftsQuery.data?.data || [];
  const assignments = assignmentsQuery.data?.data || [];
  const isLoading =
    scheduleQuery.isLoading || shiftsQuery.isLoading || assignmentsQuery.isLoading;

  // Calculate stats
  const stats = {
    totalShifts: shifts.length,
    totalAssignments: assignments.length,
    totalRequired: shifts.reduce((sum, s) => sum + (s.total_required || 0), 0),
    coverageRate:
      shifts.reduce((sum, s) => sum + (s.total_required || 0), 0) > 0
        ? (assignments.length /
            shifts.reduce((sum, s) => sum + (s.total_required || 0), 0)) *
          100
        : 0,
  };

  // Status renderer
  const getStatusTag = (status: string) => {
    const configs = {
      draft: { color: "default", text: "Nháp", icon: <EditOutlined /> },
      scheduled: { color: "processing", text: "Đã công bố", icon: <SendOutlined /> },
      published: { color: "processing", text: "Đã công bố", icon: <SendOutlined /> },
      finalized: { color: "success", text: "Hoàn tất", icon: <LockOutlined /> },
    };
    const config = configs[status as keyof typeof configs] || configs.draft;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Handle publish with validation
  const handlePublish = async () => {
    setIsPublishModalOpen(true);
  };

  const handlePublishConfirm = async () => {
    try {
      await publishScheduleFn(id);
      scheduleQuery.refetch();
      shiftsQuery.refetch();
      message.success("✅ Công bố lịch tuần thành công!");
      setIsPublishModalOpen(false);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi công bố lịch");
    }
  };

  // Handle finalize with confirmation
  const handleFinalize = async () => {
    openConfirm({
      title: "Hoàn tất lịch tuần",
      content: (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text>
            Sau khi hoàn tất, lịch sẽ được <strong>khóa</strong> và không thể thay đổi.
          </Typography.Text>
          <Typography.Text type="secondary">
            - Nhân viên không thể đăng ký thêm ca<br />
            - Không thể thay đổi phân công<br />
            - Lịch sẽ được dùng để chấm công
          </Typography.Text>
          <Typography.Text strong>
            Bạn có chắc chắn muốn hoàn tất lịch tuần này?
          </Typography.Text>
        </Space>
      ),
      okText: "Hoàn tất",
      cancelText: "Hủy",
      type: "warning",
      onConfirm: async () => {
        try {
          await finalizeScheduleFn(id);
          scheduleQuery.refetch();
          message.success("✅ Hoàn tất lịch tuần thành công!");
        } catch (error: any) {
          message.error(error?.message || "Có lỗi xảy ra khi hoàn tất lịch");
          throw error;
        }
      },
    });
  };

  // Group shifts by day
  const shiftsByDay = shifts.reduce((acc, shift) => {
    const day = dayjs(shift.shift_date).format("YYYY-MM-DD");
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  // Shifts table columns
  const shiftsColumns = [
    {
      title: "Ngày",
      dataIndex: "shift_date",
      key: "shift_date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY (dddd)"),
    },
    {
      title: "Loại ca",
      dataIndex: "shift_type",
      key: "shift_type",
      render: (shiftType: any) => shiftType?.name || "N/A",
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_: any, record: Shift) => {
        const shiftType = record.shift_type as any;
        const startTime = record.start_at || shiftType?.start_time || "N/A";
        const endTime = record.end_at || shiftType?.end_time || "N/A";
        return `${startTime} - ${endTime}`;
      },
    },
    {
      title: "Yêu cầu",
      dataIndex: "total_required",
      key: "total_required",
      render: (count: number) => count || 0,
    },
    {
      title: "Đã xếp",
      key: "assigned",
      render: (_: any, record: Shift) => {
        const assigned = assignments.filter((a) => a.shift_id === record.id).length;
        const required = record.total_required || 0;
        const color = assigned >= required ? "success" : "warning";
        return <Tag color={color}>{assigned}</Tag>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Empty description="Không tìm thấy lịch tuần" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Space size="large" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => list("weekly-schedules")}
            >
              Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Chi Tiết Lịch Tuần
            </Title>
          </Space>
          <Space>
            {canManage && schedule.status === "draft" && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => window.location.href = "/schedule/shifts?schedule_id=" + id}
                >
                  Quản lý ca làm
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handlePublish}
                  loading={isPublishing}
                >
                  Công bố
                </Button>
              </>
            )}
            {canManage && schedule.status === "scheduled" && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => window.location.href = "/schedule/shifts?schedule_id=" + id}
                >
                  Quản lý ca làm
                </Button>
                <Button
                  icon={<TeamOutlined />}
                  onClick={() => window.location.href = "/schedule/assignments?schedule_id=" + id}
                >
                  Xếp lịch
                </Button>
                <Button
                  type="primary"
                  icon={<LockOutlined />}
                  onClick={handleFinalize}
                  loading={isFinalizing}
                >
                  Hoàn tất
                </Button>
              </>
            )}
          </Space>
        </Space>
      </div>

      {/* Workflow Status Alert */}
      {schedule.status === "draft" && (
        <Card style={{ marginBottom: "16px", background: "#f0f5ff", borderColor: "#adc6ff" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Text strong style={{ color: "#1890ff" }}>
              📝 Trạng thái: Nháp
            </Text>
            <Text type="secondary">
              Tiếp theo: Thêm ca làm việc và yêu cầu vị trí, sau đó <strong>Công bố</strong> để nhân viên có thể đăng ký ca.
            </Text>
            <Space size="small">
              <Button 
                type="link" 
                size="small"
                icon={<EditOutlined />}
                onClick={() => window.location.href = "/schedule/shifts?schedule_id=" + id}
              >
                → Quản lý ca làm
              </Button>
            </Space>
          </Space>
        </Card>
      )}
      {schedule.status === "scheduled" && (
        <Card style={{ marginBottom: "16px", background: "#e6f7ff", borderColor: "#91d5ff" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Text strong style={{ color: "#1890ff" }}>
              📢 Trạng thái: Đã công bố
            </Text>
            <Text type="secondary">
              Nhân viên có thể xem và đăng ký ca. Tiếp theo: Xếp lịch phân công, sau đó <strong>Hoàn tất</strong> để khóa lịch.
            </Text>
            <Space size="small">
              <Button 
                type="link" 
                size="small"
                icon={<EditOutlined />}
                onClick={() => window.location.href = "/schedule/shifts?schedule_id=" + id}
              >
                → Quản lý ca làm
              </Button>
              <Button 
                type="link" 
                size="small"
                icon={<TeamOutlined />}
                onClick={() => window.location.href = "/schedule/assignments?schedule_id=" + id}
              >
                → Xếp lịch phân công
              </Button>
            </Space>
          </Space>
        </Card>
      )}
      {schedule.status === "finalized" && (
        <Card style={{ marginBottom: "16px", background: "#f6ffed", borderColor: "#b7eb8f" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong style={{ color: "#52c41a" }}>
              ✅ Trạng thái: Hoàn tất
            </Text>
            <Text type="secondary">
              Lịch đã được khóa. Hệ thống đang sử dụng lịch này để chấm công.
            </Text>
          </Space>
        </Card>
      )}

      {/* Basic Info */}
      <Card style={{ marginBottom: "24px" }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Tuần làm việc" span={2}>
            <Space>
              <CalendarOutlined />
              <Text strong>
                {dayjs(schedule.week_start).format("DD/MM/YYYY")} -{" "}
                {dayjs(schedule.week_end).format("DD/MM/YYYY")}
              </Text>
              <Text type="secondary">
                (Tuần {dayjs(schedule.week_start).isoWeek()} /{" "}
                {dayjs(schedule.week_start).year()})
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {getStatusTag(schedule.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày công bố">
            {schedule.published_at
              ? dayjs(schedule.published_at).format("DD/MM/YYYY HH:mm")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={2}>
            {schedule.created_at
              ? dayjs(schedule.created_at).format("DD/MM/YYYY HH:mm")
              : "-"}
          </Descriptions.Item>
          {schedule.notes && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {schedule.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số ca"
              value={stats.totalShifts}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Yêu cầu nhân viên"
              value={stats.totalRequired}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã phân công"
              value={stats.totalAssignments}
              valueStyle={{
                color:
                  stats.totalAssignments >= stats.totalRequired ? "#3f8600" : "#cf1322",
              }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={stats.coverageRate.toFixed(1)}
              suffix="%"
              valueStyle={{
                color: stats.coverageRate >= 80 ? "#3f8600" : "#cf1322",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      {canManage && schedule.status !== "finalized" && (
        <Card 
          title={<Space><InfoCircleOutlined /> Hành động nhanh</Space>}
          style={{ marginBottom: "24px" }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <Text strong>Quản lý ca làm việc:</Text>
              <div style={{ marginTop: "8px" }}>
                <Button
                  type="primary"
                  ghost
                  icon={<CalendarOutlined />}
                  onClick={() => window.location.href = "/schedule/shifts?schedule_id=" + id}
                  style={{ marginRight: "8px" }}
                >
                  Mở trang quản lý Shifts
                </Button>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  ({stats.totalShifts} ca đã tạo)
                </Text>
              </div>
            </div>
            
            {schedule.status === "scheduled" && (
              <div>
                <Text strong>Phân công nhân viên:</Text>
                <div style={{ marginTop: "8px" }}>
                  <Button
                    type="primary"
                    ghost
                    icon={<TeamOutlined />}
                    onClick={() => window.location.href = "/schedule/assignments?schedule_id=" + id}
                    style={{ marginRight: "8px" }}
                  >
                    Mở trang xếp lịch
                  </Button>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    ({stats.totalAssignments}/{stats.totalRequired} - {stats.coverageRate.toFixed(0)}% hoàn thành)
                  </Text>
                </div>
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          defaultActiveKey="shifts"
          items={[
            {
              key: "shifts",
              label: (
                <span>
                  <CalendarOutlined /> Ca làm việc ({stats.totalShifts})
                </span>
              ),
              children: (
                <Table
                  dataSource={shifts}
                  columns={shiftsColumns}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 800 }}
                />
              ),
            },
            {
              key: "timeline",
              label: (
                <span>
                  <ClockCircleOutlined /> Timeline
                </span>
              ),
              children: (
                <Timeline
                  mode="left"
                  items={[
                    schedule.created_at
                      ? {
                          color: "blue",
                          label: dayjs(schedule.created_at).format("DD/MM/YYYY HH:mm"),
                          children: "Lịch tuần được tạo",
                        }
                      : null,
                    schedule.published_at
                      ? {
                          color: "green",
                          label: dayjs(schedule.published_at).format("DD/MM/YYYY HH:mm"),
                          children: "Lịch tuần được công bố",
                        }
                      : null,
                    schedule.status === "finalized"
                      ? {
                          color: "purple",
                          label: dayjs(schedule.updated_at).format("DD/MM/YYYY HH:mm"),
                          children: "Lịch tuần được hoàn tất",
                        }
                      : null,
                  ].filter((item): item is NonNullable<typeof item> => item !== null)}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Publish Validation Modal */}
      <Modal
        title="Công bố lịch tuần"
        open={isPublishModalOpen}
        onCancel={() => setIsPublishModalOpen(false)}
        footer={null}
        width={700}
        maskClosable={false}
      >
        <ValidationChecker
          scheduleId={id}
          onValidated={handlePublishConfirm}
          onCancel={() => setIsPublishModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
