"use client";

import React from "react";
import { Card, Table, Button, Space, Tag } from "antd";
import { salaryMock } from "@/mock/mockData";
import type { ColumnsType } from "antd/es/table";

interface SalaryRecord {
  id: string;
  employee_name: string;
  period: string;
  gross: number;
  net: number;
  status?: string;
}

export default function SalaryPage() {
  // Mock data for UI prototype
  const data = salaryMock as SalaryRecord[];
  const loading = false;

  const columns: ColumnsType<SalaryRecord> = [
    { title: "Nhân viên", dataIndex: "employee_name", key: "employee_name" },
    { title: "Kỳ", dataIndex: "period", key: "period" },
    { title: "Tổng lương", dataIndex: "gross", key: "gross", render: (v) => v?.toLocaleString() },
    { title: "Lương thực nhận", dataIndex: "net", key: "net", render: (v) => v?.toLocaleString() },
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
            <h2 className="text-lg font-semibold">Bảng lương</h2>
            <Space>
              <Button type="primary">Tạo bảng lương</Button>
              <Button>Xuất Excel</Button>
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
