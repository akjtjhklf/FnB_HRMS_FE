"use client";

import { useTable } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import {
  Table,
  Button,
  Tag,
  Tooltip,
  App,
  Input,
  Row,
  Col,
  Card,
  Statistic,
} from "antd";
import { EmployeeAvatar } from "@/components/EmployeeAvatar";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Employee } from "@/types/employee";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { Mail, Phone, Calendar } from "lucide-react";
import { useConfirmModalStore } from "@/store/confirmModalStore";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";
import { useState, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash";

export const EmployeeList = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const { mutate: deleteEmployee } = useDelete();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { tableProps, sorters, filters, tableQuery, setFilters } = useTable<Employee>({
    resource: "employees",
    syncWithLocation: true,
    pagination: {
      pageSize: 15,
      mode: "server", // Ensure server-side pagination
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

  // Debounce search text and apply server-side filter
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500),
    []
  );

  // Update search filter when debounced value changes
  useEffect(() => {
    if (debouncedSearch) {
      setFilters([
        {
          field: "search",
          operator: "contains",
          value: debouncedSearch,
        }
      ], "replace");
    } else {
      setFilters([], "replace");
    }
  }, [debouncedSearch, setFilters]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchText(value);
    debouncedSetSearch(value);
  };

  const employees = useMemo(
    () => tableProps.dataSource || [],
    [tableProps.dataSource]
  );

  // Calculate statistics from loaded employees (this is just current page stats)
  // For accurate stats across all data, consider a separate API call
  const stats = useMemo(() => {
    const pagination = tableProps.pagination;
    const total = (pagination && typeof pagination === 'object' && 'total' in pagination) 
      ? pagination.total 
      : employees.length;
    const active = employees.filter((e) => e.status === "active").length;
    const onLeave = employees.filter((e) => e.status === "on_leave").length;
    const terminated = employees.filter(
      (e) => e.status === "terminated"
    ).length;
    const suspended = employees.filter((e) => e.status === "suspended").length;

    return { total, active, onLeave, terminated, suspended };
  }, [employees, tableProps.pagination]);

  const handleView = (record: Employee) => {
    router.push(`/employees/${record.id}`);
  };

  const handleEdit = (record: Employee) => {
    router.push(`/employees/${record.id}/edit`);
  };

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

  const getActionItems = (record: Employee): ActionItem[] => [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: () => handleView(record),
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      onClick: () => handleDelete(record),
      danger: true,
    },
  ];

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
            <EmployeeAvatar
              photoUrl={record.photo_url}
              firstName={record.first_name}
              lastName={record.last_name}
              name={record.full_name}
              size={45}
            />
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
          <Mail className="w-4 h-4 text-gray-700" />
          <span className="text-gray-700">{email}</span>
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
          <Phone className="w-4 h-4 text-gray-700" />
          <span className="text-gray-700">
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
          <Calendar className="w-4 h-4 text-gray-700" />
          <span className="text-gray-700">{formatDate(date || "")}</span>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 100,
      render: (_: any, record: Employee) => (
        <ActionPopover actions={getActionItems(record)} />
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
        <div className="flex gap-3">
          <Input
            placeholder="Tìm theo tên, email, SĐT..."
            allowClear
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            size="large"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => tableQuery.refetch()}
            loading={tableQuery.isFetching}
            size="large"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/employees/create")}
            size="large"
          >
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-700 font-medium">
                  Tổng nhân viên
                </span>
              }
              value={stats.total}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-700 font-medium">
                  Đang làm việc
                </span>
              }
              value={stats.active}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-700 font-medium">Nghỉ phép</span>
              }
              value={stats.onLeave}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#fa8c16", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={
                <span className="text-gray-700 font-medium">
                  Đã nghỉ việc
                </span>
              }
              value={stats.terminated}
              prefix={<StopOutlined className="text-gray-500" />}
              valueStyle={{ color: "#8c8c8c", fontSize: "24px", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

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
