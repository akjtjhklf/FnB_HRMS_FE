"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin, Empty } from "antd";
import { UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { EmployeeAnalytics as EmployeeAnalyticsType } from "../api/analyticsApi";

interface EmployeeAnalyticsProps {
  data: EmployeeAnalyticsType | null;
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#52c41a",
  on_leave: "#faad14",
  suspended: "#ff7875",
  terminated: "#8c8c8c",
};

const GENDER_COLORS: Record<string, string> = {
  male: "#1890ff",
  female: "#eb2f96",
  other: "#722ed1",
};

export function EmployeeAnalytics({ data, loading }: EmployeeAnalyticsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Đang tải phân tích nhân viên..." />
      </div>
    );
  }

  if (!data) {
    return (
      <Empty
        description="Chưa có dữ liệu nhân viên"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng số nhân viên"
              value={data.totalCount}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{
                color: "#1890ff",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="shadow-sm">
            <Statistic
              title="Nhân viên đang làm việc"
              value={data.activeCount}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Status Distribution */}
        {data.byStatus && data.byStatus.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title="📊 Phân bố theo trạng thái" className="shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.byStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) =>
                      `${entry.status}: ${
                        entry.count
                      } (${entry.percentage.toFixed(1)}%)`
                    }
                  >
                    {data.byStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || "#8884d8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {/* Gender Distribution */}
        {data.byGender && data.byGender.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title="👥 Phân bố theo giới tính" className="shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.byGender}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) =>
                      `${entry.gender}: ${
                        entry.count
                      } (${entry.percentage.toFixed(1)}%)`
                    }
                  >
                    {data.byGender.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GENDER_COLORS[entry.gender] || "#8884d8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}
      </Row>

      {/* Status Details Table */}
      {data.byStatus && data.byStatus.length > 0 && (
        <Card title="📋 Chi tiết trạng thái" className="shadow-sm mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Tỷ lệ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.byStatus.map((item) => (
                  <tr key={item.status}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: `${STATUS_COLORS[item.status]}20`,
                          color: STATUS_COLORS[item.status],
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
