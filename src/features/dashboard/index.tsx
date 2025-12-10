"use client";

import React, { useEffect, useState } from "react";
import { Typography, Button, Row, Col, Space } from "antd";
import {
  RefreshCw,
  Users,
  UserCheck,
  Clock,
  AlertCircle,
  Zap,
  Globe,
} from "lucide-react";
import { useDashboardStore } from "./stores/dashboardStore";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { StatCard } from "./components/StatCard";
import { TodayShiftsTable } from "./components/TodayShiftsTable";
import { RecentActivities } from "./components/RecentActivities";
import { QuickActions } from "./components/QuickActions";
// import { TopEmployees } from "./components/TopEmployees";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { stats, loading } = useDashboardStore();
  const { refresh } = useDashboardStats();

  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString("vi-VN"));
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Title level={2} className="!mb-2">
              Tổng quan
            </Title>
            <Text className="text-gray-500">
              Chào mừng trở lại! Đây là tổng quan hệ thống HRMS của bạn.
            </Text>
          </div>
          <Space>
            <Button
              type="default"
              icon={<RefreshCw size={16} />}
              onClick={refresh}
              loading={loading}
              title="Làm mới"
            />
            {/* <Button type="primary" icon={<Zap size={16} />}>
              Thao tác nhanh
            </Button> */}
          </Space>
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatCard
            title="Tổng nhân viên"
            value={stats.totalEmployees}
            icon={Users}
            color="blue"
            loading={loading}
            trend={{ value: 5, isPositive: true }}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatCard
            title="Đang làm việc"
            value={stats.activeEmployees}
            icon={UserCheck}
            color="green"
            loading={loading}
            trend={{ value: 2, isPositive: true }}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatCard
            title="Đi muộn"
            value={stats.lateToday}
            icon={Clock}
            color="orange"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatCard
            title="Yêu cầu chờ"
            value={stats.pendingRequests}
            icon={AlertCircle}
            color="orange"
            loading={loading}
          />
        </Col>
      </Row>

      {/* <Row gutter={[16, 16]} className="mb-6"> */}
      {/* <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Giờ tăng ca"
            value={`${stats.overtimeHours}h`}
            icon={Clock}
            color="purple"
            loading={loading}
          />
        </Col> */}

      {/* <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Thiết bị online"
            value={stats.devicesOnline}
            icon={Globe}
            color="green"
            loading={loading}
          />
        </Col> */}
      {/* </Row> */}

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Charts and Activities */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <TodayShiftsTable />
        </Col>
        <Col xs={24} lg={8}>
          <RecentActivities />
        </Col>
      </Row>

      {/* Top Employees */}
      {/* <Row gutter={[16, 16]}>
        <Col xs={24}>
          <TopEmployees />
        </Col>
      </Row> */}

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Text className="text-sm text-gray-500">
              Hệ thống đang hoạt động bình thường
            </Text>
          </div>
          <Text className="text-sm text-gray-400">
            Cập nhật lần cuối: {lastUpdated}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
