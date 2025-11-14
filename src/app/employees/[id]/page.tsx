"use client";

import { useOne } from "@refinedev/core";
import { Employee } from "@/types/employee";
import { EmployeeDetail, ContractList } from "@/features/employees/components";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Tabs } from "antd";
import { useDelete } from "@refinedev/core";
import { message } from "antd";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { query } = useOne<Employee>({
    resource: "employees",
    id,
  });

  const { data, isLoading } = query;
  const { mutate: deleteEmployee } = useDelete();

  const employee = data?.data;

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      deleteEmployee(
        {
          resource: "employees",
          id,
        },
        {
          onSuccess: () => {
            message.success("Xóa nhân viên thành công!");
            router.push("/employees");
          },
          onError: (error: any) => {
            message.error(error?.message || "Có lỗi xảy ra khi xóa nhân viên!");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chi tiết nhân viên
              </h1>
              <p className="text-gray-500 mt-1">
                Thông tin chi tiết và hợp đồng của nhân viên
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/employees/${id}/edit`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </Button>
              <Button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: "info",
              label: "Thông tin cá nhân",
              children: <EmployeeDetail employee={employee} />,
            },
            {
              key: "contracts",
              label: "Hợp đồng",
              children: <ContractList employeeId={id} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
