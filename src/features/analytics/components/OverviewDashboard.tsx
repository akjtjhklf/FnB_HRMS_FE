"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin, Empty } from "antd";
import {
  UserOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import type { OverviewStats } from "../api/analyticsApi";

interface OverviewDashboardProps {
  data: OverviewStats | null;
  loading?: boolean;
}

export function OverviewDashboard({ data, loading }: OverviewDashboardProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large">
          <div className="pt-8 text-gray-500">Đang tải dữ liệu thống kê...</div>
        </Spin>
      </div>
    );
  }

  if (!data) {
    return (
      <Empty
        description="Chưa có dữ liệu thống kê"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div>
      {/* Employee Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserOutlined className="mr-2" />
          Thống kê nhân viên
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Tổng nhân viên"
                value={data.totalEmployees}
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Đang làm việc"
                value={data.activeEmployees}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Nghỉ phép"
                value={data.onLeaveEmployees}
                prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                valueStyle={{
                  color: "#faad14",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="NV mới tháng này"
                value={data.newEmployeesThisMonth}
                prefix={<UserAddOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{
                  color: "#722ed1",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Attendance Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ClockCircleOutlined className="mr-2" />
          Chấm công hôm nay
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Tổng bản ghi"
                value={data.totalAttendanceToday}
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Đi muộn"
                value={data.lateToday}
                valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Vắng mặt"
                value={data.absentToday}
                valueStyle={{ color: "#8c8c8c", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Tỷ lệ chấm công"
                value={data.attendanceRate.toFixed(1)}
                suffix="%"
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Schedule Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarOutlined className="mr-2" />
          Lịch làm hôm nay
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Tổng ca"
                value={data.totalShiftsToday}
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="NV được phân công"
                value={data.scheduledEmployeesToday}
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={data.scheduleCompletionRate.toFixed(1)}
                suffix="%"
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Requests Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertOutlined className="mr-2" />
          Yêu cầu chờ duyệt
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Tổng yêu cầu"
                value={data.pendingRequests}
                valueStyle={{
                  color: "#faad14",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Đổi lịch làm"
                value={data.pendingScheduleChangeRequests}
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Yêu cầu lương"
                value={data.pendingSalaryRequests}
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
