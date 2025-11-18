"use client";

import { useTable } from "@refinedev/antd";
import { Card, Table, Tag, Button, Space, Tooltip } from "antd";
import { BellOutlined, PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body?: string;
  level?: "info" | "warning" | "error";
  created_at?: string;
}

export const NotificationList = () => {
  const { tableProps } = useTable<Notification>({
    resource: "notifications",
    syncWithLocation: true,
    pagination: {
      pageSize: 15,
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const levelColor = (level?: string) => {
    switch (level) {
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "processing";
    }
  };

  const columns = [
    {
      title: "Mức độ",
      dataIndex: "level",
      key: "level",
      width: 100,
      filters: [
        { text: "Thông tin", value: "info" },
        { text: "Cảnh báo", value: "warning" },
        { text: "Lỗi", value: "error" },
      ],
      render: (level: string) => (
        <Tag color={levelColor(level)}>{level || "info"}</Tag>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title: string) => (
        <span className="font-medium text-gray-900">{title}</span>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "body",
      key: "body",
      ellipsis: true,
      render: (body: string) => (
        <span className="text-gray-600">{body || "-"}</span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      sorter: true,
      render: (date: string) => (
        <span className="text-gray-700">{date ? formatDate(date) : "-"}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: Notification) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BellOutlined className="text-xl text-blue-600" />
              </div>
              Thông báo
            </h1>
            <p className="text-gray-500 mt-2 ml-[52px]">
              Quản lý thông báo hệ thống
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
          >
            Tạo thông báo
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thông báo`,
          }}
        />
      </div>
    </div>
  );
};
