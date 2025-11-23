"use client";

import { Card, Row, Col } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { ReportType } from "@/types/report";

interface ReportSelectorProps {
  selectedType: ReportType;
  onSelect: (type: ReportType) => void;
}

export const ReportSelector = ({
  selectedType,
  onSelect,
}: ReportSelectorProps) => {
  const reportTypes = [
    {
      type: "employees" as ReportType,
      title: "Báo cáo nhân viên",
      description: "Thống kê tổng quan nhân sự",
      icon: <UserOutlined className="text-3xl" />,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
    },
    {
      type: "attendance" as ReportType,
      title: "Báo cáo chấm công",
      description: "Phân tích giờ làm việc",
      icon: <ClockCircleOutlined className="text-3xl" />,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
    },
    {
      type: "payroll" as ReportType,
      title: "Báo cáo lương",
      description: "Thống kê bảng lương",
      icon: <DollarOutlined className="text-3xl" />,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
    },
    {
      type: "schedule" as ReportType,
      title: "Báo cáo lịch làm việc",
      description: "Phân tích ca làm việc",
      icon: <CalendarOutlined className="text-3xl" />,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        1. Chọn loại báo cáo
      </h3>
      <Row gutter={[16, 16]}>
        {reportTypes.map((report) => {
          const isSelected = selectedType === report.type;
          return (
            <Col xs={24} sm={12} md={6} key={report.type}>
              <Card
                hoverable
                className={`transition-all cursor-pointer ${
                  isSelected
                    ? `${report.bgColor} border-2 ${report.borderColor} shadow-lg`
                    : "hover:shadow-md border border-gray-200"
                }`}
                onClick={() => onSelect(report.type)}
              >
                <div className="flex flex-col items-center text-center py-4">
                  <div
                    className={`mb-3 ${
                      isSelected ? report.textColor : "text-gray-400"
                    }`}
                  >
                    {report.icon}
                  </div>
                  <h4
                    className={`font-semibold mb-1 ${
                      isSelected ? report.textColor : "text-gray-900"
                    }`}
                  >
                    {report.title}
                  </h4>
                  <p className="text-xs text-gray-500">{report.description}</p>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
