"use client";

import React from "react";
import { EmployeeAttendanceDetail } from "@/features/attendance";

export default function EmployeeAttendancePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = React.use(params);
  return <EmployeeAttendanceDetail employeeId={employeeId} />;
}
