"use client";

import { useState, useMemo, useCallback } from "react";
import CustomDataTable, { CustomColumnType } from "./CustomDataTable";
import { Badge, Avatar, Space, Button, Tag } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import "./CustomDataTable.css";

// Example data type
interface ExampleData {
  id: string;
  name: string;
  email: string;
  age: number;
  department: string;
  position: string;
  salary: number;
  status: "active" | "inactive" | "on_leave";
  joinDate: string;
  skills: string[];
}

// Mock data
const mockData: ExampleData[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    age: 28,
    department: "IT",
    position: "Senior Developer",
    salary: 25000000,
    status: "active",
    joinDate: "2020-01-15",
    skills: ["React", "Node.js", "TypeScript"],
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    age: 25,
    department: "HR",
    position: "HR Manager",
    salary: 18000000,
    status: "active",
    joinDate: "2021-03-20",
    skills: ["Communication", "Management"],
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@example.com",
    age: 32,
    department: "IT",
    position: "Tech Lead",
    salary: 35000000,
    status: "on_leave",
    joinDate: "2019-06-10",
    skills: ["Java", "Spring Boot", "Microservices"],
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    age: 30,
    department: "Sales",
    position: "Sales Manager",
    salary: 22000000,
    status: "active",
    joinDate: "2020-09-05",
    skills: ["Sales", "Marketing", "CRM"],
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    age: 26,
    department: "IT",
    position: "Junior Developer",
    salary: 12000000,
    status: "inactive",
    joinDate: "2022-01-10",
    skills: ["JavaScript", "HTML", "CSS"],
  },
];

export default function CustomDataTableExample() {
  const [data, setData] = useState<ExampleData[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // Handlers

  const handleView = useCallback((record: ExampleData) => {
    console.log("View:", record);
  }, []);

  const handleEdit = useCallback((record: ExampleData) => {
    console.log("Edit:", record);
  }, []);

  const handleDelete = useCallback((record: ExampleData) => {
    if (confirm(`Bạn có chắc muốn xóa ${record.name}?`)) {
      setData((prev) => prev.filter((item) => item.id !== record.id));
    }
  }, []);
  // Define columns with full features
  const columns: CustomColumnType<ExampleData>[] = useMemo(
    () => [
      {
        title: "Nhân viên",
        dataIndex: "name",
        key: "employee",
        width: 250,
        fixed: "left",
        sortable: true,
        filterable: true,
        filterType: "text",
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (name, record) => (
          <div className="flex items-center gap-3">
            <Avatar size={40} className="bg-blue-500">
              {name[0]}
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{name}</p>
              <p className="text-sm text-gray-500">{record.email}</p>
            </div>
          </div>
        ),
      },
      {
        title: "Tuổi",
        dataIndex: "age",
        key: "age",
        width: 100,
        align: "center",
        sortable: true,
        sorter: (a, b) => a.age - b.age,
        render: (age) => <span className="font-medium">{age}</span>,
      },
      {
        title: "Phòng ban",
        dataIndex: "department",
        key: "department",
        width: 150,
        filterable: true,
        filterType: "select",
        filterOptions: [
          { label: "IT", value: "IT" },
          { label: "HR", value: "HR" },
          { label: "Sales", value: "Sales" },
        ],
        render: (dept) => <Tag color="blue">{dept}</Tag>,
      },
      {
        title: "Chức vụ",
        dataIndex: "position",
        key: "position",
        width: 180,
        ellipsis: true,
        filterable: true,
        filterType: "text",
        render: (position) => <span className="text-gray-700">{position}</span>,
      },
      {
        title: "Lương",
        dataIndex: "salary",
        key: "salary",
        width: 150,
        align: "right",
        sortable: true,
        sorter: (a, b) => a.salary - b.salary,
        defaultSortOrder: "descend",
        render: (salary) => (
          <span className="font-semibold text-green-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(salary)}
          </span>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 150,
        align: "center",
        filterable: true,
        filterType: "select",
        filterOptions: [
          { label: "Đang làm việc", value: "active" },
          { label: "Nghỉ phép", value: "on_leave" },
          { label: "Không hoạt động", value: "inactive" },
        ],
        render: (status) => (
          <Badge
            status={
              status === "active"
                ? "success"
                : status === "on_leave"
                  ? "warning"
                  : "default"
            }
            text={
              status === "active"
                ? "Đang làm việc"
                : status === "on_leave"
                  ? "Nghỉ phép"
                  : "Không hoạt động"
            }
          />
        ),
      },
      {
        title: "Ngày vào làm",
        dataIndex: "joinDate",
        key: "joinDate",
        width: 130,
        sortable: true,
        sorter: (a, b) =>
          new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
        render: (date) => (
          <span className="text-gray-700">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
      {
        title: "Kỹ năng",
        dataIndex: "skills",
        key: "skills",
        width: 200,
        render: (skills: string[]) => (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 2).map((skill) => (
              <Tag key={skill} color="cyan" className="text-xs">
                {skill}
              </Tag>
            ))}
            {skills.length > 2 && (
              <Tag className="text-xs">+{skills.length - 2}</Tag>
            )}
          </div>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 150,
        align: "center",
        fixed: "right",
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => handleView(record)}
              title="Xem chi tiết"
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-yellow-600 hover:bg-yellow-50"
              onClick={() => handleEdit(record)}
              title="Chỉnh sửa"
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(record)}
              title="Xóa"
            />
          </Space>
        ),
      },
    ],
    [handleView, handleEdit, handleDelete]
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    console.log("Export to Excel");
    alert("Chức năng xuất Excel đang được phát triển");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Custom DataTable Demo
          </h1>
          <p className="text-gray-700">
            Component bảng dữ liệu với đầy đủ tính năng: search, filter, sort,
            pagination
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <CustomDataTable<ExampleData>
            data={data}
            columns={columns}
            loading={loading}
            rowKey="id"
            searchable
            searchPlaceholder="Tìm kiếm theo tên, email, chức vụ..."
            showFilters
            showRefresh
            showExport
            onRefresh={handleRefresh}
            onExport={handleExport}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              current: 1,
              pageSize: 10,
              total: data.length,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} nhân viên`,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            scroll={{ x: 1400 }}
            bordered={false}
            size="middle"
            className="custom-table-demo"
          />
        </div>

        {/* Selected Info */}
        {selectedRowKeys.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">
              Đã chọn {selectedRowKeys.length} nhân viên
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
