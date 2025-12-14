"use client";

import { useState } from "react";
import { Card, Tabs } from "antd";
import { SafetyCertificateOutlined, TeamOutlined, SolutionOutlined } from "@ant-design/icons";
import { RoleList } from "./components/RoleList";
import { PolicyList } from "./components/PolicyList";

export const PermissionsManagement = () => {
    const [activeTab, setActiveTab] = useState("roles");

    const items = [
        {
            key: "roles",
            label: (
                <span>
                    <TeamOutlined />
                     Quản lý Vai trò
                </span>
            ),
            children: <RoleList />,
        },
        {
            key: "policies",
            label: (
                <span>
                    <SafetyCertificateOutlined />
                     Quản lý Chính sách
                </span>
            ),
            children: <PolicyList />,
        },
    ];

    return (
        <div className="p-6">
            <Card>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <SolutionOutlined />
                        Phân Quyền & Bảo Mật (RBAC)
                    </h1>
                    <p className="text-gray-500">
                        Quản lý vai trò, chính sách và quyền hạn truy cập hệ thống
                    </p>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    type="card"
                    size="large"
                />
            </Card>
        </div>
    );
};
