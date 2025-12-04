import React from "react";
import { Button, Dropdown, MenuProps, message } from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { exportToExcel, exportToPdf } from "../utils/exportUtils";

interface ExportButtonProps {
  data: any[];
  fileName?: string;
  pdfColumns?: { header: string; dataKey: string }[];
  pdfTitle?: string;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName = "report",
  pdfColumns = [],
  pdfTitle = "Báo cáo",
  disabled = false,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleExportExcel = () => {
    try {
      if (pdfColumns.length === 0) {
        message.warning("Chưa cấu hình cột cho báo cáo");
        return;
      }
      exportToExcel(data, fileName, pdfColumns);
      message.success("Xuất Excel thành công");
    } catch (error) {
      console.error("Export Excel error:", error);
      message.error("Có lỗi khi xuất Excel");
    }
  };

  const handleExportPdf = async () => {
    try {
      if (pdfColumns.length === 0) {
        message.warning("Chưa cấu hình cột cho PDF");
        return;
      }
      setLoading(true);
      await exportToPdf(data, pdfColumns, fileName, pdfTitle);
      message.success("Xuất PDF thành công");
    } catch (error) {
      console.error("Export PDF error:", error);
      message.error("Có lỗi khi xuất PDF");
    } finally {
      setLoading(false);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "excel",
      label: "Xuất Excel (.xlsx)",
      icon: <FileExcelOutlined style={{ color: "#52c41a" }} />,
      onClick: handleExportExcel,
    },
    {
      key: "pdf",
      label: "Xuất PDF (.pdf)",
      icon: <FilePdfOutlined style={{ color: "#ff4d4f" }} />,
      onClick: handleExportPdf,
      disabled: pdfColumns.length === 0,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      disabled={disabled || !data || data.length === 0 || loading}
    >
      <Button icon={<DownloadOutlined />} loading={loading}>
        {loading ? "Đang xuất..." : "Xuất báo cáo"}
      </Button>
    </Dropdown>
  );
};
