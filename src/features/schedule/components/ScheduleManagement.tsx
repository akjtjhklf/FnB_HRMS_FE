"use client";

import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { CalendarOutlined, SwapOutlined, ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { ScheduleList } from "./ScheduleList";
import { AvailabilityRegistry } from "./AvailabilityRegistry";
import { ChangeRequests } from "./ChangeRequests";
import { ShiftManagement } from "./ShiftManagement";


/**
 * ScheduleManagement - Main component for comprehensive schedule management
 * 
 * Features:
 * - Schedule List: View and manage weekly schedules with auto-schedule
 * - Availability Registry: Employees register shift preferences
 * - Change Requests: Handle shift swap/pass/day-off requests
 * - Shift Management: Manage shifts and position requirements
 */
export function ScheduleManagement() {
  const items: TabsProps["items"] = [
    {
      key: "schedules",
      label: (
        <span>
          <CalendarOutlined />
          Lịch làm việc
        </span>
      ),
      children: <ScheduleList />,
    },
    {
      key: "availability",
      label: (
        <span>
          <TeamOutlined />
          Đăng ký ca
        </span>
      ),
      children: <AvailabilityRegistry />,
    },
    {
      key: "change-requests",
      label: (
        <span>
          <SwapOutlined />
          Yêu cầu đổi ca
        </span>
      ),
      children: <ChangeRequests />,
    },
    {
      key: "shifts",
      label: (
        <span>
          <ClockCircleOutlined />
          Quản lý ca
        </span>
      ),
      children: <ShiftManagement />,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Quản lý lịch làm việc</h1>
      <Tabs defaultActiveKey="schedules" items={items} size="large" />
    </div>
  );
}
