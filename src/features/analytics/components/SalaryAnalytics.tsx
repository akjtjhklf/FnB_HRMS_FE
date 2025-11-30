"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin, Empty } from "antd";
import { DollarOutlined, BankOutlined, RiseOutlined } from "@ant-design/icons";
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
import type { SalaryAnalytics as SalaryAnalyticsType } from "../api/analyticsApi";

interface SalaryAnalyticsProps {
  data: SalaryAnalyticsType | null;
  loading?: boolean;
}

export function SalaryAnalytics({ data, loading }: SalaryAnalyticsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Đang tải phân tích lương..." />
      </div>
    );
  }

  if (!data) {
    return (
      <Empty
        description="Chưa có dữ liệu lương"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng quỹ lương (Ước tính)"
              value={data.totalPayroll}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BankOutlined style={{ color: "#cf1322" }} />}
              valueStyle={{
                color: "#cf1322",
                fontWeight: "bold",
                fontSize: "24px",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Lương trung bình"
              value={data.averageSalary}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: "#faad14" }} />}
              valueStyle={{
                color: "#faad14",
                fontWeight: "bold",
                fontSize: "24px",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm">
            <Statistic
              title="Thực nhận (Ước tính)"
              value={data.totalNetPay}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontWeight: "bold",
                fontSize: "24px",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="💰 Phân bố mức lương" className="shadow-sm">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data.salaryDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [value, "Số nhân viên"]} />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Số lượng nhân viên"
                  fill="#1890ff"
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
