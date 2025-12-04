"use client";

import { EmployeeEditWizard } from "@/features/employees/components/EmployeeEditWizard";
import { useParams } from "next/navigation";

export default function EmployeeEditPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa nhân viên</h1>
      <EmployeeEditWizard id={id} />
    </div>
  );
}
