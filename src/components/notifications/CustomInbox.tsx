"use client";

import { Inbox } from "@novu/nextjs";
import { theme } from "antd";
import { Bell } from "lucide-react";
import { useState } from "react";

interface CustomInboxProps {
  subscriberId: string;
  applicationIdentifier: string;
  colorMode?: "light" | "dark";
}

export const CustomInbox = ({
  subscriberId,
  applicationIdentifier,
  colorMode = "light",
}: CustomInboxProps) => {
  const { token } = theme.useToken();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Custom Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          className="text-gray-600 group-hover:text-gray-900 transition-colors"
        />
        {/* Badge for unread count - will be managed by Inbox */}
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
      </button>

      {/* Novu Inbox with Custom Styling */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Inbox Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">
                    Thông báo
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cập nhật mới nhất từ hệ thống
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Inbox Content */}
            <div className="h-[500px] overflow-y-auto">
              <Inbox
                applicationIdentifier={applicationIdentifier}
                subscriberId={subscriberId}
                appearance={{
                  elements: {
                    bellContainer: {
                      display: "none", // Hide default bell, we use custom
                    },
                  },
                  variables: {
                    colorPrimary: token.colorPrimary,
                    colorPrimaryForeground: "#ffffff",
                    colorBackground: "#ffffff",
                    colorForeground: "#1f2937",
                    colorSecondary: "#f3f4f6",
                    colorSecondaryForeground: "#6b7280",
                    colorCounter: "#ef4444",
                    colorCounterForeground: "#ffffff",
                    borderRadius: "0.5rem",
                    fontSize: "14px",
                  },
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <button
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={() => {
                  // Navigate to notifications page
                  window.location.href = "/notifications";
                }}
              >
                Xem tất cả thông báo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
