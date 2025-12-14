"use client";

import { useList, useCustomMutation, useGetIdentity } from "@refinedev/core";
import {
    Card,
    List,
    Typography,
    Tag,
    Empty,
    Spin,
    Button,
    Space,
    Drawer,
    Divider,
    Badge,
    Tabs,
    App,
} from "antd";
import {
    BellOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
    DeleteOutlined,
    LinkOutlined,
} from "@ant-design/icons";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Notification } from "@/types/notification";

const { Text, Paragraph, Title } = Typography;

export const MyNotifications = () => {
    const { message } = App.useApp();
    const router = useRouter();
    const { data: identity } = useGetIdentity<{ id: string; employee_id?: string }>();
    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

    const { mutate: markAsRead } = useCustomMutation();
    const { mutate: markAllAsRead } = useCustomMutation();

    // Fetch user's notifications
    const { query } = useList<Notification>({
        resource: "notifications",
        pagination: { pageSize: 100 },
        sorters: [{ field: "created_at", order: "desc" }],
        filters: [
            // Backend should filter by recipient (current user)
            // If backend doesn't do this automatically, we can add filter here
        ],
    });

    const { data, isLoading, refetch } = query;
    const notifications = useMemo(() => data?.data || [], [data?.data]);

    // Filter notifications based on active tab
    const filteredNotifications = useMemo(() => {
        if (activeTab === "unread") {
            return notifications.filter((n: Notification) => !n.is_read);
        }
        return notifications;
    }, [notifications, activeTab]);

    // Count unread notifications
    const unreadCount = useMemo(() => {
        return notifications.filter((n: Notification) => !n.is_read).length;
    }, [notifications]);

    const getLevelConfig = (level?: string | null) => {
        switch (level) {
            case "warning":
                return {
                    color: "warning",
                    icon: <WarningOutlined />,
                    text: "Cảnh báo",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                };
            case "error":
                return {
                    color: "error",
                    icon: <CloseCircleOutlined />,
                    text: "Quan trọng",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            case "success":
                return {
                    color: "success",
                    icon: <CheckCircleOutlined />,
                    text: "Thành công",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                };
            default:
                return {
                    color: "processing",
                    icon: <InfoCircleOutlined />,
                    text: "Thông tin",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                };
        }
    };

    const handleView = (notification: Notification) => {
        // Mark as read if not already read
        if (!notification.is_read) {
            markAsRead(
                {
                    url: `notifications/${notification.id}/read`,
                    method: "post",
                    values: {},
                },
                {
                    onSuccess: () => {
                        refetch();
                    },
                }
            );
        }

        // If notification has a link/action_url, navigate to it
        const targetUrl = notification.link || notification.action_url;
        if (targetUrl) {
            router.push(targetUrl);
            return;
        }

        // Otherwise, show notification detail in drawer
        setViewingNotification(notification);
        setDrawerOpen(true);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead(
            {
                url: "notifications/mark-all-read",
                method: "post",
                values: {},
            },
            {
                onSuccess: () => {
                    message.success("Đã đánh dấu tất cả là đã đọc");
                    refetch();
                },
                onError: () => {
                    message.error("Không thể đánh dấu đã đọc");
                },
            }
        );
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setViewingNotification(null);
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return formatDate(dateString);
    };

    const renderNotificationItem = (notification: Notification) => {
        const levelConfig = getLevelConfig(notification.level);
        const isRead = notification.is_read;
        const hasLink = notification.link || notification.action_url;

        return (
            <List.Item
                key={notification.id}
                className={`cursor-pointer transition-all hover:bg-gray-50 ${
                    !isRead ? "bg-blue-50/50" : ""
                }`}
                onClick={() => handleView(notification)}
            >
                <div className="w-full flex items-start gap-3 p-2">
                    {/* Level Icon */}
                    <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${levelConfig.bgColor}`}
                    >
                        <span className={`text-lg`} style={{ color: levelConfig.color === "processing" ? "#1890ff" : undefined }}>
                            {levelConfig.icon}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {!isRead && (
                                <Badge status="processing" />
                            )}
                            <Text strong className={!isRead ? "text-gray-900" : "text-gray-700"}>
                                {notification.title}
                            </Text>
                            {hasLink && (
                                <LinkOutlined className="text-blue-500" title="Có liên kết" />
                            )}
                            <Tag color={levelConfig.color} className="ml-auto text-xs">
                                {levelConfig.text}
                            </Tag>
                        </div>
                        <Paragraph
                            ellipsis={{ rows: 2 }}
                            className={`mb-1 text-sm ${!isRead ? "text-gray-700" : "text-gray-500"}`}
                        >
                            {notification.body || notification.message}
                        </Paragraph>
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                            <ClockCircleOutlined />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                            {isRead && (
                                <>
                                    <span>•</span>
                                    <span className="text-green-500 flex items-center gap-1">
                                        <CheckOutlined /> Đã đọc
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </List.Item>
        );
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BellOutlined />
                        Thông báo của tôi
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Bạn có <span className="font-semibold text-blue-600">{unreadCount}</span> thông báo chưa đọc
                    </p>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                    >
                        Làm mới
                    </Button>
                    {unreadCount > 0 && (
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={handleMarkAllAsRead}
                        >
                            Đọc tất cả
                        </Button>
                    )}
                </Space>
            </div>

            {/* Tabs */}
            <Card className="shadow-sm">
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as "all" | "unread")}
                    items={[
                        {
                            key: "all",
                            label: (
                                <span>
                                    Tất cả
                                    <Badge count={notifications.length} className="ml-2" showZero />
                                </span>
                            ),
                        },
                        {
                            key: "unread",
                            label: (
                                <span>
                                    Chưa đọc
                                    <Badge count={unreadCount} className="ml-2" />
                                </span>
                            ),
                        },
                    ]}
                />

                {filteredNotifications.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            activeTab === "unread"
                                ? "Bạn đã đọc tất cả thông báo"
                                : "Chưa có thông báo nào"
                        }
                        className="py-12"
                    />
                ) : (
                    <List
                        dataSource={filteredNotifications}
                        renderItem={renderNotificationItem}
                        split
                        className="notification-list"
                    />
                )}
            </Card>

            {/* Detail Drawer */}
            <Drawer
                open={drawerOpen}
                title={
                    <div className="flex items-center gap-2">
                        <BellOutlined />
                        <span>Chi tiết thông báo</span>
                    </div>
                }
                width={500}
                onClose={handleCloseDrawer}
            >
                {viewingNotification && (
                    <div className="space-y-4">
                        {/* Level Badge */}
                        <div className="flex items-center gap-2">
                            <Tag color={getLevelConfig(viewingNotification.level).color}>
                                {getLevelConfig(viewingNotification.level).icon}
                                <span className="ml-1">{getLevelConfig(viewingNotification.level).text}</span>
                            </Tag>
                            {viewingNotification.is_read ? (
                                <Tag color="success" icon={<CheckOutlined />}>
                                    Đã đọc
                                </Tag>
                            ) : (
                                <Tag color="processing">Chưa đọc</Tag>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <Title level={4} className="mb-0">
                                {viewingNotification.title}
                            </Title>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-gray-500">
                            <ClockCircleOutlined />
                            <span>{formatDate(viewingNotification.created_at)}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(viewingNotification.created_at)}</span>
                        </div>

                        <Divider />

                        {/* Body */}
                        <div className="prose max-w-none">
                            <Paragraph className="text-gray-700 whitespace-pre-wrap">
                                {viewingNotification.body || viewingNotification.message}
                            </Paragraph>
                        </div>

                        {/* Action Button if link exists */}
                        {(viewingNotification.link || viewingNotification.action_url) && (
                            <>
                                <Divider />
                                <div className="flex justify-center">
                                    <Button
                                        type="primary"
                                        icon={<LinkOutlined />}
                                        size="large"
                                        onClick={() => {
                                            const targetUrl = viewingNotification.link || viewingNotification.action_url;
                                            if (targetUrl) {
                                                router.push(targetUrl);
                                                handleCloseDrawer();
                                            }
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Metadata */}
                        {viewingNotification.metadata && Object.keys(viewingNotification.metadata).length > 0 && (
                            <>
                                <Divider />
                                <div>
                                    <Text strong className="block mb-2">Thông tin bổ sung:</Text>
                                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                                        {JSON.stringify(viewingNotification.metadata, null, 2)}
                                    </pre>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Drawer>

            <style jsx global>{`
                .notification-list .ant-list-item {
                    padding: 0 !important;
                    border-bottom: 1px solid #f0f0f0;
                }
                .notification-list .ant-list-item:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
};
