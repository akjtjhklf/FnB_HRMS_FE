"use client";

import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmployeeForm } from "@features/employees/components/EmployeeForm";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/employees/${id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftOutlined className="mr-2" />
            Quay lại thông tin nhân viên
          </Link>
        </div>

        <EmployeeForm 
          action="edit"
          id={id}
          onSuccess={() => router.push(`/employees/${id}`)}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
