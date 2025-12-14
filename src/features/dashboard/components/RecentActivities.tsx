import React from "react";
import { Card } from "@/components/ui/Card";
import { Typography, Button, Empty, Spin, Tag } from "antd";
import { Activity, Clock } from "lucide-react";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/axios-config/apiClient";

const { Title, Text } = Typography;

interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  time: string;
}

export const RecentActivities: React.FC = () => {
  // Fetch recent activities from API using react-query directly
  const { data, isLoading, error } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const response = await axiosClient.get<{ success: boolean; data: ActivityItem[] }>(
        "/analytics/recent-activities",
        { params: { limit: 5 } }
      );
      console.log("API Response:", response.data);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Debug
  console.log("=== RecentActivities Debug ===");
  console.log("data:", data);
  console.log("isLoading:", isLoading);
  console.log("error:", error);

  const activities = data?.data || [];
  
  console.log("activities:", activities);

  // Get action color based on action text
  const getActionColor = (action: string) => {
    if (action.includes("Check-in")) return "green";
    if (action.includes("Check-out")) return "blue";
    if (action.includes("Duyệt")) return "success";
    if (action.includes("Gửi")) return "processing";
    if (action.includes("Tạo")) return "default";
    if (action.includes("Thêm")) return "purple";
    if (action.includes("Yêu cầu")) return "warning";
    return "default";
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
        {/* <Button type="link" size="small">
          Xem tất cả
        </Button> */}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : activities.length === 0 ? (
          <Empty description="Chưa có hoạt động nào" />
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Tag color={getActionColor(activity.action)} className="m-0">
                    {activity.action}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-700 font-medium">
                    {activity.actor}
                  </Text>
                  <div className="flex items-center gap-1 text-xs text-gray-700">
                    <Clock size={12} />
                    {activity.time ? formatDistance(new Date(activity.time), new Date(), {
                      addSuffix: true,
                      locale: vi,
                    }) : 'Chưa có'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
