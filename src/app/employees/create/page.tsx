"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { EmployeeWizard } from "@/features/employees/components/EmployeeWizard";

export default function CreateEmployeePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/employees"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftOutlined className="mr-2" />
            Quay lại danh sách nhân viên
          </Link>
        </div>

        <EmployeeWizard />
      </div>
    </div>
  );
}
