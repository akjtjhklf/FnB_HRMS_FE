"use client";

import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { Space, Input, theme } from "antd";
import React, { useContext } from "react";
import { Search } from "lucide-react";
import { CustomInbox } from "@/components/notifications/CustomInbox";
import { AppNovuProvider } from "@/providers/novu-notification/NovuProvider"; // Import Provider mới tạo

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutHeaderProps> = () => {
  const { data: user } = useGetIdentity<IUser>();
  const { mode } = useContext(ColorModeContext);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 lg:px-6 pl-16 lg:pl-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Side - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-10 h-10 border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Right Side - Actions */}
      <Space size="large">
        {/* --- WRAP NOVU PROVIDER TẠI ĐÂY (Hoặc bọc toàn bộ App) --- */}
        {user?.id && (
          <AppNovuProvider user={user}>
            <CustomInbox colorMode={mode as "light" | "dark"} />
          </AppNovuProvider>
        )}

        {/* User Info */}
        <div className="pl-3 border-l border-gray-200 flex flex-col items-end">
          <span className="font-semibold text-sm text-gray-900 leading-tight">
            {user?.name || "Admin User"}
          </span>
          <span className="text-xs text-gray-500">
            {(user as any)?.role?.name || "Administrator"}
          </span>
        </div>
      </Space>
    </header>
  );
};
