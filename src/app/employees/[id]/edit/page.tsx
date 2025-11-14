"use client";

import { useOne } from "@refinedev/core";
import { Employee } from "@/types/employee";
import { EmployeeForm } from "@/features/employees/components";
import { Card } from "antd";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { query } = useOne<Employee>({
    resource: "employees",
    id,
  });

  const { data, isLoading } = query;
  const employee = data?.data;

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <p className="text-gray-500">Không tìm thấy nhân viên</p>
            <Button onClick={() => router.back()} className="mt-4">
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Chỉnh sửa nhân viên
          </h1>
          <p className="text-gray-500 mt-1">
            Cập nhật thông tin nhân viên {employee.first_name}{" "}
            {employee.last_name}
          </p>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 shadow-sm">
          <EmployeeForm
            employee={employee}
            mode="edit"
            onSuccess={() => {
              router.push(`/employees/${id}`);
            }}
            onCancel={() => {
              router.back();
            }}
          />
        </Card>
      </div>
    </div>
  );
}
