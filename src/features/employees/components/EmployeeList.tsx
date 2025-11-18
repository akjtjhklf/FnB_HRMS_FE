"use client";

import { useTable } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import { Table, Space, Button, Avatar, Tag, Tooltip, App } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Employee } from "@/types/employee";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { Mail, Phone, Calendar } from "lucide-react";
import { useConfirmModalStore } from "@/store/confirmModalStore";

export const EmployeeList = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const { mutate: deleteEmployee } = useDelete();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);

  const { tableProps, sorters, filters } = useTable<Employee>({
    resource: "employees",
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

  const handleDelete = (record: Employee) => {
    openConfirm({
      title: "⚠️ Xác nhận xóa nhân viên",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa nhân viên{" "}
            <strong>
              {record.full_name || `${record.first_name} ${record.last_name}`}
            </strong>{" "}
            không?
          </p>
          <p className="text-gray-500 mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: async () => {
        await deleteEmployee({
          resource: "employees",
          id: record.id,
        });
        message.success("✅ Xóa nhân viên thành công!");
      },
    });
  };

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "full_name",
      key: "employee",
      fixed: "left" as const,
      searchable: true,
      width: 300,
      render: (_: any, record: Employee) => (
        <Tooltip title="Click để xem chi tiết" placement="topLeft">
          <div
            className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
            onClick={() => router.push(`/employees/${record.id}`)}
          >
            <Avatar src={record.photo_url} size={45} className="bg-blue-500">
              {record.first_name?.[0]}
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">
                {record.full_name || `${record.first_name} ${record.last_name}`}
              </p>
              <p className="text-sm text-gray-500">{record.employee_code}</p>
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{email}</span>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (phone: string) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {phone ? formatPhoneNumber(phone) : "-"}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      filters: [
        { text: "Đang làm việc", value: "active" },
        { text: "Nghỉ phép", value: "on_leave" },
        { text: "Đã nghỉ việc", value: "terminated" },
      ],
      render: (status: string) => {
        const statusConfig = {
          active: { color: "success", text: "Đang làm việc" },
          on_leave: { color: "warning", text: "Nghỉ phép" },
          terminated: { color: "default", text: "Đã nghỉ việc" },
        };
        const config =
          statusConfig[status as keyof typeof statusConfig] ||
          statusConfig.terminated;

        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày vào làm",
      dataIndex: "hire_date",
      key: "hire_date",
      width: 130,
      sorter: true,
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{formatDate(date || "")}</span>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 150,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/employees/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => router.push(`/employees/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Danh sách nhân viên
          </h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin nhân viên</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/employees/create")}
          size="large"
        >
          Thêm nhân viên
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
        />
      </div>
    </div>
  );
};
