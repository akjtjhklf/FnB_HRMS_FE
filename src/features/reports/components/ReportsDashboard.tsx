"use client";

import { useMemo } from "react";
import { Card, Row, Col, Statistic, Button, Select } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
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

export const ReportsDashboard = () => {
  const stats = reportsMock;

  const daily = useMemo(
    () =>
      reportsBreakdown.dailyAssignments.map((d) => ({
        label: d.date.slice(5),
        value: d.assignments,
      })),
    []
  );

  const positions = useMemo(
    () =>
      reportsBreakdown.positionCoverage.map((p) => ({
        label: p.position,
        value: p.coverage,
      })),
    []
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChartOutlined className="text-xl text-orange-600" />
              </div>
              Báo cáo thống kê
            </h1>
            <p className="text-gray-500 mt-2 ml-[52px]">
              Phân tích và báo cáo hiệu suất làm việc
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              defaultValue="7"
              style={{ width: 120 }}
              options={[
                { label: "7 ngày", value: "7" },
                { label: "30 ngày", value: "30" },
              ]}
            />
            <Button type="primary">Xuất báo cáo</Button>
          </div>
        </div>
      </div>

      <Row gutter={16} className="mb-6">
        <Col xs={24} md={6}>
          <Card className="shadow-sm">
            <Statistic title="Tổng nhân viên" value={stats.totalEmployees} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="shadow-sm">
            <Statistic title="Ca đã phân" value={stats.assignedShifts} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tỷ lệ phủ"
              value={stats.coverageRate}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="shadow-sm">
            <Statistic title="Giờ OT" value={stats.overtimeHours} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} md={16}>
          <Card title="Phân công theo ngày (7 ngày gần nhất)" className="shadow-sm">
            <MiniBarChart data={daily} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Tỷ lệ phủ theo vị trí" className="shadow-sm">
            <MiniBarChart data={positions} />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <p className="text-sm text-gray-600">
          Báo cáo chi tiết có thể được mở rộng bằng biểu đồ thời gian thực,
          heatmap hoặc bảng phân tích.
        </p>
      </Card>
    </div>
  );
};
