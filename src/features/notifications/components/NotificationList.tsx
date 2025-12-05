"use client";

import { useTable } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Drawer,
  Descriptions,
  Divider,
  App,
  Badge,
} from "antd";
import {
  BellOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { Notification, RecipientType } from "@/types/notification";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";
import { useConfirmModalStore } from "@/store/confirmModalStore";
import { CustomDrawer } from "@/components/common/CustomDrawer";
import { NotificationForm } from "./NotificationForm";

export const NotificationList = () => {
  const { message } = App.useApp();
  const { mutate: deleteNotification } = useDelete();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const [searchText, setSearchText] = useState("");
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewingNotification, setViewingNotification] =
    useState<Notification | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);

  const { tableProps, tableQuery } = useTable<Notification>({
    resource: "notifications",
    syncWithLocation: true,
    pagination: {
      pageSize: 1000,
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });

  const notifications = useMemo(
    () => tableProps.dataSource || [],
    [tableProps.dataSource]
  );

  // Filter by search text
  const filteredNotifications = useMemo(() => {
    if (!searchText) return notifications;
    const searchLower = searchText.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title?.toLowerCase().includes(searchLower) ||
        n.body?.toLowerCase().includes(searchLower)
    );
  }, [notifications, searchText]);

  const getLevelConfig = (level?: string) => {
    switch (level) {
      case "warning":
        return { color: "warning", text: "Cảnh báo" };
      case "error":
        return { color: "error", text: "Lỗi" };
      default:
        return { color: "processing", text: "Thông tin" };
    }
  };

  const getRecipientTypeConfig = (type?: RecipientType | string) => {
    // Normalize to lowercase for comparison
    const normalizedType = type?.toLowerCase();
    
    switch (normalizedType) {
      case "all":
        return {
          icon: <GlobalOutlined />,
          color: "blue",
          text: "Tất cả",
        };
      case "individual":
      case "specific":
        return {
          icon: <UserOutlined />,
          color: "green",
          text: "Cá nhân",
        };
      case "group":
        return {
          icon: <TeamOutlined />,
          color: "orange",
          text: "Nhóm",
        };
      default:
        return {
          icon: <UserOutlined />,
          color: "default",
          text: type || "Không xác định",
        };
    }
  };

  const handleView = (record: Notification) => {
    setViewingNotification(record);
    setViewDrawerOpen(true);
  };

  const handleEdit = (record: Notification) => {
    setEditingNotification(record);
    setEditDrawerOpen(true);
  };

  const handleDelete = (record: Notification) => {
    openConfirm({
      title: "⚠️ Xác nhận xóa thông báo",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa thông báo <strong>{record.title}</strong>{" "}
            không?
          </p>
          <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: async () => {
        await deleteNotification({
          resource: "notifications",
          id: record.id,
        });
        message.success("✅ Xóa thông báo thành công!");
      },
    });
  };

  const handleCreateSuccess = () => {
    setCreateDrawerOpen(false);
    tableQuery?.refetch();
  };

  const handleEditSuccess = () => {
    setEditDrawerOpen(false);
    setEditingNotification(null);
    tableQuery?.refetch();
  };

  const getActionItems = (record: Notification): ActionItem[] => [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: () => handleView(record),
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      onClick: () => handleDelete(record),
      danger: true,
    },
  ];

  const columns: any[] = [
    {
      title: "Mức độ",
      dataIndex: "level",
      key: "level",
      width: 110,
      filters: [
        { text: "Thông tin", value: "info" },
        { text: "Cảnh báo", value: "warning" },
        { text: "Lỗi", value: "error" },
      ],
      onFilter: (value: any, record: Notification) => record.level === value,
      render: (level: string) => {
        const config = getLevelConfig(level);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title: string) => (
        <span className="font-semibold text-gray-900">{title}</span>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "body",
      key: "body",
      ellipsis: true,
      render: (body: string) => (
        <span className="text-gray-600">{body || "-"}</span>
      ),
    },
    {
      title: "Người nhận",
      dataIndex: "recipient_type",
      key: "recipient_type",
      width: 130,
      filters: [
        { text: "Tất cả", value: "all" },
        { text: "Cá nhân", value: "individual" },
        { text: "Nhóm", value: "group" },
      ],
      onFilter: (value: any, record: Notification) =>
        record.recipient_type === value,
      render: (type: RecipientType, record: Notification) => {
        const config = getRecipientTypeConfig(type);
        const count =
          type === "ALL" ? null : record.recipient_ids?.length || 0;
        return (
          <Badge count={count} showZero={false} offset={[8, 0]}>
            <Tag color={config.color} icon={config.icon}>
              {config.text}
            </Tag>
          </Badge>
        );
      },
    },
    {
      title: "Ngày gửi",
      dataIndex: "sent_at",
      key: "sent_at",
      width: 130,
      sorter: true,
      render: (date: string) => (
        <span className="text-gray-700">{date ? formatDate(date) : "-"}</span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 130,
      sorter: true,
      render: (date: string) => (
        <span className="text-gray-700">{date ? formatDate(date) : "-"}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: Notification) => (
        <ActionPopover actions={getActionItems(record)} />
      ),
    },
  ];

  const handleRefresh = () => {
    tableQuery?.refetch();
    message.info("Đang tải lại dữ liệu...");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-500 mt-1">Quản lý thông báo hệ thống</p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={tableQuery?.isFetching}
            size="large"
          >
            Làm mới
          </Button>
          <Input.Search
            placeholder="Tìm theo tiêu đề, nội dung..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateDrawerOpen(true)}
            size="large"
          >
            Tạo thông báo
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          {...tableProps}
          dataSource={filteredNotifications}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            ...tableProps.pagination,
            total: filteredNotifications.length,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thông báo`,
          }}
        />
      </div>

      {/* View Drawer */}
      <Drawer
        open={viewDrawerOpen}
        title={
          <div className="flex items-center gap-2">
            <BellOutlined />
            <span className="text-base md:text-lg">Chi tiết thông báo</span>
          </div>
        }
        width={600}
        onClose={() => {
          setViewDrawerOpen(false);
          setViewingNotification(null);
        }}
        styles={{ body: { paddingTop: 16 } }}
      >
        {viewingNotification && (
          <div className="space-y-4">
            <Descriptions column={1} bordered size="small" className="text-sm">
              <Descriptions.Item label="Tiêu đề">
                <span className="font-semibold">
                  {viewingNotification.title}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                <Tag color={getLevelConfig(viewingNotification.level || undefined).color}>
                  {getLevelConfig(viewingNotification.level || undefined).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {(() => {
                  const config = getRecipientTypeConfig(
                    viewingNotification.recipient_type
                  );
                  return (
                    <Space>
                      <Tag color={config.color} icon={config.icon}>
                        {config.text}
                      </Tag>
                      {viewingNotification.recipient_type !== "ALL" && (
                        <span className="text-gray-500">
                          ({viewingNotification.recipient_ids?.length || 0}{" "}
                          người)
                        </span>
                      )}
                    </Space>
                  );
                })()}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" className="text-sm md:text-base my-3">
              Nội dung
            </Divider>

            <div className="p-4 bg-gray-50 rounded text-sm whitespace-pre-wrap">
              {viewingNotification.body || "Không có nội dung"}
            </div>

            <Divider orientation="left" className="text-sm md:text-base my-3">
              Thông tin khác
            </Divider>

            <Descriptions column={1} bordered size="small" className="text-sm">
              <Descriptions.Item label="Ngày gửi">
                {viewingNotification.sent_at
                  ? formatDate(viewingNotification.sent_at)
                  : "Chưa gửi"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(viewingNotification.created_at || "")}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDate(viewingNotification.updated_at || "")}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Create Drawer */}
      <CustomDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="Tạo thông báo mới"
        width="66%"
        mode="create"
      >
        <NotificationForm
          action="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setCreateDrawerOpen(false)}
        />
      </CustomDrawer>

      {/* Edit Drawer */}
      <CustomDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setEditingNotification(null);
        }}
        title="Chỉnh sửa thông báo"
        width="66%"
        mode="edit"
      >
        {editingNotification && (
          <NotificationForm
            action="edit"
            id={editingNotification.id}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setEditDrawerOpen(false);
              setEditingNotification(null);
            }}
          />
        )}
      </CustomDrawer>
    </div>
  );
};
