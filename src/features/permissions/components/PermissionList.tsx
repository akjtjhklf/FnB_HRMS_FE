"use client";

import { useTable } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import {
  Table,
  Button,
  Tag,
  Tooltip,
  App,
  Input,
  Card,
  Space,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { Shield, Database, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Permission } from "@/types/permission";
import { useConfirmModalStore } from "@/store/confirmModalStore";
import { ActionPopover, ActionItem } from "@/components/common/ActionPopover";
import { CustomDrawer } from "@/components/common/CustomDrawer";
import { useState, useMemo } from "react";
import { PermissionForm } from "./PermissionForm";

export const PermissionList = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const { mutate: deletePermission } = useDelete();
  const openConfirm = useConfirmModalStore((state) => state.openConfirm);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  const { tableProps } = useTable<Permission>({
    resource: "permissions",
    syncWithLocation: true,
    pagination: {
      pageSize: 15,
    },
    sorters: {
      initial: [
        {
          field: "collection",
          order: "asc",
        },
      ],
    },
  });

  const permissions = useMemo(
    () => tableProps.dataSource || [],
    [tableProps.dataSource]
  );

  // Filter permissions by search text
  const filteredPermissions = useMemo(() => {
    if (!searchText) return permissions;
    const searchLower = searchText.toLowerCase();
    return permissions.filter((perm) => {
      return (
        perm.collection?.toLowerCase().includes(searchLower) ||
        perm.action?.toLowerCase().includes(searchLower) ||
        perm.policy?.toLowerCase().includes(searchLower)
      );
    });
  }, [permissions, searchText]);

  const handleView = (record: Permission) => {
    setSelectedPermission(record);
    setViewDrawerOpen(true);
  };

  const handleEdit = (record: Permission) => {
    setSelectedPermission(record);
    setDrawerOpen(true);
  };

  const handleDelete = (record: Permission) => {
    openConfirm({
      title: "⚠️ Xác nhận xóa quyền",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa quyền <strong>{record.action}</strong> trên collection <strong>{record.collection}</strong> không?
          </p>
          <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: async () => {
        await deletePermission({
          resource: "permissions",
          id: record.id,
        });
        message.success("✅ Xóa quyền thành công!");
      },
    });
  };

  const handleAdd = () => {
    setSelectedPermission(null);
    setDrawerOpen(true);
  };

  const getActionItems = (record: Permission): ActionItem[] => [
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

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "green",
      read: "blue",
      update: "orange",
      delete: "red",
      share: "purple",
    };
    return colors[action] || "default";
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      create: <PlusOutlined />,
      read: <EyeOutlined />,
      update: <EditOutlined />,
      delete: <DeleteOutlined />,
      share: <SafetyOutlined />,
    };
    return icons[action] || <KeyOutlined />;
  };

  const columns = [
    {
      title: "Bảng dữ liệu",
      dataIndex: "collection",
      key: "collection",
      width: 200,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{text}</span>
        </div>
      ),
      sorter: true,
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 150,
      render: (text: string) => (
        <Tag icon={getActionIcon(text)} color={getActionColor(text)}>
          {text.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Tạo mới", value: "create" },
        { text: "Xem", value: "read" },
        { text: "Cập nhật", value: "update" },
        { text: "Xóa", value: "delete" },
        { text: "Chia sẻ", value: "share" },
      ],
    },
    {
      title: "Mã chính sách",
      dataIndex: "policy",
      key: "policy",
      width: 300,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-gray-700 font-mono text-xs">{text}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Trường dữ liệu",
      dataIndex: "fields",
      key: "fields",
      width: 150,
      ellipsis: true,
      render: (text: string | null) => (
        text ? (
          <Tooltip title={text}>
            <Tag color="cyan">{text.split(",").length} trường</Tag>
          </Tooltip>
        ) : (
          <Tag color="default">Tất cả</Tag>
        )
      ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissions",
      key: "permissions",
      width: 120,
      align: "center" as const,
      render: (permissions: Record<string, any> | null) => {
        if (!permissions) return <Tag color="default">Không</Tag>;
        const count = Object.keys(permissions).length;
        return (
          <Badge count={count} showZero color="blue">
            <Settings className="w-5 h-5 text-gray-700" />
          </Badge>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: Permission) => (
        <ActionPopover actions={getActionItems(record)} />
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-7 h-7 text-blue-600" />
                Quản lý Phân quyền
              </h1>
              <p className="text-gray-500 mt-1">
                Quản lý quyền truy cập cho các collections và policies
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAdd}
              className="flex items-center gap-2"
            >
              Thêm quyền mới
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-4">
            <Input
              placeholder="Tìm kiếm theo collection, action, policy..."
              prefix={<SearchOutlined className="text-gray-700" />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <Table
            {...tableProps}
            dataSource={filteredPermissions}
            columns={columns}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} quyền`,
              position: ["bottomCenter"],
            }}
          />
        </Card>

        {/* Edit/Create Drawer */}
        <CustomDrawer
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {selectedPermission ? "Chỉnh sửa quyền" : "Thêm quyền mới"}
            </div>
          }
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedPermission(null);
          }}
          width={600}
        >
          <PermissionForm
            permission={selectedPermission}
            onSuccess={() => {
              setDrawerOpen(false);
              setSelectedPermission(null);
            }}
            onCancel={() => {
              setDrawerOpen(false);
              setSelectedPermission(null);
            }}
          />
        </CustomDrawer>

        {/* View Drawer */}
        <CustomDrawer
          title={
            <div className="flex items-center gap-2">
              <EyeOutlined />
              Chi tiết quyền
            </div>
          }
          open={viewDrawerOpen}
          onClose={() => {
            setViewDrawerOpen(false);
            setSelectedPermission(null);
          }}
          width={600}
        >
          {selectedPermission && (
            <div className="space-y-4">
              <Card type="inner" title="Thông tin cơ bản">
                <Space direction="vertical" className="w-full" size="middle">
                  <div>
                    <p className="text-gray-500 text-sm">Collection</p>
                    <p className="font-medium">{selectedPermission.collection}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Action</p>
                    <Tag icon={getActionIcon(selectedPermission.action)} color={getActionColor(selectedPermission.action)}>
                      {selectedPermission.action.toUpperCase()}
                    </Tag>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Mã chính sách</p>
                    <p className="font-mono text-xs text-gray-700 break-all">{selectedPermission.policy}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Trường dữ liệu</p>
                    <p className="font-medium">{selectedPermission.fields || "Tất cả trường"}</p>
                  </div>
                </Space>
              </Card>

              {selectedPermission.permissions && (
                <Card type="inner" title="Cấu hình quyền">
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPermission.permissions, null, 2)}
                  </pre>
                </Card>
              )}

              {selectedPermission.validation && (
                <Card type="inner" title="Quy tắc xác thực">
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPermission.validation, null, 2)}
                  </pre>
                </Card>
              )}

              {selectedPermission.presets && (
                <Card type="inner" title="Giá trị mặc định">
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPermission.presets, null, 2)}
                  </pre>
                </Card>
              )}
            </div>
          )}
        </CustomDrawer>
      </div>
    </div>
  );
};
