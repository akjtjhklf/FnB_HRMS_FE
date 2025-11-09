"use client";

import { useList, useDelete } from "@refinedev/core";
import { Employee } from "@/types/employee";
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
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { useState } from "react";

export default function EmployeesListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { query } = useList<Employee>({
    resource: "employees",
    pagination: {
      current: page,
      pageSize,
    },
  });

  const { data, isLoading } = query;

  const { mutate: deleteEmployee } = useDelete();

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      deleteEmployee({
        resource: "employees",
        id,
      });
    }
  };

  const employees = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý nhân viên</h1>
          <p className="text-gray-500 mt-1">
            Danh sách tất cả nhân viên trong hệ thống
          </p>
        </div>
        <Link href="/employees/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhân viên
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày vào làm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee: Employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.employee_code}
                    </TableCell>
                    <TableCell>
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      {formatPhoneNumber(employee.phone || "")}
                    </TableCell>
                    <TableCell>
                      {typeof employee.position_id === "object"
                        ? employee.position_id.name
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          employee.employment_status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {employee.employment_status === "active"
                          ? "Đang làm việc"
                          : "Không hoạt động"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(employee.hire_date || "")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/employees/${employee.id}`}>
                          <Button size="small">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/employees/${employee.id}/edit`}>
                          <Button size="small">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="small"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Hiển thị {employees.length} / {total} nhân viên
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </Button>
              <span className="px-4 py-2">
                Trang {page} / {totalPages}
              </span>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
