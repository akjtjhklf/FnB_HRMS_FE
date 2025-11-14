"use client";

import { useList, useDelete } from "@refinedev/core";
import { Employee, Contract } from "@/types/employee";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  Search,
  Filter,
  Download,
  Users,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Select, Tabs, Badge, Avatar, Space, Button as AntButton } from "antd";
import CustomDataTable, {
  CustomColumnType,
} from "@/components/common/CustomDataTable";
import "@/components/common/CustomDataTable.css";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

export default function EmployeesListPage() {
  const [activeTab, setActiveTab] = useState("list");

  const { query } = useList<Employee>({
    resource: "employees",
  });

  const { data, isLoading } = query;

  const { mutate: deleteEmployee } = useDelete();

  // Fetch contracts for contracts tab
  const { query: contractsQuery } = useList<Contract>({
    resource: "contracts",
  });

  const contracts = (contractsQuery.data?.data || []) as unknown as Contract[];

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
        deleteEmployee({
          resource: "employees",
          id,
        });
      }
    },
    [deleteEmployee]
  );

  const employees = (data?.data || []) as unknown as Employee[];
  const total = data?.total || 0;
  const contractsLoading = contractsQuery.isLoading;

  // Statistics
  const stats = {
    total: total,
    active: employees.filter((e) => e.employment_status === "active").length,
    inactive: employees.filter((e) => e.employment_status === "inactive")
      .length,
    onLeave: employees.filter((e) => e.employment_status === "on_leave").length,
  };

  // Define columns for employees table
  const employeeColumns: CustomColumnType<Employee>[] = useMemo(
    () => [
      {
        title: "Nhân viên",
        dataIndex: ["first_name"],
        key: "employee",
        width: 250,
        fixed: "left",
        filterable: true,
        filterType: "text",
        sortable: true,
        sorter: (a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          ),
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar src={record.avatar} size={40} className="bg-blue-500">
              {record.first_name?.[0]}
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">
                {record.first_name} {record.last_name}
              </p>
              <p className="text-sm text-gray-500">{record.email}</p>
            </div>
          </div>
        ),
      },
      {
        title: "Mã NV",
        dataIndex: "employee_code",
        key: "employee_code",
        width: 120,
        filterable: true,
        filterType: "text",
        sortable: true,
        render: (code) => (
          <span className="font-medium text-gray-700">{code}</span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 220,
        ellipsis: true,
        filterable: true,
        filterType: "text",
        render: (email) => <span className="text-gray-600">{email}</span>,
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        width: 140,
        render: (phone) => (
          <span className="text-gray-600">
            {phone ? formatPhoneNumber(phone) : "-"}
          </span>
        ),
      },
      {
        title: "Chức vụ",
        dataIndex: ["position_id", "name"],
        key: "position",
        width: 160,
        filterable: true,
        filterType: "select",
        filterOptions: Array.from(
          new Set(
            employees
              .map((e) =>
                typeof e.position_id === "object" ? e.position_id?.name : null
              )
              .filter(Boolean)
          )
        ).map((name) => ({ label: name as string, value: name as string })),
        onFilter: (value, record) => {
          const positionName =
            typeof record.position_id === "object"
              ? record.position_id?.name
              : null;
          return positionName === value;
        },
        render: (_, record) => (
          <span className="text-gray-700">
            {typeof record.position_id === "object"
              ? record.position_id.name
              : "-"}
          </span>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "employment_status",
        key: "employment_status",
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
        dataIndex: "hire_date",
        key: "hire_date",
        width: 130,
        sortable: true,
        sorter: (a, b) =>
          new Date(a.hire_date || "").getTime() -
          new Date(b.hire_date || "").getTime(),
        render: (date) => (
          <span className="text-gray-600">{formatDate(date || "")}</span>
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
            <Link href={`/employees/${record.id}`}>
              <AntButton
                type="text"
                icon={<EyeOutlined />}
                className="text-blue-600 hover:bg-blue-50"
                title="Xem chi tiết"
              />
            </Link>
            <Link href={`/employees/${record.id}/edit`}>
              <AntButton
                type="text"
                icon={<EditOutlined />}
                className="text-yellow-600 hover:bg-yellow-50"
                title="Chỉnh sửa"
              />
            </Link>
            <AntButton
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(record.id)}
              title="Xóa"
            />
          </Space>
        ),
      },
    ],
    [employees]
  );

  // Define columns for contracts table
  const contractColumns: CustomColumnType<Contract>[] = useMemo(
    () => [
      {
        title: "Nhân viên",
        dataIndex: ["employee_id"],
        key: "employee",
        width: 250,
        fixed: "left",
        filterable: true,
        filterType: "text",
        render: (_, record) => {
          const employee =
            typeof record.employee_id === "object" ? record.employee_id : null;

          return employee ? (
            <div className="flex items-center gap-3">
              <Avatar src={employee.avatar} size={40} className="bg-blue-500">
                {employee.first_name?.[0]}
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {employee.employee_code}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-gray-400">N/A</span>
          );
        },
      },
      {
        title: "Loại hợp đồng",
        dataIndex: "contract_type",
        key: "contract_type",
        width: 150,
        filterable: true,
        filterType: "select",
        filterOptions: [
          { label: "Toàn thời gian", value: "full_time" },
          { label: "Bán thời gian", value: "part_time" },
          { label: "Hợp đồng", value: "contract" },
          { label: "Thực tập", value: "internship" },
        ],
        render: (type) => (
          <span className="text-gray-700">
            {type === "full_time"
              ? "Toàn thời gian"
              : type === "part_time"
                ? "Bán thời gian"
                : type === "contract"
                  ? "Hợp đồng"
                  : "Thực tập"}
          </span>
        ),
      },
      {
        title: "Ngày bắt đầu",
        dataIndex: "start_date",
        key: "start_date",
        width: 130,
        sortable: true,
        sorter: (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
        render: (date) => (
          <span className="text-gray-600">{formatDate(date)}</span>
        ),
      },
      {
        title: "Ngày kết thúc",
        dataIndex: "end_date",
        key: "end_date",
        width: 130,
        sortable: true,
        sorter: (a, b) => {
          const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
          const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
          return dateA - dateB;
        },
        render: (date) => (
          <span className="text-gray-600">
            {date ? formatDate(date) : "Không xác định"}
          </span>
        ),
      },
      {
        title: "Lương",
        dataIndex: "salary",
        key: "salary",
        width: 150,
        sortable: true,
        sorter: (a, b) => a.salary - b.salary,
        render: (salary) => (
          <span className="font-medium text-gray-900">
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
        width: 140,
        align: "center",
        filterable: true,
        filterType: "select",
        filterOptions: [
          { label: "Đang hiệu lực", value: "active" },
          { label: "Hết hạn", value: "expired" },
          { label: "Đã chấm dứt", value: "terminated" },
        ],
        render: (status) => (
          <Badge
            status={
              status === "active"
                ? "success"
                : status === "expired"
                  ? "warning"
                  : "default"
            }
            text={
              status === "active"
                ? "Đang hiệu lực"
                : status === "expired"
                  ? "Hết hạn"
                  : "Đã chấm dứt"
            }
          />
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
            <AntButton
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:bg-blue-50"
              title="Xem chi tiết"
            />
            <AntButton
              type="text"
              icon={<EditOutlined />}
              className="text-yellow-600 hover:bg-yellow-50"
              title="Chỉnh sửa"
            />
            <AntButton
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              title="Xóa"
            />
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 px-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              Quản lý nhân viên
            </h1>
            <p className="text-gray-500 mt-2 ml-[52px]">
              Quản lý thông tin và hợp đồng nhân viên
            </p>
          </div>
          <Link href="/employees/create">
            <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Thêm nhân viên
            </button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Tổng nhân viên
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Đang làm việc
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Nghỉ phép
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.onLeave}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Không hoạt động
                </p>
                <p className="text-3xl font-bold text-gray-600">
                  {stats.inactive}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mx-2">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-6 pt-4"
          items={[
            {
              key: "list",
              label: (
                <span className="flex items-center gap-2 px-2">
                  <Users className="w-4 h-4" />
                  Danh sách nhân viên
                </span>
              ),
            },
            {
              key: "contracts",
              label: (
                <span className="flex items-center gap-2 px-2">
                  <Eye className="w-4 h-4" />
                  Hợp đồng nhân viên
                </span>
              ),
            },
          ]}
        />

        {/* Tab Content */}
        <div className="px-6 pb-6">
          {activeTab === "list" && (
            <CustomDataTable<Employee>
              data={employees}
              columns={employeeColumns}
              loading={isLoading}
              rowKey="id"
              searchable
              searchPlaceholder="Tìm kiếm theo tên, mã NV, email..."
              showFilters
              showRefresh
              showExport
              onRefresh={() => query.refetch()}
              onExport={() => {
                // Implement export functionality
                console.log("Export employees to Excel");
              }}
              pagination={{
                current: 1,
                pageSize: 10,
                total: total,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} nhân viên`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              bordered={false}
              size="middle"
              scroll={{ x: 1200 }}
              className="mt-4"
            />
          )}

          {activeTab === "contracts" && (
            <CustomDataTable<Contract>
              data={contracts}
              columns={contractColumns}
              loading={contractsLoading}
              rowKey="id"
              searchable
              searchPlaceholder="Tìm kiếm hợp đồng..."
              showFilters
              showRefresh
              onRefresh={() => contractsQuery.refetch()}
              pagination={{
                current: 1,
                pageSize: 10,
                total: contracts.length,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} hợp đồng`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              bordered={false}
              size="middle"
              scroll={{ x: 1200 }}
              className="mt-4"
            />
          )}
        </div>
      </div>
    </div>
  );
}
