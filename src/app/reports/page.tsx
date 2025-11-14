"use client";

import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Button, Select } from "antd";
import { reportsMock, reportsBreakdown } from "@/mock/mockData";

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            title={`${d.label}: ${d.value}`}
            style={{ height: `${(d.value / max) * 100}%` }}
            className="w-full bg-blue-400 rounded-t-sm"
          />
          <div className="text-xs text-gray-600 mt-1 truncate">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const stats = reportsMock;

  const daily = useMemo(() => reportsBreakdown.dailyAssignments.map((d) => ({ label: d.date.slice(5), value: d.assignments })), []);
  const positions = useMemo(() => reportsBreakdown.positionCoverage.map((p) => ({ label: p.position, value: p.coverage })), []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Thống kê</h2>
            <div className="flex items-center gap-3">
              <Select defaultValue="7" style={{ width: 120 }} options={[{ label: '7 ngày', value: '7' }, { label: '30 ngày', value: '30' }]} />
              <Button>Xuất báo cáo</Button>
            </div>
          </div>
        </Card>
      </div>

      <Row gutter={16} className="mb-6">
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Tổng nhân viên" value={stats.totalEmployees} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Ca đã phân" value={stats.assignedShifts} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Tỷ lệ phủ" value={stats.coverageRate} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Giờ OT" value={stats.overtimeHours} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} md={16}>
          <Card title="Phân công theo ngày (7 ngày gần nhất)">
            <MiniBarChart data={daily} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Tỷ lệ phủ theo vị trí">
            <MiniBarChart data={positions} />
          </Card>
        </Col>
      </Row>

      <Card>
        <p className="text-sm text-gray-600">Báo cáo chi tiết có thể được mở rộng bằng biểu đồ thời gian thực, heatmap hoặc bảng phân tích.</p>
      </Card>
    </div>
  );
}
