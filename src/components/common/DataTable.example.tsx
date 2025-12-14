/**
 * DataTable Component - Usage Examples
 * 
 * This file demonstrates various ways to use the reusable DataTable component
 */

import { DataTable, columnRenderers } from "./DataTable";
import { EMPLOYEE_STATUS } from "@/types/common";
import type { DataTableColumn } from "@/types/common";
import type { Employee } from "@/types/employee";
import { Button, Space, Tag } from "antd";
import { Edit, Trash2, Eye } from "lucide-react";

// Example 1: Basic Employee Table
export function BasicEmployeeTable() {
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "full_name",
      title: "Họ và tên",
      dataIndex: "full_name",
      render: (text, record) => columnRenderers.avatar(text, record, "avatar", "full_name"),
      sorter: true,
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      sorter: true,
    },
    {
      key: "phone",
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (phone) => columnRenderers.phone(phone),
    },
    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => columnRenderers.status(status, EMPLOYEE_STATUS),
      sorter: true,
    },
  ];

  return (
    <DataTable
      dataSource={[]} // Your employee data here
      columns={columns}
      title="Danh sách nhân viên"
      searchPlaceholder="Tìm kiếm theo tên, email..."
      showRefresh
      onRefresh={() => console.log("Refresh data")}
    />
  );
}

// Example 2: Table with Filters and Export
export function AdvancedEmployeeTable({ employees, loading, onRefresh, onExport }: any) {
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "employee_id",
      title: "Mã NV",
      dataIndex: "employee_id",
      width: 120,
      sorter: true,
    },
    {
      key: "full_name",
      title: "Nhân viên",
      dataIndex: "full_name",
      width: 250,
      render: (text, record) => columnRenderers.avatar(text, record),
    },
    {
      key: "position",
      title: "Vị trí",
      dataIndex: ["position", "name"],
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      render: (status) => columnRenderers.status(status, EMPLOYEE_STATUS),
    },
    {
      key: "hire_date",
      title: "Ngày vào làm",
      dataIndex: "hire_date",
      render: (date) => columnRenderers.date(date),
      sorter: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => console.log("View", record.id)}
          />
          <Button
            type="text"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => console.log("Edit", record.id)}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => console.log("Delete", record.id)}
          />
        </Space>
      ),
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { label: "Đang làm việc", value: "active" },
        { label: "Nghỉ việc", value: "inactive" },
        { label: "Thử việc", value: "probation" },
      ],
    },
    {
      key: "position_id",
      label: "Vị trí",
      options: [
        { label: "Quản lý", value: 1 },
        { label: "Nhân viên", value: 2 },
        { label: "Thực tập sinh", value: 3 },
      ],
    },
  ];

  return (
    <DataTable
      dataSource={employees}
      columns={columns}
      loading={loading}
      title="Quản lý nhân viên"
      searchPlaceholder="Tìm kiếm theo tên, mã NV, email..."
      filters={filters}
      showRefresh
      showExport
      onRefresh={onRefresh}
      onExport={onExport}
      className="employee-table-wrapper"
      tableClassName="custom-employee-table"
      bordered
    />
  );
}

// Example 3: Table with Row Selection
export function SelectableEmployeeTable({ employees, onSelectionChange }: any) {
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "full_name",
      title: "Nhân viên",
      dataIndex: "full_name",
      render: (text, record) => columnRenderers.avatar(text, record),
    },
    {
      key: "employee_id",
      title: "Mã NV",
      dataIndex: "employee_id",
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
    },
  ];

  return (
    <DataTable
      dataSource={employees}
      columns={columns}
      rowSelection={{
        onChange: (selectedKeys, selectedRows) => {
          onSelectionChange?.(selectedRows);
        },
      }}
      title="Chọn nhân viên"
    />
  );
}

// Example 4: Compact Table
export function CompactEmployeeTable({ employees }: any) {
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "full_name",
      title: "Tên",
      dataIndex: "full_name",
    },
    {
      key: "position",
      title: "Vị trí",
      dataIndex: ["position", "name"],
    },
    {
      key: "phone",
      title: "SĐT",
      dataIndex: "phone",
      render: (phone) => columnRenderers.phone(phone),
    },
  ];

  return (
    <DataTable
      dataSource={employees}
      columns={columns}
      size="small"
      bordered
      pagination={{ pageSize: 5 }}
      showRefresh={false}
    />
  );
}

// Example 5: Server-side Pagination and Filtering
export function ServerSideTable({
  employees,
  loading,
  pagination,
  onSearch,
  onFilter,
  onSort,
  onRefresh,
}: any) {
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "full_name",
      title: "Nhân viên",
      dataIndex: "full_name",
      render: (text, record) => columnRenderers.avatar(text, record),
      sorter: true,
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      sorter: true,
    },
    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => columnRenderers.status(status, EMPLOYEE_STATUS),
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Trạng thái",
      options: Object.entries(EMPLOYEE_STATUS).map(([value, config]) => ({
        label: config.label,
        value,
      })),
    },
  ];

  return (
    <DataTable
      dataSource={employees}
      columns={columns}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
      }}
      filters={filters}
      onSearch={onSearch} // Server-side search
      onFilter={onFilter} // Server-side filter
      onSort={onSort} // Server-side sort
      onRefresh={onRefresh}
      showRefresh
    />
  );
}

// Example 6: Custom Styling
export function CustomStyledTable({ employees }: any) {
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "full_name",
      title: "Nhân viên",
      dataIndex: "full_name",
      render: (text, record) => columnRenderers.avatar(text, record),
    },
    {
      key: "status",
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => columnRenderers.status(status, EMPLOYEE_STATUS),
    },
  ];

  return (
    <DataTable
      dataSource={employees}
      columns={columns}
      className="shadow-lg rounded-xl overflow-hidden"
      tableClassName="custom-table"
      rowClassName={(record, index) =>
        index % 2 === 0 ? "bg-gray-50" : "bg-white"
      }
      bordered
    />
  );
}

/**
 * CSS Classes for Custom Styling
 * Add these to your global CSS or Tailwind config:
 * 
 * .custom-table .ant-table-thead > tr > th {
 *   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 *   color: white;
 *   font-weight: 600;
 * }
 * 
 * .custom-table .ant-table-tbody > tr:hover > td {
 *   background: #f0f9ff;
 * }
 * 
 * .custom-employee-table {
 *   border-radius: 12px;
 *   overflow: hidden;
 * }
 */
