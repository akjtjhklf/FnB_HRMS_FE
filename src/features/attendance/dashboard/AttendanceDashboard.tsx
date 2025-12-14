"use client";


import { AttendanceCheckInOut } from "../components/AttendanceCheckInOut";
import { AttendanceHistory } from "../components/AttendanceHistory";
import { AttendanceManagement } from "../components/AttendanceManagement";
import { AttendanceAdjustmentRequests } from "../components/AttendanceAdjustmentRequests";
import { Tabs } from "antd";
import { Card } from "@/components/ui/Card";
import { Clock, History, Users, FileEdit } from "lucide-react";
import { useGetIdentity } from "@refinedev/core";
import { UserIdentity } from "@/types/auth";

export function AttendanceDashboard() {
    const { data: user, isLoading } = useGetIdentity<UserIdentity>();
    const role = user?.role?.name || "";
    // Check if user is manager or admin
    const isManager = ["Manager", "Administrator", "Admin"].includes(role);

    if (isLoading) {
        return <div>Đang tải...</div>;
    }

    const tabItems = [];

    // Employees see Check In/Out and History
    if (!isManager) {
        tabItems.push(
            {
                key: "checkin",
                label: (
                    <span className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Check In/Out</span>
                    </span>
                ),
                children: <AttendanceCheckInOut />,
            },
            {
                key: "history",
                label: (
                    <span className="flex items-center gap-2">
                        <History size={16} />
                        <span>Lịch Sử</span>
                    </span>
                ),
                children: (
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Lịch Sử Chấm Công</h2>
                        <AttendanceHistory />
                    </Card>
                ),
            }
        );
    }

    // Managers see Management tab and Adjustment Requests tab
    if (isManager) {
        tabItems.push(
            {
                key: "management",
                label: (
                    <span className="flex items-center gap-2">
                        <Users size={16} />
                        <span>Quản lý chấm công</span>
                    </span>
                ),
                children: (
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Quản lý chấm công nhân viên</h2>
                        <AttendanceManagement />
                    </Card>
                ),
            },
            {
                key: "adjustment-requests",
                label: (
                    <span className="flex items-center gap-2">
                        <FileEdit size={16} />
                        <span>Yêu cầu chỉnh sửa</span>
                    </span>
                ),
                children: (
                    <Card className="p-6">
                        <AttendanceAdjustmentRequests />
                    </Card>
                ),
            }
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Chấm Công</h1>
                <p className="text-gray-700 mt-1">Quản lý giờ làm việc và chấm công</p>
            </div>

            {/* Tabs */}
            <Tabs defaultActiveKey={isManager ? "management" : "checkin"} items={tabItems} />
        </div>
    );
}

