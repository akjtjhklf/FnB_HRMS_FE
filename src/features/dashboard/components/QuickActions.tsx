import React from "react";
import { Card } from "@/components/ui/Card";
import { Typography, Button, Space } from "antd";
import {
  UserPlus,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  href?: string;
  onClick?: () => void;
}

export const QuickActions: React.FC = () => {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      title: "Thêm nhân viên",
      description: "Tạo hồ sơ nhân viên mới",
      icon: <UserPlus size={20} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      href: "/employees/create",
    },
    {
      title: "Xếp lịch làm việc",
      description: "Phân công ca làm việc",
      icon: <Calendar size={20} />,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      href: "/schedule/weekly/create",
    },
    {
      title: "Tính lương",
      description: "Xử lý bảng lương",
      icon: <DollarSign size={20} />,
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
      href: "/salary/schemes",
    },
    {
      title: "Báo cáo",
      description: "Xuất báo cáo tổng hợp",
      icon: <FileText size={20} />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      onClick: () => alert("Chức năng báo cáo đang phát triển"),
    },
    // {
    //   title: "Cài đặt",
    //   description: "Cấu hình hệ thống",
    //   icon: <Settings size={20} />,
    //   color: "text-gray-600",
    //   bgColor: "bg-gray-50 hover:bg-gray-100",
    //   onClick: () => alert("Chức năng cài đặt đang phát triển"),
    // },
    // {
    //   title: "Xuất dữ liệu",
    //   description: "Tải xuống Excel/PDF",
    //   icon: <Download size={20} />,
    //   color: "text-cyan-600",
    //   bgColor: "bg-cyan-50 hover:bg-cyan-100",
    //   onClick: () => alert("Chức năng xuất dữ liệu đang phát triển"),
    // },
  ];

  const handleActionClick = (action: QuickAction) => {
    if (action.href) {
      router.push(action.href);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <Card
      styles={{
        body: { padding: "24px" },
      }}
    >
      <Title level={4} className="!mb-4">
        Thao tác nhanh
      </Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={`flex items-start gap-3 p-4 rounded-lg border border-gray-200 transition-all duration-200 ${action.bgColor} hover:shadow-md hover:scale-105`}
          >
            <div className={`p-2 rounded-lg bg-white ${action.color}`}>
              {action.icon}
            </div>
            <div className="flex-1 text-left">
              <Text strong className="block text-sm">
                {action.title}
              </Text>
              <Text className="text-xs text-gray-500">
                {action.description}
              </Text>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
