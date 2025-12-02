"use client";

import { useNotifications } from "@novu/notification-center";
import { Bell, Check, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface CustomInboxProps {
  colorMode?: "light" | "dark";
}

export const CustomInbox = ({ colorMode = "light" }: CustomInboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ép kiểu 'as any' để tránh lỗi TypeScript thiếu definition
  const {
    notifications,
    unseenCount,
    markAsSeen, 
    isLoading,
    refetch // Hàm này rất quan trọng để tải danh sách
  } = useNotifications() as any;

  // SỬA: Thêm useEffect để gọi API lấy danh sách thông báo khi mở dropdown
  // Mặc định Novu có thể chỉ load số lượng (count) mà chưa load danh sách (feed)
  useEffect(() => {
    if (isOpen && refetch) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Hàm xử lý khi click từng thông báo
  const handleNotificationClick = (notification: any) => {
    if (!notification.seen) {
      markAsSeen(notification._id);
    }

    if (notification.cta?.data?.url) {
      window.location.href = notification.cta.data.url;
    } else if (notification.payload?.url) {
      window.location.href = notification.payload.url;
    }
  };

  const handleMarkAllAsRead = () => {
    if (notifications && notifications.length > 0) {
      notifications.forEach((n: any) => {
        if (!n.seen) {
           markAsSeen(n._id);
        }
      });
    }
  };

  const count = unseenCount || 0;

  // Logic kiểm tra loading: Chỉ hiện loading nếu đang tải VÀ chưa có dữ liệu hiển thị
  // Điều này giúp tránh việc treo màn hình loading mãi
  const showLoading = isLoading && (!notifications || notifications.length === 0);

  return (
    <div className="relative">
      {/* --- Custom Bell Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group outline-none"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          className={`transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}
        />
        {/* Badge count */}
        {count > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* --- Custom Dropdown --- */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-12 z-50 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Thông báo</h3>
                <p className="text-xs text-gray-500 mt-0.5">Cập nhật từ hệ thống</p>
              </div>
              <div className="flex gap-2">
                 <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                 >
                    Đã đọc hết
                 </button>
              </div>
            </div>

            {/* List Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {showLoading ? (
                <div className="p-4 space-y-3">
                   <p className="text-center text-sm text-gray-400 animate-pulse">Đang tải danh sách...</p>
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Bell size={40} className="mb-2 opacity-20" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((item: any) => (
                    <div
                      key={item._id}
                      onClick={() => handleNotificationClick(item)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${
                        !item.seen ? "bg-blue-50/50" : "bg-white"
                      }`}
                    >
                      <div className="mt-1 flex-shrink-0">
                         {!item.seen ? (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                         ) : (
                            <Check size={14} className="text-gray-400 mt-1" />
                         )}
                      </div>

                      <div className="flex-1">
                        <p className={`text-sm text-gray-800 ${!item.seen ? 'font-medium' : ''}`}>
                          {item.content || item.body || "Thông báo hệ thống"} 
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={10} className="text-gray-400"/>
                            <span className="text-xs text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <button
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-1"
                onClick={() => window.location.href = "/notifications"}
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