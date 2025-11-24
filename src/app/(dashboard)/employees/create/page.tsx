"use client";

import React from "react";
import { EmployeeWizard } from "@/features/employees/components/EmployeeWizard";

export default function EmployeeCreatePage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Create New Employee</h1>
                <p className="text-gray-500">Follow the steps to create a new employee account, profile, and access card.</p>
            </div>
            <EmployeeWizard />
        </div>
    );
}
