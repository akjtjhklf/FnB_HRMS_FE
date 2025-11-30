"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin, Empty } from "antd";
import {
  CalendarOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { ScheduleAnalytics as ScheduleAnalyticsType } from "../api/analyticsApi";

interface ScheduleAnalyticsProps {
  data: ScheduleAnalyticsType | null;
  loading?: boolean;
}

const COMPLETION_COLORS = ["#52c41a", "#faad14", "#ff7875"]; // Completed, Pending, In Progress

export function ScheduleAnalytics({ data, loading }: ScheduleAnalyticsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Đang tải phân tích lịch làm..." />
      </div>
    );
  }

  if (!data) {
    return (
      <Empty
        description="Chưa có dữ liệu lịch làm"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const completionData = [
    { name: "Hoàn thành", value: data.totalShiftsCompleted },
    { name: "Chờ xử lý", value: data.totalShiftsPending },
    { name: "Đang thực hiện", value: data.totalShiftsInProgress },
  ].filter((item) => item.value > 0);

  const requestData = [
    {
      name: "Đổi ca",
      total: data.totalSwapRequests,
      approved: data.approvedSwapRequests,
    },
    {
      name: "Thay đổi khác",
      total: data.totalChangeRequests - data.totalSwapRequests,
      approved: data.approvedChangeRequests - data.approvedSwapRequests,
    },
  ];

  return (
    <div>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng ca làm"
              value={data.totalShiftsAssigned}
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={data.completionRate}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Yêu cầu đổi ca"
              value={data.totalSwapRequests}
              prefix={<SwapOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="TB ca/nhân viên"
              value={data.averageShiftsPerEmployee}
              precision={1}
              prefix={<ClockCircleOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Completion Status */}
        <Col xs={24} lg={12}>
          <Card title="📊 Trạng thái ca làm việc" className="shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {completionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COMPLETION_COLORS[index % COMPLETION_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Request Stats */}
        <Col xs={24} lg={12}>
          <Card title="📝 Thống kê yêu cầu" className="shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Tổng yêu cầu" fill="#1890ff" />
                <Bar dataKey="approved" name="Đã duyệt" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
