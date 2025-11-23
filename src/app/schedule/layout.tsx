"use client";

import { Header } from "@components/header";
import { ModernSidebar } from "@components/layout";
import { Menu, Calendar, ClipboardList, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetIdentity } from "@refinedev/core";
import { ReactNode, useState } from "react";

import { useCanManageSchedule } from "@/hooks/usePermissions";

export default function ScheduleLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // RBAC: Dynamic permission check
  const isManager = useCanManageSchedule();

  // Menu items based on role
  const scheduleMenuItems = isManager ? [
    { icon: <BarChart3 size={18} />, label: "Dashboard", href: "/schedule/dashboard" },
    { icon: <Calendar size={18} />, label: "Lịch Tuần", href: "/schedule/weekly-schedules" },
    { icon: <Calendar size={18} />, label: "Quản Lý Ca", href: "/schedule/shifts" },
    { icon: <ClipboardList size={18} />, label: "Xếp Lịch", href: "/schedule/assignments" },
    { icon: <ClipboardList size={18} />, label: "Loại Ca", href: "/schedule/shift-types" },
    { icon: <Users size={18} />, label: "Vị Trí", href: "/schedule/positions" },
    { icon: <Users size={18} />, label: "Yêu Cầu Vị Trí", href: "/schedule/shift-requirements" },
    { icon: <ClipboardList size={18} />, label: "Yêu Cầu Đổi Ca", href: "/schedule/change-requests" },
  ] : [
    { icon: <BarChart3 size={18} />, label: "Dashboard", href: "/schedule/dashboard" },
    { icon: <Calendar size={18} />, label: "Lịch Của Tôi", href: "/schedule/my-schedule" },
    { icon: <ClipboardList size={18} />, label: "Đăng Ký Ca", href: "/schedule/availability" },
    { icon: <ClipboardList size={18} />, label: "Đổi Ca", href: "/schedule/change-requests" },
  ];

  const isActive = (href: string) => {
    if (href === "/schedule") {
      return pathname === "/schedule";
    }
    return pathname?.startsWith(href);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ModernSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:ml-24 transition-all duration-300">
        {/* Header */}
        <div className="relative">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <Header />
        </div>

        {/* Sub Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
              {scheduleMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${isActive(item.href)
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
      </div>
    </div>
  );
}
