"use client";

import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Avatar,
  Space,
  Switch,
  Input,
  Badge,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import React, { useContext } from "react";
import { Bell, Search, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutHeaderProps> = () => {
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const { mutate: logout } = useLogout();
  const router = useRouter();

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: (
        <div onClick={() => router.push("/profile")} className="py-1">
          <div className="font-medium text-sm">{user?.name || "Admin User"}</div>
          <div className="text-xs text-gray-500">View Profile</div>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Logout",
      onClick: () => logout(),
      danger: true,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 lg:px-6 pl-16 lg:pl-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Side - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-10 h-10 border-gray-200 rounded-lg"
            // suffix={
            //   <kbd className="px-2 py-0.5 text-xs bg-gray-100 rounded border border-gray-200">
            //     ⌘F
            //   </kbd>
            // }
          />
        </div>
      </div>

      {/* Right Side - Actions */}
      <Space size="large">
        {/* Dark Mode Toggle */}
        {/* <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        /> */}

        {/* Notifications */}
        <Badge count={3} size="small">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
        </Badge>

        {/* User Avatar with Dropdown */}
        <Dropdown 
          menu={{ items: menuItems }} 
          trigger={["click"]}
          placement="bottomRight"
        >
          <div className="pl-3 border-l border-gray-200 cursor-pointer">
            <Avatar
              src={user?.avatar}
              size={40}
              className="hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
              style={{ 
                backgroundColor: user?.avatar ? undefined : '#1890ff',
              }}
            >
              {!user?.avatar && (user?.name?.[0] || "A")}
            </Avatar>
          </div>
        </Dropdown>
      </Space>
    </header>
  );
};
