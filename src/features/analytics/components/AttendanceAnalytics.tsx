"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin, Empty, Table } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AttendanceAnalytics as AttendanceAnalyticsType } from "../api/analyticsApi";

interface AttendanceAnalyticsProps {
  data: AttendanceAnalyticsType | null;
  loading?: boolean;
}

export function AttendanceAnalytics({
  data,
  loading,
}: AttendanceAnalyticsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large">
          <div className="pt-8 text-gray-500">Đang tải phân tích chấm công...</div>
        </Spin>
      </div>
    );
  }

  if (!data) {
    return (
      <Empty
        description="Chưa có dữ liệu chấm công"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Prepare chart data
  const chartData = [
    {
      name: "Đúng giờ",
      value: data.totalPresent - data.totalLate,
      fill: "#52c41a",
    },
    { name: "Đi muộn", value: data.totalLate, fill: "#faad14" },
    { name: "Vắng mặt", value: data.totalAbsent, fill: "#ff4d4f" },
  ];

  // Top performers table columns
  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Tỷ lệ chấm công",
      dataIndex: "attendanceRate",
      key: "attendanceRate",
      render: (rate: number) => (
        <span
          className="font-semibold"
          style={{ color: rate >= 95 ? "#52c41a" : "#faad14" }}
        >
          {rate.toFixed(1)}%
        </span>
      ),
      sorter: (a: any, b: any) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: "Số lần muộn",
      dataIndex: "lateCount",
      key: "lateCount",
      sorter: (a: any, b: any) => a.lateCount - b.lateCount,
    },
    {
      title: "Tổng ca",
      dataIndex: "totalShifts",
      key: "totalShifts",
      sorter: (a: any, b: any) => a.totalShifts - b.totalShifts,
    },
  ];

  return (
    <div>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng ngày làm việc"
              value={data.totalWorkDays}
              valueStyle={{ fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Đúng giờ"
              value={data.totalPresent - data.totalLate}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Đi muộn"
              value={data.totalLate}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Vắng mặt"
              value={data.totalAbsent}
              prefix={<StopOutlined />}
              valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Rates */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Tỷ lệ chấm công"
              value={data.attendanceRate.toFixed(1)}
              suffix="%"
              valueStyle={{
                color: "#52c41a",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Tỷ lệ đi muộn"
              value={data.lateRate.toFixed(1)}
              suffix="%"
              valueStyle={{
                color: "#faad14",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Tỷ lệ vắng mặt"
              value={data.absentRate.toFixed(1)}
              suffix="%"
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Card title="📊 Phân bố chấm công" className="shadow-sm mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Performers */}
      {data.topPerformers && data.topPerformers.length > 0 && (
        <Card title="🏆 Nhân viên xuất sắc" className="shadow-sm">
          <Table
            dataSource={data.topPerformers}
            columns={columns}
            rowKey="employeeId"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>
      )}
    </div>
  );
}
