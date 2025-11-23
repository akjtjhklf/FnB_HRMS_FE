"use client";

import { Button, Space, App } from "antd";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { ExportFormat, ReportType } from "@/types/report";

interface ExportButtonsProps {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  disabled?: boolean;
}

export const ExportButtons = ({
  reportType,
  startDate,
  endDate,
  disabled,
}: ExportButtonsProps) => {
  const { message } = App.useApp();

  const handleExport = (format: ExportFormat) => {
    // Mock export logic - sẽ implement sau khi BE có API
    const reportTypeText = {
      employees: "Nhân viên",
      attendance: "Chấm công",
      payroll: "Lương",
      schedule: "Lịch làm việc",
    }[reportType];

    message.info(
      `Đang xuất báo cáo ${reportTypeText} sang ${format.toUpperCase()}...`
    );

    // TODO: Call BE API to export
    // const params = {
    //   reportType,
    //   startDate,
    //   endDate,
    //   format,
    // };
    // await exportReport(params);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        4. Xuất báo cáo
      </h3>
      <Space size="middle">
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          size="large"
          onClick={() => handleExport("excel")}
          disabled={disabled}
          className="bg-green-600 hover:bg-green-700 border-green-600"
        >
          Xuất Excel
        </Button>
        <Button
          type="default"
          icon={<FilePdfOutlined />}
          size="large"
          onClick={() => handleExport("pdf")}
          disabled={disabled}
          className="border-red-500 text-red-500 hover:border-red-600 hover:text-red-600"
        >
          Xuất PDF
        </Button>
      </Space>
      {disabled && (
        <p className="text-sm text-gray-500 mt-2">
          Vui lòng chọn loại báo cáo và khoảng thời gian trước khi xuất
        </p>
      )}
    </div>
  );
};
