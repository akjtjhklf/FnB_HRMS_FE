"use client";

import { useMemo } from "react";
import { useList, useGetIdentity, useGo } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Space,
  List,
  Tag,
  Progress,
  Alert,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  EyeOutlined,
  SendOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "@/lib/dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { 
  WeeklySchedule, 
  ScheduleAssignment,
  EmployeeAvailability,
  ScheduleChangeRequest,
  Shift
} from "@/types/schedule";

dayjs.extend(isoWeek);

const { Title, Text } = Typography;

import { useCanManageSchedule } from "@/hooks/usePermissions";
import { useScheduleStats } from "@/hooks/useScheduleWorkflow";
import type { User } from "@/types/auth";

/**
 * Schedule Dashboard
 * 
 * Manager View:
 * - Overview of all schedules
 * - Pending approvals
 * - Quick actions to manage schedules
 * 
 * Employee View:
 * - My upcoming shifts
 * - Available shifts to register
 * - My change requests
 */
export function ScheduleDashboard() {
  const go = useGo();
  const { data: user } = useGetIdentity<User>();
  
  // RBAC: Dynamic permission check
  const isManager = useCanManageSchedule();
  const thisWeek = dayjs().startOf("isoWeek");

  // Fetch data
  const { query: schedulesQuery } = useList<WeeklySchedule>({
    resource: "weekly-schedules",
    pagination: { pageSize: 100 },
    meta: { fields: ["*"] },
  });

  const { query: shiftsQuery } = useList<Shift>({
    resource: "shifts",
    pagination: { pageSize: 500 },
    filters: [
      {
        field: "shift_date",
        operator: "gte",
        value: thisWeek.format("YYYY-MM-DD"),
      },
    ],
    meta: { fields: ["*", "shift_type.name"] },
  });

  const { query: assignmentsQuery } = useList<ScheduleAssignment>({
    resource: "schedule-assignments",
    pagination: { pageSize: 500 },
    filters: isManager ? [] : [
      {
        field: "employee_id",
        operator: "eq",
        value: user?.employee_id,
      },
    ],
    meta: { fields: ["*", "shift.shift_date", "shift.shift_type.name", "position.name"] },
  });

  const { query: availabilitiesQuery } = useList<EmployeeAvailability>({
    resource: "employee-availability",
    pagination: { pageSize: 100 },
    filters: isManager ? [
      { field: "status", operator: "eq", value: "pending" }
    ] : [
      { field: "employee_id", operator: "eq", value: user?.employee_id }
    ],
    meta: { fields: ["*", "shift.shift_date", "shift.shift_type.name"] },
  });

  const { query: changeRequestsQuery } = useList<ScheduleChangeRequest>({
    resource: "schedule-change-requests",
    pagination: { pageSize: 100 },
    filters: isManager ? [
      { field: "status", operator: "eq", value: "pending" }
    ] : [
      { field: "requester_id", operator: "eq", value: user?.employee_id }
    ],
    meta: { fields: ["*"] },
  });

  // Get this week's schedule ID for stats
  const thisWeekScheduleId = useMemo(() => {
    const schedule = schedulesQuery.data?.data?.find((s: WeeklySchedule) => 
      dayjs(s.week_start).isSame(thisWeek, "day")
    );
    return schedule?.id;
  }, [schedulesQuery.data?.data, thisWeek]);
  
  // Fetch detailed stats for current week
  const { stats: weeklyStats, isLoading: statsLoading } = useScheduleStats(thisWeekScheduleId);

  // Memoized data
  const schedules = useMemo(() => schedulesQuery.data?.data || [], [schedulesQuery.data?.data]);
  const shifts = useMemo(() => shiftsQuery.data?.data || [], [shiftsQuery.data?.data]);
  const assignments = useMemo(() => assignmentsQuery.data?.data || [], [assignmentsQuery.data?.data]);
  const availabilities = useMemo(() => availabilitiesQuery.data?.data || [], [availabilitiesQuery.data?.data]);
  const changeRequests = useMemo(() => changeRequestsQuery.data?.data || [], [changeRequestsQuery.data?.data]);

  // Calculate stats
  const stats = useMemo(() => {
    if (isManager) {
      const thisWeekSchedule = schedules.find((s: WeeklySchedule) => 
        dayjs(s.week_start).isSame(thisWeek, "day")
      );
      
      const thisWeekShifts = shifts.filter((sh: Shift) =>
        thisWeekSchedule && sh.schedule_id === thisWeekSchedule.id
      );

      const thisWeekAssignments = assignments.filter((a: any) =>
        thisWeekShifts.some((sh: Shift) => sh.id === a.shift_id)
      );

      return {
        totalSchedules: schedules.length,
        publishedSchedules: schedules.filter((s: WeeklySchedule) => s.status === "scheduled").length,
        draftSchedules: schedules.filter((s: WeeklySchedule) => s.status === "draft").length,
        thisWeekCoverage: thisWeekShifts.length > 0 
          ? Math.round((thisWeekAssignments.length / thisWeekShifts.length) * 100) 
          : 0,
        pendingAvailabilities: availabilities.length,
        pendingChangeRequests: changeRequests.length,
      };
    } else {
      // Employee stats
      const myUpcomingShifts = assignments.filter((a: any) =>
        a.shift?.shift_date && dayjs(a.shift.shift_date).isAfter(dayjs())
      );

      return {
        myTotalShifts: assignments.length,
        myUpcomingShifts: myUpcomingShifts.length,
        myAvailabilities: availabilities.length,
        myPendingRequests: changeRequests.filter((r: ScheduleChangeRequest) => r.status === "pending").length,
      };
    }
  }, [isManager, schedules, shifts, assignments, availabilities, changeRequests, thisWeek]);

  // Render Manager Dashboard
  if (isManager) {
    const upcomingSchedules = schedules
      .filter((s: WeeklySchedule) => dayjs(s.week_start).isAfter(dayjs()) || dayjs(s.week_start).isSame(thisWeek, "day"))
      .sort((a: WeeklySchedule, b: WeeklySchedule) => dayjs(a.week_start).diff(dayjs(b.week_start)))
      .slice(0, 5);

    const pendingApprovals = [...availabilities, ...changeRequests]
      .sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)))
      .slice(0, 5);

    return (
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <Title level={2} style={{ marginBottom: "24px" }}>
          <CalendarOutlined /> Dashboard Quản Lý Lịch
        </Title>

        {/* Alert if pending items */}
        {((stats.pendingAvailabilities ?? 0) > 0 || (stats.pendingChangeRequests ?? 0) > 0) && (
          <Alert
            message={`Bạn có ${stats.pendingAvailabilities ?? 0} đăng ký ca và ${stats.pendingChangeRequests ?? 0} yêu cầu đổi ca đang chờ duyệt`}
            type="warning"
            showIcon
            icon={<ClockCircleOutlined />}
            style={{ marginBottom: "24px" }}
            action={
              <Button size="small" onClick={() => go({ to: "/schedule/change-requests" })}>
                Xem ngay
              </Button>
            }
          />
        )}

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng lịch tuần"
                value={stats.totalSchedules ?? 0}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã công bố"
                value={stats.publishedSchedules ?? 0}
                prefix={<SendOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chờ duyệt"
                value={(stats.pendingAvailabilities ?? 0) + (stats.pendingChangeRequests ?? 0)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Độ phủ tuần này"
                value={stats.thisWeekCoverage ?? 0}
                prefix={<TeamOutlined />}
                suffix="%"
                valueStyle={{ color: (stats.thisWeekCoverage ?? 0) >= 80 ? "#3f8600" : "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress */}
        <Card style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "8px" }}>
            <Text strong>Độ phủ lịch tuần này</Text>
          </div>
          <Progress 
            percent={stats.thisWeekCoverage ?? 0} 
            status={(stats.thisWeekCoverage ?? 0) >= 80 ? "success" : "exception"}
          />
          
          {/* Detailed Stats from API */}
          {weeklyStats && !statsLoading && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Tổng ca"
                    value={weeklyStats.shifts.total}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ fontSize: "18px" }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Nhân viên đã đăng ký"
                    value={weeklyStats.employees.registered}
                    prefix={<UserOutlined />}
                    valueStyle={{ fontSize: "18px", color: "#1890ff" }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Đã phân công"
                    value={weeklyStats.assignments.total}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ fontSize: "18px", color: "#52c41a" }}
                  />
                </Col>
              </Row>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Thao Tác Nhanh" style={{ marginBottom: "24px" }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => go({ to: "/schedule/weekly-schedules" })}>
              Tạo Lịch Tuần
            </Button>
            <Button icon={<CalendarOutlined />} onClick={() => go({ to: "/schedule" })}>
              Quản Lý Ca
            </Button>
            <Button icon={<TeamOutlined />} onClick={() => go({ to: "/schedule/assignments" })}>
              Phân Công Nhân Viên
            </Button>
            <Button icon={<ClockCircleOutlined />} onClick={() => go({ to: "/schedule/change-requests" })}>
              Duyệt Yêu Cầu
            </Button>
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Upcoming Schedules */}
          <Col xs={24} lg={12}>
            <Card 
              title={<Space><CalendarOutlined /> Lịch Sắp Tới</Space>}
              extra={<Button type="link" onClick={() => go({ to: "/schedule/weekly-schedules" })}>Xem tất cả</Button>}
            >
              <List
                dataSource={upcomingSchedules}
                renderItem={(schedule: WeeklySchedule) => (
                  <List.Item
                    key={schedule.id}
                    actions={[
                      <Button 
                        key="view"
                        type="link" 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => go({ to: `/schedule/weekly-schedules` })}
                      >
                        Xem
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={`Tuần ${dayjs(schedule.week_start).isoWeek()} - ${dayjs(schedule.week_start).year()}`}
                      description={`${dayjs(schedule.week_start).format("DD/MM")} - ${dayjs(schedule.week_end).format("DD/MM/YYYY")}`}
                    />
                    <Tag color={schedule.status === "scheduled" ? "blue" : "default"}>
                      {schedule.status === "scheduled" ? "Đã công bố" : "Nháp"}
                    </Tag>
                  </List.Item>
                )}
              />
              {upcomingSchedules.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#8c8c8c" }}>
                  Chưa có lịch tuần nào
                </div>
              )}
            </Card>
          </Col>

          {/* Pending Approvals */}
          <Col xs={24} lg={12}>
            <Card 
              title={<Space><ClockCircleOutlined /> Chờ Duyệt</Space>}
              extra={<Button type="link" onClick={() => go({ to: "/schedule/change-requests" })}>Xem tất cả</Button>}
            >
              <List
                dataSource={pendingApprovals}
                renderItem={(item: any) => {
                  const isAvailability = "shift_id" in item;
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={isAvailability ? "Đăng ký ca" : "Yêu cầu đổi ca"}
                        description={dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
                      />
                      <Tag color="orange">Chờ duyệt</Tag>
                    </List.Item>
                  );
                }}
              />
              {pendingApprovals.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#8c8c8c" }}>
                  Không có yêu cầu nào
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Employee Dashboard
  const myUpcomingShifts = assignments
    .filter((a: any) =>
      a.shift?.shift_date && dayjs(a.shift.shift_date).isAfter(dayjs())
    )
    .sort((a: any, b: any) => 
      dayjs(a.shift?.shift_date).diff(dayjs(b.shift?.shift_date))
    )
    .slice(0, 5);

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Title level={2} style={{ marginBottom: "24px" }}>
        <UserOutlined /> Lịch Làm Việc Của Tôi
      </Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng ca của tôi"
              value={stats.myTotalShifts ?? 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ca sắp tới"
              value={stats.myUpcomingShifts ?? 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã đăng ký"
              value={stats.myAvailabilities ?? 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Yêu cầu chờ"
              value={stats.myPendingRequests ?? 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Thao Tác Nhanh" style={{ marginBottom: "24px" }}>
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => go({ to: "/schedule/availability" })}>
            Đăng Ký Ca
          </Button>
          <Button icon={<CalendarOutlined />} onClick={() => go({ to: "/schedule/my-schedule" })}>
            Xem Lịch Của Tôi
          </Button>
          <Button icon={<ClockCircleOutlined />} onClick={() => go({ to: "/schedule/change-requests" })}>
            Yêu Cầu Đổi Ca
          </Button>
        </Space>
      </Card>

      {/* My Upcoming Shifts */}
      <Card 
        title={<Space><CalendarOutlined /> Ca Sắp Tới</Space>}
        extra={<Button type="link" onClick={() => go({ to: "/schedule/my-schedule" })}>Xem tất cả</Button>}
      >
        <List
          dataSource={myUpcomingShifts}
          renderItem={(assignment: any) => (
            <List.Item key={assignment.id}>
              <List.Item.Meta
                title={assignment.shift?.shift_type?.name || "Ca làm việc"}
                description={
                  <Space direction="vertical" size={0}>
                    <Text>{dayjs(assignment.shift?.shift_date).format("dddd, DD/MM/YYYY")}</Text>
                    <Text type="secondary">{assignment.position?.name}</Text>
                  </Space>
                }
              />
              <Tag color={assignment.confirmed_by_employee ? "green" : "orange"}>
                {assignment.confirmed_by_employee ? "Đã xác nhận" : "Chưa xác nhận"}
              </Tag>
            </List.Item>
          )}
        />
        {myUpcomingShifts.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#8c8c8c" }}>
            Bạn chưa có ca nào sắp tới
          </div>
        )}
      </Card>
    </div>
  );
}
