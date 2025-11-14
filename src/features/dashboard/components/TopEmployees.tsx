import React from "react";
import { Card } from "@/components/ui/Card";
import { Typography, Avatar, Progress, Empty, Button } from "antd";
import { Trophy, TrendingUp } from "lucide-react";

const { Title, Text } = Typography;

interface TopEmployee {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  attendanceRate: number;
  hoursWorked: number;
  rank: number;
}

export const TopEmployees: React.FC = () => {
  // Mock data - replace with actual data
  const topEmployees: TopEmployee[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      position: "Quản lý",
      attendanceRate: 98,
      hoursWorked: 180,
      rank: 1,
    },
    {
      id: "2",
      name: "Trần Thị B",
      position: "Nhân viên",
      attendanceRate: 96,
      hoursWorked: 175,
      rank: 2,
    },
    {
      id: "3",
      name: "Lê Văn C",
      position: "Nhân viên",
      attendanceRate: 95,
      hoursWorked: 172,
      rank: 3,
    },
    {
      id: "4",
      name: "Phạm Thị D",
      position: "Tạp vụ",
      attendanceRate: 93,
      hoursWorked: 168,
      rank: 4,
    },
    {
      id: "5",
      name: "Hoàng Văn E",
      position: "Bảo vệ",
      attendanceRate: 92,
      hoursWorked: 165,
      rank: 5,
    },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-500";
      default:
        return "text-gray-300";
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 95) return "#52c41a";
    if (rate >= 85) return "#1890ff";
    if (rate >= 75) return "#faad14";
    return "#f5222d";
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
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Trophy className="text-yellow-600" size={20} />
          </div>
          <div>
            <Title level={4} className="!mb-0">
              Nhân viên xuất sắc
            </Title>
            <Text className="text-gray-500 text-sm">
              Top 5 tháng này
            </Text>
          </div>
        </div>
        <Button type="link" size="small" icon={<TrendingUp size={14} />}>
          Xem bảng xếp hạng
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {topEmployees.length === 0 ? (
          <Empty description="Chưa có dữ liệu" />
        ) : (
          topEmployees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <Avatar
                  size={48}
                  src={employee.avatar}
                  style={{
                    backgroundColor: `#${Math.floor(
                      Math.random() * 16777215
                    ).toString(16)}`,
                  }}
                >
                  {employee.name.charAt(0)}
                </Avatar>
                <div
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center ${getRankColor(
                    employee.rank
                  )}`}
                >
                  <Trophy size={14} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Text strong className="text-sm">
                    {employee.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {employee.hoursWorked}h
                  </Text>
                </div>
                <Text className="text-xs text-gray-500 block mb-2">
                  {employee.position}
                </Text>
                <div className="flex items-center gap-2">
                  <Progress
                    percent={employee.attendanceRate}
                    size="small"
                    strokeColor={getProgressColor(employee.attendanceRate)}
                    className="flex-1"
                  />
                  <Text className="text-xs font-medium" style={{ color: getProgressColor(employee.attendanceRate) }}>
                    {employee.attendanceRate}%
                  </Text>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
