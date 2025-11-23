"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@refinedev/core";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  ClipboardList,
  DollarSign,
  Bell,
  FileText,
  LogOut,
  X,
  User,
} from "lucide-react";
import { BranchesOutlined } from "@ant-design/icons";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string | number;
}

const sidebarItems: SidebarItem[] = [
  {
    icon: <LayoutDashboard size={24} />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <Users size={24} />,
    label: "Nhân viên",
    href: "/employees",
  },
  {
    icon: <User size={24} />,
    label: "Thông tin",
    href: "/profile",
  },
  {
    icon: <Calendar size={24} />,
    label: "Lịch làm",
    href: "/schedule",
  },
  {
    icon: <CheckSquare size={24} />,
    label: "Chấm công",
    href: "/attendance",
  },
  {
    icon: <ClipboardList size={24} />,
    label: "Yêu cầu",
    href: "/requests",
  },
  {
    icon: <DollarSign size={24} />,
    label: "Bảng lương",
    href: "/salary",
  },
  {
    icon: <Bell size={24} />,
    label: "Thông báo",
    href: "/notifications",
  },
  {
    icon: <FileText size={24} />,
    label: "Thống kê",
    href: "/reports",
  },
  {
    icon: <BranchesOutlined size={24} />,
    label: "Phân quyền",
    href: "/permissions",
  },
];

const bottomItems: SidebarItem[] = [
  {
    icon: <LogOut size={24} />,
    label: "Logout",
    href: "/logout",
  },
];

interface ModernSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  mobileOpen = false,
  onMobileClose,
}) => {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname === "/" ||
        pathname === "/(dashboard)"
      );
    }
    return pathname?.startsWith(href);
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    if (
      onMobileClose &&
      typeof window !== "undefined" &&
      window.innerWidth < 1024
    ) {
      onMobileClose();
    }
  }, [pathname, onMobileClose]);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 fixed left-0 top-0 z-50",
          "w-24",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 relative">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-2 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="space-y-2">
            {sidebarItems.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 group relative",
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-600 rounded-r-full" />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0">{item.icon}</div>

                  {/* Label */}
                  <span className="font-medium text-[10px] text-center leading-tight">
                    {item.label}
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 px-2">
          <div className="space-y-2">
            {bottomItems.map((item, index) => {
              const active = isActive(item.href);
              const isLogout = item.href === "/logout";

              if (isLogout) {
                return (
                  <button
                    key={index}
                    onClick={() => logout()}
                    className={cn(
                      "w-full flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition-all duration-200 group relative",
                      "text-red-600 hover:bg-red-50"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">{item.icon}</div>

                    {/* Label */}
                    <span className="font-medium text-[10px] text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition-all duration-200 group relative",
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">{item.icon}</div>

                  {/* Label */}
                  <span className="font-medium text-[10px] text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
