"use client";

import React from "react";
import { EmployeeShow } from "@/features/employees";

export default function EmployeeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <EmployeeShow id={id} />;
}
