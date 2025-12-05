"use client";

import { useNovu, useNotifications, useCounts } from "@novu/react";
import { Bell, Check, Clock, Archive, ArchiveRestore, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tooltip, Spin, Empty, App } from "antd";

interface CustomInboxProps {
  colorMode?: "light" | "dark";
}

export const CustomInbox = ({ colorMode = "light" }: CustomInboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "archived">("all");
  const router = useRouter();
  
  // Dùng App.useApp() để tránh lỗi context
  const { message } = App.useApp();

  // Sử dụng hooks từ @novu/react v3
  const novu = useNovu();
  
  // Lấy số lượng chưa đọc
  const { counts } = useCounts({ filters: [{ read: false, archived: false }] });
  const unseenCount = counts?.[0]?.count || 0;

  // Lấy tất cả notifications (không filter ở API level để tránh re-render)
  const { notifications: allNotifications, isLoading, hasMore, fetchMore, refetch } = useNotifications({
    archived: activeTab === "archived" ? true : false,
  });

  // Filter notifications theo tab ở client side
  const notifications = allNotifications?.filter((item: any) => {
    if (activeTab === "unread") return !item.isRead && !item.isArchived;
    if (activeTab === "archived") return item.isArchived;
    return !item.isArchived; // "all" tab
  }) || [];

  // Ref để track việc đã refetch chưa
  const hasRefetchedRef = useRef(false);

  // Handle mở dropdown
  const handleOpenDropdown = useCallback(() => {
    setIsOpen(true);
    // Chỉ refetch 1 lần khi mở
    if (!hasRefetchedRef.current) {
      refetch?.();
      hasRefetchedRef.current = true;
    }
  }, [refetch]);

  // Handle đóng dropdown  
  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
    hasRefetchedRef.current = false;
  }, []);

  // Đánh dấu đã đọc
  const handleMarkAsRead = useCallback(async (notification: any) => {
    try {
      if (!notification.isRead) {
        await novu?.notifications.read({ notificationId: notification.id });
        refetch?.();
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, [novu, refetch]);

  // Đánh dấu chưa đọc
  const handleMarkAsUnread = useCallback(async (notification: any) => {
    try {
      if (notification.isRead) {
        await novu?.notifications.unread({ notificationId: notification.id });
        refetch?.();
      }
    } catch (error) {
      console.error("Failed to mark as unread:", error);
    }
  }, [novu, refetch]);

  // Archive
  const handleArchive = useCallback(async (notification: any) => {
    try {
      await novu?.notifications.archive({ notificationId: notification.id });
      message.success("Đã lưu trữ thông báo");
      refetch?.();
    } catch (error) {
      console.error("Failed to archive:", error);
      message.error("Lỗi lưu trữ thông báo");
    }
  }, [novu, refetch, message]);

  // Unarchive
  const handleUnarchive = useCallback(async (notification: any) => {
    try {
      await novu?.notifications.unarchive({ notificationId: notification.id });
      message.success("Đã bỏ lưu trữ");
      refetch?.();
    } catch (error) {
      console.error("Failed to unarchive:", error);
      message.error("Lỗi bỏ lưu trữ");
    }
  }, [novu, refetch, message]);

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await novu?.notifications.readAll({});
      message.success("Đã đánh dấu tất cả đã đọc");
      refetch?.();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      message.error("Lỗi đánh dấu đã đọc");
    }
  }, [novu, refetch, message]);

  // Xử lý click notification
  const handleNotificationClick = useCallback((notification: any) => {
    handleMarkAsRead(notification);
    
    // Try multiple possible URL locations from Novu payload
    const url = notification.cta?.data?.url 
      || notification.payload?.actionUrl 
      || notification.payload?.url
      || notification.payload?.link
      || notification.payload?.data?.actionUrl
      || notification.payload?.data?.url
      || notification.payload?.data?.link
      || notification.redirect?.url;
    
    console.log("🔔 Notification clicked:", { 
      id: notification.id, 
      payload: notification.payload,
      cta: notification.cta,
      redirect: notification.redirect,
      extractedUrl: url 
    });
    
    if (url) {
      setIsOpen(false); // Đóng dropdown trước khi navigate
      // Nếu là internal link (bắt đầu bằng /) thì dùng Next.js router
      if (url.startsWith('/')) {
        router.push(url);
      } else {
        // External link
        window.open(url, '_blank');
      }
    }
  }, [handleMarkAsRead, router]);

  const renderNotificationList = () => {
    if (isLoading && notifications.length === 0) {
      return (
        <div className="flex items-center justify-center py-10">
          <Spin />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            activeTab === "archived" 
              ? "Không có thông báo đã lưu trữ" 
              : activeTab === "unread"
              ? "Không có thông báo chưa đọc"
              : "Không có thông báo nào"
          }
          className="py-10"
        />
      );
    }

    return (
      <>
        <div className="divide-y divide-gray-100">
          {notifications.map((item: any) => (
            <div
              key={item.id}
              className={`px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${
                !item.isRead ? "bg-blue-50/50" : "bg-white"
              }`}
            >
              {/* Indicator */}
              <div className="mt-1 flex-shrink-0">
                {!item.isRead ? (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                ) : (
                  <Check size={14} className="text-gray-400 mt-1" />
                )}
              </div>

              {/* Content */}
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex items-center gap-1">
                  <p className={`text-sm text-gray-800 ${!item.isRead ? 'font-medium' : ''} flex-1`}>
                    {item.payload?.title || item.body || item.content || "Thông báo hệ thống"}
                  </p>
                  {/* Show link icon if has actionUrl */}
                  {(item.payload?.actionUrl || item.cta?.data?.url) && (
                    <ExternalLink size={12} className="text-blue-500 flex-shrink-0" />
                  )}
                </div>
                {(item.payload?.message || item.subject) && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {item.payload?.message || item.subject}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={10} className="text-gray-400"/>
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Tooltip title={item.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.isRead ? handleMarkAsUnread(item) : handleMarkAsRead(item);
                    }}
                    className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  >
                    {item.isRead ? (
                      <EyeOff size={14} className="text-gray-400" />
                    ) : (
                      <Eye size={14} className="text-blue-500" />
                    )}
                  </button>
                </Tooltip>

                <Tooltip title={item.isArchived ? "Bỏ lưu trữ" : "Lưu trữ"}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.isArchived ? handleUnarchive(item) : handleArchive(item);
                    }}
                    className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  >
                    {item.isArchived ? (
                      <ArchiveRestore size={14} className="text-green-500" />
                    ) : (
                      <Archive size={14} className="text-gray-400" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="p-2 text-center border-t border-gray-100">
            <button
              onClick={() => fetchMore?.()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Đang tải..." : "Tải thêm"}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => isOpen ? handleCloseDropdown() : handleOpenDropdown()}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group outline-none"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          className={`transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}
        />
        {unseenCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseDropdown}
          />

          <div className="absolute right-0 top-12 z-50 w-[420px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Thông báo</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {unseenCount > 0 ? `${unseenCount} thông báo chưa đọc` : "Cập nhật từ hệ thống"}
                </p>
              </div>
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors"
              >
                Đọc tất cả
              </button>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-2 border-b border-gray-100">
              <div className="flex gap-4">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "unread", label: "Chưa đọc" },
                  { key: "archived", label: "Đã lưu" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {renderNotificationList()}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <button
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-1"
                onClick={() => {
                  handleCloseDropdown();
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
