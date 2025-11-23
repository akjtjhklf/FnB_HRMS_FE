"use client";

import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import React from "react";
import { App as AntdApp } from "antd";

import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProvider, dataProvider } from "@providers";
import { ConfirmModal } from "@/components/ConfirmModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type RefineContextProps = {
  children: React.ReactNode;
  defaultMode?: "light" | "dark";
};

export const RefineContext: React.FC<RefineContextProps> = ({
  children,
  defaultMode = "light",
}) => {
  return (
    <RefineKbarProvider>
      <AntdApp>
        <ColorModeContextProvider defaultMode={defaultMode}>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider(API_URL)}
            authProvider={authProvider}
            
            resources={[
              // ========== HR CORE ==========
              {
                name: "employees",
                list: "/employees",
                create: "/employees/create",
                edit: "/employees/:id/edit",
                show: "/employees/:id",
                meta: {
                  canDelete: true,
                  label: "Nhân viên",
                  icon: "👥",
                },
              },
              {
                name: "positions",
                list: "/positions",
                create: "/positions/create",
                edit: "/positions/:id/edit",
                meta: {
                  canDelete: true,
                  label: "Vị trí",
                  icon: "💼",
                },
              },
              {
                name: "contracts",
                list: "/contracts",
                create: "/contracts/create",
                edit: "/contracts/:id/edit",
                show: "/contracts/:id",
                meta: {
                  canDelete: true,
                  label: "Hợp đồng",
                  icon: "📄",
                },
              },

              // ========== ATTENDANCE ==========
              {
                name: "attendance-logs",
                list: "/attendance/logs",
                show: "/attendance/logs/:id",
                meta: {
                  label: "Chấm công",
                  icon: "🕒",
                  parent: "attendance",
                },
              },
              {
                name: "attendance-shifts",
                list: "/attendance/shifts",
                meta: {
                  label: "Ca làm việc",
                  icon: "📅",
                  parent: "attendance",
                },
              },
              {
                name: "attendance-adjustments",
                list: "/attendance/adjustments",
                create: "/attendance/adjustments/create",
                meta: {
                  label: "Điều chỉnh",
                  icon: "✏️",
                  parent: "attendance",
                },
              },

              // ========== SHIFT MANAGEMENT ==========
              {
                name: "shifts",
                list: "/shifts",
                create: "/shifts/create",
                edit: "/shifts/:id/edit",
                meta: {
                  canDelete: true,
                  label: "Quản lý ca",
                  icon: "🌙",
                },
              },
              {
                name: "shift-types",
                list: "/shift-types",
                create: "/shift-types/create",
                edit: "/shift-types/:id/edit",
                meta: {
                  canDelete: true,
                  label: "Loại ca",
                  icon: "📋",
                },
              },

              // ========== SCHEDULE ==========
              {
                name: "weekly-schedule",
                list: "/schedule/weekly",
                create: "/schedule/weekly/create",
                edit: "/schedule/weekly/:id/edit",
                meta: {
                  label: "Lịch tuần",
                  icon: "📆",
                },
              },
              {
                name: "schedule-assignments",
                list: "/schedule/assignments",
                meta: {
                  label: "Phân công",
                  icon: "📌",
                },
              },
              {
                name: "schedule-change-requests",
                list: "/schedule/change-requests",
                meta: {
                  label: "Yêu cầu đổi ca",
                  icon: "🔄",
                },
              },

              // ========== SALARY ==========
              {
                name: "salary-schemes",
                list: "/salary/schemes",
                create: "/salary/schemes/create",
                edit: "/salary/schemes/:id/edit",
                meta: {
                  canDelete: true,
                  label: "Bảng lương",
                  icon: "💰",
                },
              },
              {
                name: "salary-requests",
                list: "/salary/requests",
                create: "/salary/requests/create",
                show: "/salary/requests/:id",
                meta: {
                  label: "Yêu cầu lương",
                  icon: "💵",
                },
              },
              {
                name: "deductions",
                list: "/salary/deductions",
                create: "/salary/deductions/create",
                meta: {
                  canDelete: true,
                  label: "Khấu trừ",
                  icon: "➖",
                },
              },

              // ========== DEVICES & RFID ==========
              {
                name: "devices",
                list: "/devices",
                create: "/devices/create",
                edit: "/devices/:id/edit",
                meta: {
                  canDelete: true,
                  label: "Thiết bị",
                  icon: "📱",
                },
              },
              {
                name: "rfid-cards",
                list: "/rfid-cards",
                create: "/rfid-cards/create",
                edit: "/rfid-cards/:id/edit",
                meta: {
                  canDelete: true,
                  label: "Thẻ RFID",
                  icon: "💳",
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: "hrms-frontend",
              
            }}
          >
            {children}
            <RefineKbar />
          </Refine>
        </ColorModeContextProvider>
        <ConfirmModal />
      </AntdApp>
    </RefineKbarProvider>
  );
};
