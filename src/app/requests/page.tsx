"use client";

import React, { useMemo, useState } from "react";
import { Card, Table, Tag, Button, Space, Modal, Typography, Input, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { requestsMock } from "@/mock/mockData";

type RequestItem = typeof requestsMock[number];

export default function RequestsPage() {
  const [items, setItems] = useState<RequestItem[]>(requestsMock.map((r) => ({ ...r })));
  const [viewing, setViewing] = useState<RequestItem | null>(null);
  const [search, setSearch] = useState("");

  const updateStatus = (id: string, status: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    if (viewing?.id === id) setViewing({ ...(viewing as any), status } as RequestItem);
  };

  const columns: ColumnsType<RequestItem> = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (t) => <span className="font-medium">{t}</span> },
    { title: 'Người yêu cầu', dataIndex: 'requester', key: 'requester' },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: (t) => <Tag>{t}</Tag> },
    { title: 'Ngày', dataIndex: 'created_at', key: 'created_at' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => {
      if (s === 'pending') return <Tag color="gold">Chờ</Tag>;
      if (s === 'approved') return <Tag color="green">Đã duyệt</Tag>;
      if (s === 'rejected') return <Tag color="red">Từ chối</Tag>;
      return <Tag>{s}</Tag>;
    }},
    { title: 'Hành động', key: 'actions', width: 220, render: (_, record) => (
      <Space>
        <Button size="small" onClick={() => setViewing(record)}>Xem</Button>
        {record.status === 'pending' && (
          <>
            <Button size="small" type="primary" onClick={() => updateStatus(record.id, 'approved')}>Duyệt</Button>
            <Button size="small" danger onClick={() => updateStatus(record.id, 'rejected')}>Từ chối</Button>
          </>
        )}
      </Space>
    )}
  ];

  const filtered = useMemo(() => {
    return items.filter((it) => it.title.toLowerCase().includes(search.toLowerCase()) || it.requester.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const tabs = [
    { key: 'all', label: 'Tất cả', filter: () => true },
    { key: 'pending', label: 'Chờ duyệt', filter: (it: RequestItem) => it.status === 'pending' },
    { key: 'approved', label: 'Đã duyệt', filter: (it: RequestItem) => it.status === 'approved' },
    { key: 'rejected', label: 'Từ chối', filter: (it: RequestItem) => it.status === 'rejected' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Yêu cầu</h2>
            <Space>
              <Input.Search placeholder="Tìm theo tiêu đề hoặc tên" onSearch={(v) => setSearch(v)} allowClear style={{ width: 300 }} />
              <Button type="primary">Tạo yêu cầu mới</Button>
            </Space>
          </div>
        </Card>
      </div>

      <Card>
        <Tabs defaultActiveKey="all">
          {tabs.map((t) => (
            <Tabs.TabPane tab={t.label} key={t.key}>
              <Table
                columns={columns}
                dataSource={filtered.filter(t.filter)}
                rowKey={(r) => r.id}
                pagination={{ pageSize: 10 }}
              />
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal
        title={viewing?.title}
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={null}
      >
        {viewing && (
          <div className="space-y-3">
            <Typography.Paragraph className="text-sm">{viewing.description}</Typography.Paragraph>
            <div className="text-xs text-gray-500">Người gửi: {viewing.requester}</div>
            <div className="text-xs text-gray-500">Ngày: {viewing.created_at}</div>
            <div className="pt-3 flex gap-2">
              {viewing.status === 'pending' && (
                <>
                  <Button type="primary" onClick={() => { updateStatus(viewing.id, 'approved'); setViewing(null); }}>Duyệt</Button>
                  <Button danger onClick={() => { updateStatus(viewing.id, 'rejected'); setViewing(null); }}>Từ chối</Button>
                </>
              )}
              <Button onClick={() => setViewing(null)}>Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
