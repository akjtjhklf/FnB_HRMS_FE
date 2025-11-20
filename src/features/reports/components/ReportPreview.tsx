"use client";

import { Card, Row, Col, Statistic, Table, Empty, Spin } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import {
  ReportType,
  EmployeeReport,
  AttendanceReport,
  PayrollReport,
  ScheduleReport,
  ReportData,
} from "@/types/report";

interface ReportPreviewProps {
  reportType: ReportType;
  data?: ReportData;
  loading?: boolean;
}

export const ReportPreview = ({
  reportType,
  data,
  loading,
}: ReportPreviewProps) => {
  if (loading) {
    return (
      <Card className="shadow-sm">
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="shadow-sm">
        <Empty
          description="Chưa có dữ liệu"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const renderEmployeeReport = (report: EmployeeReport) => (
    <>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng NV</span>}
              value={report.totalEmployees}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Đang làm việc</span>}
              value={report.activeEmployees}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Nghỉ phép</span>}
              value={report.onLeaveEmployees}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#fa8c16", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600 font-medium">Đã nghỉ việc</span>}
              value={report.inactiveEmployees}
              prefix={<StopOutlined className="text-gray-500" />}
              valueStyle={{ color: "#8c8c8c", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {report.byDepartment && (
        <Card title="📊 Thống kê theo phòng ban" className="shadow-sm mb-4">
          <Table
            dataSource={report.byDepartment}
            pagination={false}
            size="small"
            columns={[
              {
                title: "Phòng ban",
                dataIndex: "department",
                key: "department",
              },
              {
                title: "Số lượng",
                dataIndex: "count",
                key: "count",
                align: "right",
              },
            ]}
          />
        </Card>
      )}
    </>
  );

  const renderAttendanceReport = (report: AttendanceReport) => {
    const formatCurrency = (value: number) =>
      Math.round(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return (
      <>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Tổng bản ghi"
                value={report.totalLogs}
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Đúng giờ"
                value={report.onTimeCount}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Đi muộn"
                value={report.lateCount}
                valueStyle={{ color: "#faad14", fontSize: "20px" }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="TB giờ làm/ngày"
                value={report.averageWorkHours.toFixed(1)}
                suffix="h"
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
        </Row>

        {report.byEmployee && (
          <Card title="📋 Chi tiết theo nhân viên" className="shadow-sm">
            <Table
              dataSource={report.byEmployee}
              pagination={{ pageSize: 10 }}
              size="small"
              scroll={{ x: 600 }}
              columns={[
                {
                  title: "Nhân viên",
                  dataIndex: "employeeName",
                  key: "employeeName",
                  fixed: "left",
                },
                {
                  title: "Tổng giờ",
                  dataIndex: "totalHours",
                  key: "totalHours",
                  align: "right",
                  render: (val: number) => `${val.toFixed(1)}h`,
                },
                {
                  title: "Số lần muộn",
                  dataIndex: "lateCount",
                  key: "lateCount",
                  align: "right",
                },
              ]}
            />
          </Card>
        )}
      </>
    );
  };

  const renderPayrollReport = (report: PayrollReport) => {
    const formatCurrency = (value: number) =>
      Math.round(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return (
      <>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Tổng nhân viên"
                value={report.totalEmployees}
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Tổng lương"
                value={report.totalGrossSalary}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: "#1890ff", fontSize: "20px" }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Thực lãnh"
                value={report.totalNetSalary}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Lương TB"
                value={report.averageSalary}
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ fontSize: "20px" }}
              />
            </Card>
          </Col>
        </Row>

        {report.byEmployee && (
          <Card title="💰 Lương theo nhân viên" className="shadow-sm">
            <Table
              dataSource={report.byEmployee}
              pagination={{ pageSize: 10 }}
              size="small"
              scroll={{ x: 600 }}
              columns={[
                {
                  title: "Nhân viên",
                  dataIndex: "employeeName",
                  key: "employeeName",
                  fixed: "left",
                },
                {
                  title: "Lương thực lãnh",
                  dataIndex: "netSalary",
                  key: "netSalary",
                  align: "right",
                  render: (val: number) => (
                    <span className="font-semibold text-green-600">
                      {formatCurrency(val)} VNĐ
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        )}
      </>
    );
  };

  const renderScheduleReport = (report: ScheduleReport) => (
    <>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tổng ca"
              value={report.totalShifts}
              valueStyle={{ fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Đã phân công"
              value={report.assignedShifts}
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Tỷ lệ phủ"
              value={report.coverageRate}
              suffix="%"
              valueStyle={{ color: "#1890ff", fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Giờ OT"
              value={report.overtimeHours}
              suffix="h"
              valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
            />
          </Card>
        </Col>
      </Row>

      {report.byPosition && (
        <Card title="📌 Phân công theo vị trí" className="shadow-sm">
          <Table
            dataSource={report.byPosition}
            pagination={false}
            size="small"
            columns={[
              {
                title: "Vị trí",
                dataIndex: "position",
                key: "position",
              },
              {
                title: "Đã phân",
                dataIndex: "assignedCount",
                key: "assignedCount",
                align: "right",
              },
              {
                title: "Yêu cầu",
                dataIndex: "requiredCount",
                key: "requiredCount",
                align: "right",
              },
              {
                title: "Tỷ lệ",
                key: "rate",
                align: "right",
                render: (_: any, record: any) => {
                  const rate =
                    record.requiredCount > 0
                      ? ((record.assignedCount / record.requiredCount) * 100).toFixed(
                          1
                        )
                      : 0;
                  return `${rate}%`;
                },
              },
            ]}
          />
        </Card>
      )}
    </>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        3. Xem trước báo cáo
      </h3>
      {reportType === "employees" && renderEmployeeReport(data as EmployeeReport)}
      {reportType === "attendance" &&
        renderAttendanceReport(data as AttendanceReport)}
      {reportType === "payroll" && renderPayrollReport(data as PayrollReport)}
      {reportType === "schedule" && renderScheduleReport(data as ScheduleReport)}
    </div>
  );
};
