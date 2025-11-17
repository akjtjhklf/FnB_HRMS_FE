"use client";

import React from "react";
import { Card, Table, Button, Space, Tag } from "antd";
import { attendanceMock } from "@/mock/mockData";
import type { ColumnsType } from "antd/es/table";

interface AttendanceRecord {
  id: string;
  employee_name: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status?: string;
}

export default function AttendancePage() {
  // Using mock data for UI prototype
  const data = attendanceMock as AttendanceRecord[];
  const loading = false;

  const columns: ColumnsType<AttendanceRecord> = [
    { title: "Nhân viên", dataIndex: "employee_name", key: "employee_name" },
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Vào", dataIndex: "clock_in", key: "clock_in" },
    { title: "Ra", dataIndex: "clock_out", key: "clock_out" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag>{s || "--"}</Tag>,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chấm công</h2>
            <Space>
              <Button type="primary">Thêm chấm công</Button>
              <Button>Xuất báo cáo</Button>
            </Space>
          </div>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(r) => r.id}
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
}
