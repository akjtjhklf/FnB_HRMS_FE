import React from "react";
import { Card } from "@/components/ui/Card";
import { Typography, Avatar, Badge, Button, Empty } from "antd";
import { Activity, Clock, UserCheck, UserX, AlertCircle } from "lucide-react";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";

const { Title, Text } = Typography;

interface ActivityItem {
  id: string;
  type: "check_in" | "check_out" | "absent" | "late" | "request";
  employee: {
    name: string;
    avatar?: string;
  };
  time: Date;
  description: string;
}

export const RecentActivities: React.FC = () => {
  // Mock data - replace with actual data
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "check_in",
      employee: { name: "Nguyễn Văn A" },
      time: new Date(Date.now() - 5 * 60000),
      description: "Đã check-in",
    },
    {
      id: "2",
      type: "late",
      employee: { name: "Trần Thị B" },
      time: new Date(Date.now() - 15 * 60000),
      description: "Đi muộn 15 phút",
    },
    {
      id: "3",
      type: "check_out",
      employee: { name: "Lê Văn C" },
      time: new Date(Date.now() - 25 * 60000),
      description: "Đã check-out",
    },
    {
      id: "4",
      type: "request",
      employee: { name: "Phạm Thị D" },
      time: new Date(Date.now() - 35 * 60000),
      description: "Yêu cầu nghỉ phép",
    },
    {
      id: "5",
      type: "absent",
      employee: { name: "Hoàng Văn E" },
      time: new Date(Date.now() - 45 * 60000),
      description: "Vắng mặt không phép",
    },
  ];

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "check_in":
        return <UserCheck size={16} className="text-green-600" />;
      case "check_out":
        return <UserCheck size={16} className="text-blue-600" />;
      case "late":
        return <Clock size={16} className="text-orange-600" />;
      case "absent":
        return <UserX size={16} className="text-red-600" />;
      case "request":
        return <AlertCircle size={16} className="text-purple-600" />;
      default:
        return <Activity size={16} />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "check_in":
        return "green";
      case "check_out":
        return "blue";
      case "late":
        return "orange";
      case "absent":
        return "red";
      case "request":
        return "purple";
      default:
        return "default";
    }
  };

  return (
    <Card
      className="h-full"
      styles={{
        body: { padding: "24px", height: "100%" },
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Activity className="text-purple-600" size={20} />
          </div>
          <div>
            <Title level={4} className="!mb-0">
              Hoạt động gần đây
            </Title>
            <Text className="text-gray-500 text-sm">
              Cập nhật theo thời gian thực
            </Text>
          </div>
        </div>
        <Button type="link" size="small">
          Xem tất cả
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <Empty description="Chưa có hoạt động nào" />
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Avatar
                size={40}
                src={activity.employee.avatar}
                style={{
                  backgroundColor: `#${Math.floor(
                    Math.random() * 16777215
                  ).toString(16)}`,
                }}
              >
                {activity.employee.name.charAt(0)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Text strong className="text-sm">
                    {activity.employee.name}
                  </Text>
                  <Badge
                    count={getActivityIcon(activity.type)}
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>
                <Text className="text-sm text-gray-600">
                  {activity.description}
                </Text>
                <Text className="text-xs text-gray-400">
                  {formatDistance(activity.time, new Date(), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </Text>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
