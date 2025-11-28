"use client";

import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Avatar,
  Space,
  Input,
  Dropdown,
  theme,
  Badge,
} from "antd";
import type { MenuProps } from "antd";
import React, { useContext } from "react";
import { Search, User, LogOut, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  NovuProvider,
  PopoverNotificationCenter,
  NotificationBell,
  IMessage,
} from "@novu/notification-center";

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
  const { token } = theme.useToken();

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

  const onNotificationClick = (message: IMessage) => {
    if (message?.cta?.data?.url) {
      router.push(message.cta.data.url);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 lg:px-6 pl-16 lg:pl-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Side - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-10 h-10 border-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Right Side - Actions */}
      <Space size="large">
        {/* Notifications */}
        <NovuProvider
          subscriberId={user?.id ? String(user.id) : ""}
          applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID || ""}
          initialFetchingStrategy={{ fetchNotifications: true, fetchUserPreferences: true }}
          styles={{
            bellButton: {
              root: {
                marginTop: "8px",
                "& svg": {
                  color: "#4b5563", // gray-600
                },
              },
              dot: {
                rect: {
                  fill: token.colorPrimary,
                  stroke: "#fff",
                  strokeWidth: 2,
                },
              },
            },
            popover: {
              root: {
                zIndex: 9999,
              },
            },
            notificationItem: {
              unread: {
                background: "#f0f9ff", // light blue bg for unread
                borderLeft: `4px solid ${token.colorPrimary}`,
              },
            },
            header: {
              root: {
                backgroundColor: "#fff",
                borderBottom: "1px solid #f0f0f0",
              },
              title: {
                color: "#1f2937",
                fontSize: "18px",
                fontWeight: 600,
              },
            },
          }}
        >
          <PopoverNotificationCenter
            onNotificationClick={onNotificationClick}
            colorScheme={mode === "dark" ? "dark" : "light"}
            showUserPreferences={false}
            listItem={(
              notification,
              handleNotificationClick,
              handlePrimaryCtaClick,
              handleSecondaryCtaClick
            ) => {
              return (
                <div
                  onClick={() => handleNotificationClick()}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50/50" : "bg-white"
                    }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${!notification.read ? "bg-blue-500" : "bg-gray-300"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {/* @ts-ignore */}
                          {notification.payload?.title || "Thông báo mới"}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {/* @ts-ignore */}
                        {notification.payload?.body || notification.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }}
          >
            {({ unseenCount }) => (
              <div className="relative cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <NotificationBell unseenCount={unseenCount} />
              </div>
            )}
          </PopoverNotificationCenter>
        </NovuProvider>

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
