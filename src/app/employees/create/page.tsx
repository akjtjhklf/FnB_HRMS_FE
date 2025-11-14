"use client";

import { EmployeeForm } from "@/features/employees/components";
import { Card } from "antd";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CreateEmployeePage() {
  const router = useRouter();

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
          <h1 className="text-3xl font-bold text-gray-900">Thêm nhân viên mới</h1>
          <p className="text-gray-500 mt-1">
            Điền thông tin để thêm nhân viên vào hệ thống
          </p>
        </div>

        {/* Form */}
        <Card className="border border-gray-200 shadow-sm">
          <EmployeeForm
            mode="create"
            onSuccess={() => {
              router.push("/employees");
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
