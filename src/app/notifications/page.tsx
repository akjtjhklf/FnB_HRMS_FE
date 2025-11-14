"use client";

import React from "react";
import { Card, List, Button, Tag } from "antd";
import { notificationsMock } from "@/mock/mockData";

interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  level?: "info" | "warning" | "error";
  created_at?: string;
}

export default function NotificationsPage() {
  // Using mock notifications for UI prototype
  const data = notificationsMock as NotificationItem[];
  const loading = false;

  const levelColor = (l?: string) => {
    if (l === "warning") return "orange";
    if (l === "error") return "red";
    return "blue";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Thông báo</h2>
            <Button type="primary">Tạo thông báo</Button>
          </div>
        </Card>
      </div>

      <Card>
        <List
          loading={loading}
          dataSource={data}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={<div className="flex items-center gap-2"><Tag color={levelColor(item.level)}>{item.level || 'info'}</Tag><span className="font-medium">{item.title}</span></div>}
                description={<div className="text-sm text-gray-600">{item.body}</div>}
              />
              <div>{item.created_at}</div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
