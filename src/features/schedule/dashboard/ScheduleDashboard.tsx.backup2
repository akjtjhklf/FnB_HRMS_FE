"use client";

import { useMemo } from "react";
import { useList, useGetIdentity } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Space,
  Button,
  Alert,
  Empty,
  Typography,
  List,
  Tag,
  Avatar,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useRouter } from "next/navigation";

dayjs.extend(isoWeek);

const { Title, Text } = Typography;

interface User {
  id: string;
  employee_id: string;
  role: string;
}

interface WeeklySchedule {
  id: string;
  start_date: string;
  end_date: string;
  status: "draft" | "published" | "finalized";
  published_at?: string;
}

interface ScheduleAssignment {
  id: string;
  shift_id: string;
  employee_id: string;
  status?: string;
}

interface EmployeeAvailability {
  id: string;
  employee_id: string;
  shift_id: string;
  priority?: number;
  status: "pending" | "approved" | "rejected";
}

interface ScheduleChangeRequest {
  id: string;
  from_assignment_id: string;
  type: "shift_swap" | "time_off" | "other";
  status: "pending" | "approved" | "rejected";
}

interface Shift {
  id: string;
  weekly_schedule_id: string;
  shift_date: string;
  status?: string;
}

/**
 * ScheduleDashboard - Trang Tổng Quan Quản Lý Lịch
 * 
 * Layout đơn giản, rõ ràng:
 * - Thống kê tổng quan (4 cards)
 * - Tiến độ phân công tuần này
 * - Quick actions (6 nút chính)
 * - Lịch tuần sắp tới + Yêu cầu chờ xử lý
 */
export function ScheduleDashboard() {
  const router = useRouter();
  const { data: user } = useGetIdentity<User>();

  // Fetch data
  const schedulesQuery = useList<WeeklySchedule>({
    resource: "weekly-schedules",
    pagination: { pageSize: 100 },
  });

  const assignmentsQuery = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
    pagination: { pageSize: 1000 },
  });

  const availabilitiesQuery = useList<EmployeeAvailability>({
    resource: "employee-availability",
    pagination: { pageSize: 1000 },
  });

  const changeRequestsQuery = useList<ScheduleChangeRequest>({
    resource: "schedule-change-requests",
    pagination: { pageSize: 100 },
  });

  const shiftsQuery = useList<Shift>({
    resource: "shifts",
    pagination: { pageSize: 1000 },
  });

  // Memoized data
  const schedules = useMemo(() => schedulesQuery.query.data?.data || [], [schedulesQuery.query.data?.data]);
  const assignments = useMemo(() => assignmentsQuery.query.data?.data || [], [assignmentsQuery.query.data?.data]);
  const availabilities = useMemo(() => availabilitiesQuery.query.data?.data || [], [availabilitiesQuery.query.data?.data]);
  const changeRequests = useMemo(() => changeRequestsQuery.query.data?.data || [], [changeRequestsQuery.query.data?.data]);
  const shifts = useMemo(() => shiftsQuery.query.data?.data || [], [shiftsQuery.query.data?.data]);

  // Calculate statistics
  const stats = useMemo(() => {
    const thisWeek = dayjs().startOf("isoWeek");
    
    const thisWeekSchedule = schedules.find(
      (s: WeeklySchedule) => dayjs(s.start_date).isSame(thisWeek, "day")
    );

    const thisWeekShifts = thisWeekSchedule
      ? shifts.filter((sh: Shift) => sh.weekly_schedule_id === thisWeekSchedule.id)
      : [];

    const thisWeekAssignments = thisWeekSchedule
      ? assignments.filter((a: ScheduleAssignment) =>
          thisWeekShifts.some((sh: Shift) => sh.id === a.shift_id)
        )
      : [];

    const coverage =
      thisWeekShifts.length > 0
        ? Math.round((thisWeekAssignments.length / thisWeekShifts.length) * 100)
        : 0;

    return {
      totalSchedules: schedules.length,
      publishedSchedules: schedules.filter((s: WeeklySchedule) => s.status === "published").length,
      draftSchedules: schedules.filter((s: WeeklySchedule) => s.status === "draft").length,
      totalAssignments: assignments.length,
      thisWeekAssignments: thisWeekAssignments.length,
      thisWeekShifts: thisWeekShifts.length,
      coveragePercent: coverage,
      totalAvailabilities: availabilities.length,
      pendingAvailabilities: availabilities.filter((a: EmployeeAvailability) => a.status === "pending").length,
      totalChangeRequests: changeRequests.length,
      pendingChangeRequests: changeRequests.filter((r: ScheduleChangeRequest) => r.status === "pending").length,
    };
  }, [schedules, assignments, availabilities, changeRequests, shifts]);

  // Get upcoming schedules
  const upcomingSchedules = useMemo(() => {
    const now = dayjs();
    return schedules
      .filter((s: WeeklySchedule) => dayjs(s.start_date).isAfter(now))
      .sort((a: WeeklySchedule, b: WeeklySchedule) => dayjs(a.start_date).diff(dayjs(b.start_date)))
      .slice(0, 5);
  }, [schedules]);

  // Get pending requests
  const pendingRequests = useMemo(() => {
    return changeRequests
      .filter((r: ScheduleChangeRequest) => r.status === "pending")
      .slice(0, 5);
  }, [changeRequests]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "default",
      published: "blue",
      finalized: "green",
      pending: "orange",
      approved: "green",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      draft: "Nháp",
      published: "Đã công bố",
      finalized: "Hoàn tất",
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Từ chối",
    };
    return texts[status] || status;
  };

  const getRequestTypeText = (type: string) => {
    const types: Record<string, string> = {
      shift_swap: "Đổi ca",
      time_off: "Nghỉ phép",
      other: "Khác",
    };
    return types[type] || type;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px" }}>
          <ThunderboltOutlined /> Tổng Quan Quản Lý Lịch
        </Title>
        <Text type="secondary">
          Xem tổng quan về lịch làm việc, phân công, đăng ký và yêu cầu thay đổi
        </Text>
      </div>

      {/* Alert for pending items */}
      {(stats.pendingAvailabilities > 0 || stats.pendingChangeRequests > 0) && (
        <Alert
          message="Có yêu cầu cần xử lý!"
          description={
            <Space direction="vertical" size="small">
              {stats.pendingAvailabilities > 0 && (
                <Text>• {stats.pendingAvailabilities} đăng ký khả năng làm việc chờ duyệt</Text>
              )}
              {stats.pendingChangeRequests > 0 && (
                <Text>• {stats.pendingChangeRequests} yêu cầu thay đổi ca chờ xử lý</Text>
              )}
            </Space>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: "24px" }}
        />
      )}

      {/* Main Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Lịch Tuần"
              value={stats.totalSchedules}
              prefix={<CalendarOutlined />}
              suffix={
                <div style={{ fontSize: "14px", color: "#8c8c8c", marginTop: "4px" }}>
                  {stats.publishedSchedules} đã công bố
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Phân Công Ca"
              value={stats.totalAssignments}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đăng Ký Khả Năng"
              value={stats.totalAvailabilities}
              prefix={<ClockCircleOutlined />}
              suffix={
                stats.pendingAvailabilities > 0 ? (
                  <Tag color="orange" style={{ marginTop: "4px" }}>
                    {stats.pendingAvailabilities} chờ
                  </Tag>
                ) : null
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Yêu Cầu Thay Đổi"
              value={stats.totalChangeRequests}
              prefix={<SwapOutlined />}
              suffix={
                stats.pendingChangeRequests > 0 ? (
                  <Tag color="orange" style={{ marginTop: "4px" }}>
                    {stats.pendingChangeRequests} chờ
                  </Tag>
                ) : null
              }
            />
          </Card>
        </Col>
      </Row>

      {/* This Week Coverage */}
      <Card
        title={
          <Space>
            <RiseOutlined />
            <span>Tiến Độ Phân Công Tuần Này</span>
          </Space>
        }
        style={{ marginBottom: "24px" }}
      >
        {stats.thisWeekShifts > 0 ? (
          <div>
            <Row gutter={16} align="middle">
              <Col xs={24} md={16}>
                <Progress
                  percent={stats.coveragePercent}
                  status={
                    stats.coveragePercent >= 80
                      ? "success"
                      : stats.coveragePercent >= 50
                      ? "normal"
                      : "exception"
                  }
                  strokeColor={
                    stats.coveragePercent >= 80
                      ? "#52c41a"
                      : stats.coveragePercent >= 50
                      ? "#1890ff"
                      : "#ff4d4f"
                  }
                />
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" size="small">
                  <Text>
                    Đã phân công: <strong>{stats.thisWeekAssignments}</strong> / {stats.thisWeekShifts} ca
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {stats.thisWeekShifts - stats.thisWeekAssignments} ca chưa có người
                  </Text>
                </Space>
              </Col>
            </Row>
          </div>
        ) : (
          <Empty description="Chưa có lịch tuần này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* Quick Actions */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            <span>Thao Tác Nhanh</span>
          </Space>
        }
        style={{ marginBottom: "24px" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="primary"
              size="large"
              block
              icon={<CalendarOutlined />}
              onClick={() => router.push("/schedule/shift-types")}
            >
              Quản Lý Loại Ca
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="primary"
              size="large"
              block
              icon={<CalendarOutlined />}
              onClick={() => router.push("/schedule/weekly-schedules")}
            >
              Quản Lý Lịch Tuần
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="primary"
              size="large"
              block
              icon={<ClockCircleOutlined />}
              onClick={() => router.push("/schedule/availability")}
            >
              Đăng Ký Ca
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              size="large"
              block
              icon={<TeamOutlined />}
              onClick={() => router.push("/schedule/assignments")}
            >
              Phân Công Ca
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              size="large"
              block
              icon={<UserOutlined />}
              onClick={() => router.push("/schedule/my-schedule")}
            >
              Lịch Của Tôi
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              size="large"
              block
              icon={<SwapOutlined />}
              onClick={() => router.push("/schedule/change-requests")}
            >
              Yêu Cầu Thay Đổi
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Upcoming Schedules */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Lịch Tuần Sắp Tới</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => router.push("/schedule/weekly-schedules")}
              >
                Xem tất cả
              </Button>
            }
          >
            {upcomingSchedules.length > 0 ? (
              <List
                dataSource={upcomingSchedules}
                renderItem={(schedule: WeeklySchedule) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor:
                              schedule.status === "published" ? "#1890ff" : "#d9d9d9",
                          }}
                          icon={<CalendarOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <span>
                            Tuần {dayjs(schedule.start_date).isoWeek()}
                          </span>
                          <Tag color={getStatusColor(schedule.status)}>
                            {getStatusText(schedule.status)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {dayjs(schedule.start_date).format("DD/MM/YYYY")} -{" "}
                          {dayjs(schedule.end_date).format("DD/MM/YYYY")}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có lịch sắp tới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* Pending Change Requests */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SwapOutlined />
                <span>Yêu Cầu Chờ Xử Lý</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => router.push("/schedule/change-requests")}
              >
                Xem tất cả
              </Button>
            }
          >
            {pendingRequests.length > 0 ? (
              <List
                dataSource={pendingRequests}
                renderItem={(request: ScheduleChangeRequest) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: "#faad14" }}
                          icon={<ClockCircleOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <span>{getRequestTypeText(request.type)}</span>
                          <Tag color="orange">Chờ duyệt</Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          ID: {request.id.substring(0, 8)}...
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Không có yêu cầu chờ xử lý" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
