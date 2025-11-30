"use client";

import { Contract } from "@/types/employee";
import { useList } from "@refinedev/core";
import { Card, Table, Tag } from "antd";
import { FileText, Calendar, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProfileContractListProps {
  employeeId: string;
}

export const ProfileContractList: React.FC<ProfileContractListProps> = ({
  employeeId,
}) => {
  const { query } = useList<Contract>({
    resource: "contracts",
    filters: [
      {
        field: "employee_id",
        operator: "eq",
        value: employeeId,
      },
    ],
  });

  const { data, isLoading } = query;
  const contracts = data?.data || [];

  const getContractTypeText = (type: string) => {
    switch (type) {
      case "full_time":
        return "Toàn thời gian";
      case "part_time":
        return "Bán thời gian";
      case "contract":
        return "Hợp đồng";
      case "internship":
        return "Thực tập";
      default:
        return type;
    }
  };

  const getContractStatusTag = (contract: Contract) => {
    if (!contract.is_active) {
      return <Tag color="error">Đã chấm dứt</Tag>;
    }

    if (contract.end_date && new Date(contract.end_date) < new Date()) {
      return <Tag color="default">Đã hết hạn</Tag>;
    }

    return <Tag color="success">Đang hoạt động</Tag>;
  };

  const columns = [
    {
      title: "Loại hợp đồng",
      dataIndex: "contract_type",
      key: "contract_type",
      render: (type: string) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{getContractTypeText(type)}</span>
        </div>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {formatDate(date)}
        </div>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {date ? formatDate(date) : "Không có"}
        </div>
      ),
    },
    {
      title: "Lương",
      dataIndex: "salary",
      key: "salary",
      render: (salary: number) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(salary)}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: Contract) => getContractStatusTag(record),
    },
  ];

  return (
    <div>
      <Card
        className="border border-gray-200 shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Danh sách hợp đồng
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
          }}
          locale={{
            emptyText: (
              <div className="py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có hợp đồng nào</p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};
