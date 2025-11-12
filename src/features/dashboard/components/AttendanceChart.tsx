import React from "react";
import { Card } from "@/components/ui/Card";
import { Typography, Segmented, Empty } from "antd";
import { BarChart3 } from "lucide-react";
import { useDashboardStore } from "../stores/dashboardStore";

const { Title, Text } = Typography;

export const AttendanceChart: React.FC = () => {
  const { selectedPeriod, setSelectedPeriod } = useDashboardStore();

  // Mock data - replace with actual data
  const chartData = [
    { day: "Mon", present: 45, absent: 5, late: 3 },
    { day: "Tue", present: 48, absent: 2, late: 2 },
    { day: "Wed", present: 46, absent: 4, late: 4 },
    { day: "Thu", present: 47, absent: 3, late: 5 },
    { day: "Fri", present: 44, absent: 6, late: 2 },
    { day: "Sat", present: 30, absent: 20, late: 1 },
    { day: "Sun", present: 10, absent: 40, late: 0 },
  ];

  const maxValue = Math.max(
    ...chartData.map((d) => d.present + d.absent + d.late)
  );

  return (
    <Card
      className="h-full"
      styles={{
        body: { padding: "24px", height: "100%" },
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="text-blue-600" size={20} />
          </div>
          <div>
            <Title level={4} className="!mb-0">
              Biểu đồ chấm công
            </Title>
            <Text className="text-gray-500 text-sm">
              Thống kê theo tuần
            </Text>
          </div>
        </div>
        <Segmented
          value={selectedPeriod}
          onChange={(value) =>
            setSelectedPeriod(value as "today" | "week" | "month" | "year")
          }
          options={[
            { label: "Hôm nay", value: "today" },
            { label: "Tuần", value: "week" },
            { label: "Tháng", value: "month" },
            { label: "Năm", value: "year" },
          ]}
          size="small"
        />
      </div>

      <div className="space-y-4">
        {chartData.map((data, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <Text className="font-medium">{data.day}</Text>
              <Text className="text-gray-500">
                {data.present + data.absent + data.late}
              </Text>
            </div>
            <div className="flex gap-1 h-8">
              <div
                className="bg-green-500 rounded transition-all duration-300 hover:bg-green-600"
                style={{ width: `${(data.present / maxValue) * 100}%` }}
                title={`Có mặt: ${data.present}`}
              />
              <div
                className="bg-orange-500 rounded transition-all duration-300 hover:bg-orange-600"
                style={{ width: `${(data.late / maxValue) * 100}%` }}
                title={`Đi muộn: ${data.late}`}
              />
              <div
                className="bg-red-500 rounded transition-all duration-300 hover:bg-red-600"
                style={{ width: `${(data.absent / maxValue) * 100}%` }}
                title={`Vắng mặt: ${data.absent}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <Text className="text-sm">Có mặt</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded" />
          <Text className="text-sm">Đi muộn</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <Text className="text-sm">Vắng mặt</Text>
        </div>
      </div>
    </Card>
  );
};
