"use client";

import { AttendanceCheckInOut } from "../components/AttendanceCheckInOut";
import { AttendanceHistory } from "../components/AttendanceHistory";
import { Tabs } from "antd";
import { Card } from "@/components/ui/Card";
import { Clock, History } from "lucide-react";

export function AttendanceDashboard() {
    const tabItems = [
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
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Chấm Công</h1>
                <p className="text-gray-600 mt-1">Quản lý giờ làm việc và chấm công</p>
            </div>

            {/* Tabs */}
            <Tabs defaultActiveKey="checkin" items={tabItems} />
        </div>
    );
}
