"use client";

import { useList, useDelete } from "@refinedev/core";
import { Employee, Contract } from "@/types/employee";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { Pencil, Trash2, Plus, Eye, Search, Filter, Download, Users } from "lucide-react";
import { useState } from "react";
import { Input, Select, Tabs, Badge, Avatar, Space } from "antd";

const { TabPane } = Tabs;

export default function EmployeesListPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("list");
  const pageSize = 10;

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

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      deleteEmployee({
        resource: "employees",
        id,
      });
    }
  };

  const employees = (data?.data || []) as unknown as Employee[];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const contractsLoading = contractsQuery.isLoading;

  // Filter employees based on search and status
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      searchText === "" ||
      `${emp.first_name} ${emp.last_name}`
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || emp.employment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: total,
    active: employees.filter((e) => e.employment_status === "active").length,
    inactive: employees.filter((e) => e.employment_status === "inactive").length,
    onLeave: employees.filter((e) => e.employment_status === "on_leave").length,
  };

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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tổng nhân viên</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Đang làm việc</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nghỉ phép</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.onLeave}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Không hoạt động</p>
                <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
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
            <>
              {/* Filters */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm kiếm theo tên, mã NV, email..."
                    prefix={<Search className="w-4 h-4 text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    size="large"
                    className="rounded-lg"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  size="large"
                  className="w-52"
                  options={[
                    { label: "Tất cả trạng thái", value: "all" },
                    { label: "Đang làm việc", value: "active" },
                    { label: "Nghỉ phép", value: "on_leave" },
                    { label: "Không hoạt động", value: "inactive" },
                  ]}
                />
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nhân viên</TableHead>
                          <TableHead>Mã NV</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Số điện thoại</TableHead>
                          <TableHead>Chức vụ</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ngày vào làm</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => (
                          <TableRow key={employee.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={employee.avatar}
                                  size={40}
                                  className="bg-blue-500"
                                >
                                  {employee.first_name?.[0]}
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {employee.first_name} {employee.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {employee.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-gray-700">
                              {employee.employee_code}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {employee.email}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatPhoneNumber(employee.phone || "")}
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-700">
                                {typeof employee.position_id === "object"
                                  ? employee.position_id.name
                                  : "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                status={
                                  employee.employment_status === "active"
                                    ? "success"
                                    : employee.employment_status === "on_leave"
                                    ? "warning"
                                    : "default"
                                }
                                text={
                                  employee.employment_status === "active"
                                    ? "Đang làm việc"
                                    : employee.employment_status === "on_leave"
                                    ? "Nghỉ phép"
                                    : "Không hoạt động"
                                }
                              />
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(employee.hire_date || "")}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Link href={`/employees/${employee.id}`}>
                                  <button
                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                    title="Xem chi tiết"
                                  >
                                    <Eye className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                  </button>
                                </Link>
                                <Link href={`/employees/${employee.id}/edit`}>
                                  <button
                                    className="p-2 hover:bg-yellow-50 rounded-lg transition-colors group"
                                    title="Chỉnh sửa"
                                  >
                                    <Pencil className="w-4 h-4 text-yellow-600 group-hover:scale-110 transition-transform" />
                                  </button>
                                </Link>
                                <button
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                  onClick={() => handleDelete(employee.id)}
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg mb-2">
                        {searchText || statusFilter !== "all"
                          ? "Không tìm thấy nhân viên phù hợp"
                          : "Chưa có nhân viên nào"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {searchText || statusFilter !== "all"
                          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                          : "Hãy thêm nhân viên đầu tiên"}
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {filteredEmployees.length > 0 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="text-blue-600">{filteredEmployees.length}</span> / <span className="text-blue-600">{total}</span> nhân viên
                      </p>
                      <div className="flex gap-2 items-center">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                        >
                          Trước
                        </button>
                        <span className="px-4 py-2 text-gray-700 font-medium">
                          Trang <span className="text-blue-600">{page}</span> / {totalPages}
                        </span>
                        <button
                          disabled={page >= totalPages}
                          onClick={() => setPage(page + 1)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === "contracts" && (
            <>
              {contractsLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : contracts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead>Loại hợp đồng</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead>Lương</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => {
                        const employee = typeof contract.employee_id === 'object' 
                          ? contract.employee_id 
                          : null;
                        
                        return (
                          <TableRow key={contract.id} className="hover:bg-gray-50">
                            <TableCell>
                              {employee ? (
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    src={employee.avatar}
                                    size={40}
                                    className="bg-blue-500"
                                  >
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
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-700">
                                {contract.contract_type === "full_time"
                                  ? "Toàn thời gian"
                                  : contract.contract_type === "part_time"
                                  ? "Bán thời gian"
                                  : contract.contract_type === "contract"
                                  ? "Hợp đồng"
                                  : "Thực tập"}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(contract.start_date)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {contract.end_date
                                ? formatDate(contract.end_date)
                                : "Không xác định"}
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(contract.salary)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                status={
                                  contract.status === "active"
                                    ? "success"
                                    : contract.status === "expired"
                                    ? "warning"
                                    : "default"
                                }
                                text={
                                  contract.status === "active"
                                    ? "Đang hiệu lực"
                                    : contract.status === "expired"
                                    ? "Hết hạn"
                                    : "Đã chấm dứt"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="small"
                                  className="hover:bg-blue-50"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  size="small"
                                  className="hover:bg-yellow-50"
                                  title="Chỉnh sửa"
                                >
                                  <Pencil className="w-4 h-4 text-yellow-600" />
                                </Button>
                                <Button
                                  size="small"
                                  className="hover:bg-red-50"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có hợp đồng nào</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Thêm hợp đồng cho nhân viên từ trang chi tiết nhân viên
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
