import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Typography, Spin, Empty } from "antd";
import { Calendar, Clock, Users } from "lucide-react";
import axiosInstance from "@/lib/axios-config";

const { Title, Text } = Typography;

interface TodayShift {
  id: string;
  shift_type_name: string;
  shift_type_code: string;
  start_time: string;
  end_time: string;
  color: string;
  total_required: number;
  total_assigned: number;
  status: "sufficient" | "insufficient";
}

export const TodayShiftsTable: React.FC = () => {
  const [shifts, setShifts] = useState<TodayShift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayShifts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/shifts/today");
        setShifts(response.data.data || []);
      } catch (error) {
        console.error("Error fetching today's shifts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayShifts();
  }, []);

  const columns = [
    {
      title: "Tên ca",
      dataIndex: "shift_type_name",
      key: "shift_type_name",
      render: (name: string, record: TodayShift) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: record.color }}
          />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: "Giờ làm",
      key: "hours",
      render: (_: any, record: TodayShift) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Clock size={14} />
          <Text>
            {record.start_time.substring(0, 5)} -{" "}
            {record.end_time.substring(0, 5)}
          </Text>
        </div>
      ),
    },
    {
      title: "Số lượng NV",
      key: "employees",
      render: (_: any, record: TodayShift) => (
        <div className="flex items-center gap-1">
          <Users size={14} />
          <Text>
            {record.total_assigned} / {record.total_required}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "sufficient" ? "green" : "orange"}>
          {status === "sufficient" ? "Đủ" : "Thiếu"}
        </Tag>
      ),
    },
  ];

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
            <Calendar className="text-blue-600" size={20} />
          </div>
          <div>
            <Title level={4} className="!mb-0">
              Ca làm việc hôm nay
            </Title>
            <Text className="text-gray-500 text-sm">
              Danh sách các ca trong ngày
            </Text>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : shifts.length === 0 ? (
        <Empty
          description="Không có ca làm việc nào hôm nay"
          className="py-8"
        />
      ) : (
        <Table
          dataSource={shifts}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      )}
    </Card>
  );
};
