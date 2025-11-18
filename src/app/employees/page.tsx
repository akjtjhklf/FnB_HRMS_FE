"use client";

import { useList, useDelete, useOne } from "@refinedev/core";
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
import {
  Select,
  Tabs,
  Badge,
  Avatar,
  Space,
  Button as AntButton,
  Drawer,
  Descriptions,
  Divider,
  Tag,
} from "antd";
import CustomDataTable, {
  CustomColumnType,
} from "@/components/common/CustomDataTable";
import "@/components/common/CustomDataTable.css";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

export default function EmployeesListPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [contractViewDrawerOpen, setContractViewDrawerOpen] = useState(false);
  const [contractEditDrawerOpen, setContractEditDrawerOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );

  const { query } = useList<Employee>({
    resource: "employees",
  });

  const { data, isLoading } = query;

  // Fetch selected employee details
  const { result: employeeDetail } = useOne<Employee>({
    resource: "employees",
    id: selectedEmployeeId || "",
    queryOptions: {
      enabled: !!selectedEmployeeId && viewDrawerOpen,
    },
  });

  // Fetch selected contract details
  const { result: contractDetail } = useOne<Contract>({
    resource: "contracts",
    id: selectedContractId || "",
    queryOptions: {
      enabled: !!selectedContractId && contractViewDrawerOpen,
    },
  });

  const { mutate: deleteEmployee } = useDelete();

  // Fetch contracts for contracts tab
  const { query: contractsQuery } = useList<Contract>({
    resource: "contracts",
  });

  const contracts = (contractsQuery.data?.data || []) as unknown as Contract[];

  const handleView = useCallback((id: string) => {
    setSelectedEmployeeId(id);
    setViewDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setSelectedEmployeeId(id);
    setEditDrawerOpen(true);
  }, []);

  const handleViewContract = useCallback((id: string) => {
    setSelectedContractId(id);
    setContractViewDrawerOpen(true);
  }, []);

  const handleEditContract = useCallback((id: string) => {
    setSelectedContractId(id);
    setContractEditDrawerOpen(true);
  }, []);

  const handleDeleteContract = useCallback(
    (id: string) => {
      if (confirm("Bạn có chắc chắn muốn xóa hợp đồng này?")) {
        deleteEmployee({
          resource: "contracts",
          id,
        });
      }
    },
    [deleteEmployee]
  );

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
    active: employees.filter((e) => e?.status === "active").length,
    inactive: employees.filter((e) => e?.status === "terminated").length,
    onLeave: employees.filter((e) => e?.status === "on_leave").length,
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
            <Avatar src={record?.photo_url} size={40} className="bg-blue-500">
              {record?.first_name}
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">
                {record?.first_name} {record?.last_name}
              </p>
              <p className="text-sm text-gray-500">{record?.email}</p>
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
                typeof e?.user?.role === "object" ? e.user?.role?.name : null
              )
              .filter(Boolean)
          )
        ).map((name) => ({ label: name as string, value: name as string })),
        onFilter: (value, record) => {
          const positionName =
            typeof record?.user?.role === "object"
              ? record?.user?.role?.name
              : null;
          return positionName === value;
        },
        render: (_, record) => (
          <span className="text-gray-700">
            {typeof record?.user?.role === "object"
              ? record?.user?.role?.name
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
            <AntButton
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => handleView(record?.id)}
              title="Xem chi tiết"
            />
            <AntButton
              type="text"
              icon={<EditOutlined />}
              className="text-yellow-600 hover:bg-yellow-50"
              onClick={() => handleEdit(record?.id)}
              title="Chỉnh sửa"
            />
            <AntButton
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(record?.id)}
              title="Xóa"
            />
          </Space>
        ),
      },
    ],
    [employees, handleView, handleEdit, handleDelete]
  );

  // Define columns for contracts table
  const contractColumns: CustomColumnType<Contract>[] = useMemo(
    () => [
      {
        title: "Nhân viên",
        dataIndex: ["employee?"],
        key: "employee",
        width: 250,
        fixed: "left",
        filterable: true,
        filterType: "text",
        render: (_, record) => {
          const employee =
            typeof record?.employee_id === "object"
              ? record?.employee_id
              : null;

          return employee ? (
            <div className="flex items-center gap-3">
              <Avatar
                src={employee?.photo_url}
                size={40}
                className="bg-blue-500"
              >
                {employee.full_name || employee.first_name}
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {employee.full_name ||
                    `${employee.first_name || ""} ${employee.last_name || ""}`.trim()}
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
        sorter: (a, b) => {
          const salaryA = parseFloat(a.base_salary as any) || 0;
          const salaryB = parseFloat(b.base_salary as any) || 0;
          return salaryA - salaryB;
        },
        render: (salary) => {
          const amount = parseFloat(salary as any) || 0;
          const formatted = Math.round(amount)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          return <span className="font-medium text-gray-900">{formatted}</span>;
        },
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
              onClick={() => handleViewContract(record?.id)}
              title="Xem chi tiết"
            />
            <AntButton
              type="text"
              icon={<EditOutlined />}
              className="text-yellow-600 hover:bg-yellow-50"
              onClick={() => handleEditContract(record?.id)}
              title="Chỉnh sửa"
            />
            <AntButton
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteContract(record?.id)}
              title="Xóa"
            />
          </Space>
        ),
      },
    ],
    [handleViewContract, handleEditContract, handleDeleteContract]
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

      {/* View Employee Drawer */}
      <Drawer
        title="Thông tin nhân viên"
        placement="right"
        width="66%"
        onClose={() => setViewDrawerOpen(false)}
        open={viewDrawerOpen}
      >
        {employeeDetail && (
          <div className="space-y-6">
            {/* Header với Avatar */}
            <div className="flex items-center gap-4 pb-6 border-b">
              <Avatar
                src={employeeDetail?.photo_url}
                size={80}
                className="bg-blue-500"
              >
                {employeeDetail?.full_name || employeeDetail?.first_name}
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {employeeDetail?.full_name ||
                    `${employeeDetail?.first_name} ${employeeDetail?.last_name}`}
                </h2>
                <p className="text-gray-500">{employeeDetail?.employee_code}</p>
                <Tag
                  color={employeeDetail?.status === "active" ? "green" : "red"}
                  className="mt-2"
                >
                  {employeeDetail?.status === "active"
                    ? "Đang làm việc"
                    : "Nghỉ việc"}
                </Tag>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div>
              <Divider orientation="left">Thông tin cơ bản</Divider>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Mã nhân viên" span={1}>
                  {employeeDetail?.employee_code}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính" span={1}>
                  {employeeDetail?.gender === "male"
                    ? "Nam"
                    : employeeDetail?.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh" span={1}>
                  {employeeDetail?.dob
                    ? formatDate(employeeDetail?.dob)
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="CMND/CCCD" span={1}>
                  {employeeDetail?.personal_id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại" span={1}>
                  {formatPhoneNumber(employeeDetail?.phone || "")}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={1}>
                  {employeeDetail?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {employeeDetail?.address || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Thông tin công việc */}
            <div>
              <Divider orientation="left">Thông tin công việc</Divider>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Ngày vào làm" span={1}>
                  {employeeDetail?.hire_date
                    ? formatDate(employeeDetail?.hire_date)
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày nghỉ việc" span={1}>
                  {employeeDetail?.termination_date
                    ? formatDate(employeeDetail?.termination_date)
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Tag
                    color={
                      employeeDetail?.status === "active" ? "green" : "red"
                    }
                  >
                    {employeeDetail?.status === "active"
                      ? "Đang làm việc"
                      : "Nghỉ việc"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giờ làm mặc định/tuần" span={1}>
                  {employeeDetail?.default_work_hours_per_week || "N/A"} giờ
                </Descriptions.Item>
                <Descriptions.Item label="Giờ làm tối đa/tuần" span={1}>
                  {employeeDetail?.max_hours_per_week || "N/A"} giờ
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Liên hệ khẩn cấp */}
            {(employeeDetail?.emergency_contact_name ||
              employeeDetail?.emergency_contact_phone) && (
              <div>
                <Divider orientation="left">Liên hệ khẩn cấp</Divider>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Tên người liên hệ" span={1}>
                    {employeeDetail?.emergency_contact_name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại" span={1}>
                    {formatPhoneNumber(
                      employeeDetail?.emergency_contact_phone || ""
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* Ghi chú */}
            {employeeDetail?.notes && (
              <div>
                <Divider orientation="left">Ghi chú</Divider>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {employeeDetail?.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Edit Employee Drawer */}
      <Drawer
        title="Chỉnh sửa nhân viên"
        placement="right"
        width="66%"
        onClose={() => setEditDrawerOpen(false)}
        open={editDrawerOpen}
      >
        <div className="text-center py-12">
          <p className="text-gray-500">
            Form chỉnh sửa nhân viên đang được phát triển
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Tính năng sẽ được bổ sung trong phiên bản tiếp theo
          </p>
        </div>
      </Drawer>

      {/* View Contract Drawer */}
      <Drawer
        title="Chi tiết hợp đồng"
        placement="right"
        width="66%"
        onClose={() => setContractViewDrawerOpen(false)}
        open={contractViewDrawerOpen}
      >
        {contractDetail && (
          <div className="space-y-6">
            {/* Thông tin nhân viên */}
            {contractDetail?.employee_id &&
              typeof contractDetail?.employee_id === "object" && (
                <div>
                  <Divider orientation="left">Thông tin nhân viên</Divider>
                  <div className="flex items-center gap-4 pb-4">
                    <Avatar
                      src={contractDetail?.employee_id?.photo_url}
                      size={64}
                      className="bg-blue-500"
                    >
                      {contractDetail?.employee_id?.full_name ||
                        contractDetail?.employee_id?.first_name}
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contractDetail?.employee_id?.full_name ||
                          `${contractDetail?.employee_id?.first_name} ${contractDetail?.employee_id?.last_name}`}
                      </h3>
                      <p className="text-gray-500">
                        {contractDetail?.employee_id?.employee_code}
                      </p>
                      <p className="text-sm text-gray-400">
                        {contractDetail?.employee_id?.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Thông tin hợp đồng */}
            <div>
              <Divider orientation="left">Thông tin hợp đồng</Divider>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Loại hợp đồng" span={2}>
                  <Tag color="blue">
                    {contractDetail?.contract_type === "full_time"
                      ? "Toàn thời gian"
                      : contractDetail?.contract_type === "part_time"
                        ? "Bán thời gian"
                        : contractDetail?.contract_type === "casual"
                          ? "Hợp đồng"
                          : "Thực tập"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu" span={1}>
                  {contractDetail?.start_date
                    ? formatDate(contractDetail?.start_date)
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc" span={1}>
                  {contractDetail?.end_date
                    ? formatDate(contractDetail?.end_date)
                    : "Không xác định"}
                </Descriptions.Item>
                <Descriptions.Item label="Lương cơ bản" span={2}>
                  <span className="font-semibold text-lg text-green-600">
                    {(() => {
                      const salary =
                        parseFloat(contractDetail?.base_salary as any) || 0;
                      return Math.round(salary)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    })()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc thử việc" span={2}>
                  {contractDetail?.probation_end_date
                    ? formatDate(contractDetail?.probation_end_date)
                    : "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Badge
                    status={contractDetail?.is_active ? "success" : "default"}
                    text={
                      contractDetail?.is_active
                        ? "Đang hiệu lực"
                        : "Đã chấm dứt"
                    }
                  />
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Ghi chú */}
            {contractDetail?.notes && (
              <div>
                <Divider orientation="left">Ghi chú</Divider>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {contractDetail?.notes}
                </p>
              </div>
            )}

            {/* Thông tin tạo/cập nhật */}
            <div>
              <Divider orientation="left">Thông tin hệ thống</Divider>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Ngày tạo" span={1}>
                  {contractDetail?.created_at
                    ? formatDate(contractDetail?.created_at)
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối" span={1}>
                  {contractDetail?.updated_at
                    ? formatDate(contractDetail?.updated_at)
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Contract Drawer */}
      <Drawer
        title="Chỉnh sửa hợp đồng"
        placement="right"
        width="66%"
        onClose={() => setContractEditDrawerOpen(false)}
        open={contractEditDrawerOpen}
      >
        <div className="text-center py-12">
          <p className="text-gray-500">
            Form chỉnh sửa hợp đồng đang được phát triển
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Tính năng sẽ được bổ sung trong phiên bản tiếp theo
          </p>
        </div>
      </Drawer>
    </div>
  );
}
