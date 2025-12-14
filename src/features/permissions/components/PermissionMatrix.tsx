"use client";

import { useList, useCustom, useCreate, useDelete } from "@refinedev/core";
import { Table, Checkbox, Spin, Input, App, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";

interface PermissionMatrixProps {
    policyId: string;
}

export const PermissionMatrix = ({ policyId }: PermissionMatrixProps) => {
    const { message } = App.useApp();
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch collections using useCustom
    const { query: collectionsData } = useCustom({
        url: "/collections",
        method: "get",
    });

    // Fetch existing permissions for this policy
    const { query: permissionsData } = useList({
        resource: "permissions",
        filters: [
            {
                field: "policy",
                operator: "eq",
                value: policyId,
            },
        ],
        pagination: {
            pageSize: 1000,
        },
    });

    const { mutate: createPermission } = useCreate();
    const { mutate: deletePermission } = useDelete();

    // FIX: collectionsData.data is already the array
    const collections = useMemo(() => collectionsData?.data?.data || [], [collectionsData?.data?.data]);
    const permissions = useMemo(() => permissionsData?.data?.data || [], [permissionsData?.data?.data]);

    console.log("PermissionMatrix Debug:", {
        collectionsData,
        collections,
        collectionsLength: collectionsData?.data?.data?.length,
        permissions,
    });

    // Filter collections based on search
    const filteredCollections = useMemo(() => {
        if (!collections || !Array.isArray(collections)) return [];
        return collections.filter((c: any) =>
            c.collection.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [collections, searchText]);

    const handlePermissionChange = (collection: string, action: string, checked: boolean) => {
        // Find existing permission for this collection and action
        const existingPerm = permissions.find(
            (p: any) => p.collection === collection && p.action === action
        );

        if (checked) {
            if (!existingPerm) {
                // Create new permission
                createPermission({
                    resource: "permissions",
                    values: {
                        policy: policyId,
                        collection,
                        action,
                        fields: "*", // Default to all fields
                    },
                }, {
                    onSuccess: () => {
                        message.success(`Đã cấp quyền ${action} cho ${collection}`);
                        permissionsData.refetch();
                    },
                    onError: () => {
                        message.error("Lỗi khi cấp quyền");
                    }
                });
            }
        } else {
            if (existingPerm) {
                // Delete permission
                deletePermission({
                    resource: "permissions",
                    id: existingPerm.id!,
                }, {
                    onSuccess: () => {
                        message.success(`Đã hủy quyền ${action} cho ${collection}`);
                        permissionsData.refetch();
                    },
                    onError: () => {
                        message.error("Lỗi khi hủy quyền");
                    }
                });
            }
        }
    };

    const renderCheckbox = (collection: string, action: string) => {
        const isChecked = permissions.some(
            (p: any) => p.collection === collection && p.action === action
        );

        return (
            <Checkbox
                checked={isChecked}
                onChange={(e) => handlePermissionChange(collection, action, e.target.checked)}
                disabled={isLoading}
            />
        );
    };

    const handleQuickAction = (collection: string, grantAll: boolean) => {
        const actions = ["create", "read", "update", "delete", "share"];

        if (grantAll) {
            // Grant all permissions
            let successCount = 0;
            actions.forEach((action) => {
                const existingPerm = permissions.find(
                    (p: any) => p.collection === collection && p.action === action
                );

                if (!existingPerm) {
                    createPermission({
                        resource: "permissions",
                        values: {
                            policy: policyId,
                            collection,
                            action,
                            fields: "*",
                        },
                    }, {
                        onSuccess: () => {
                            successCount++;
                            if (successCount === 1) {
                                message.success(`Đã cấp toàn quyền cho ${collection}`);
                                permissionsData.refetch();
                            }
                        },
                    });
                }
            });
        } else {
            // Revoke all permissions
            const permsToDelete = permissions.filter(
                (p: any) => p.collection === collection
            );

            if (permsToDelete.length > 0) {
                permsToDelete.forEach((perm: any, index: number) => {
                    deletePermission({
                        resource: "permissions",
                        id: perm.id!,
                    }, {
                        onSuccess: () => {
                            if (index === 0) {
                                message.success(`Đã hủy toàn bộ quyền cho ${collection}`);
                                permissionsData.refetch();
                            }
                        },
                    });
                });
            }
        }
    };

    const hasAnyPermission = (collection: string) => {
        return permissions.some((p: any) => p.collection === collection);
    };

    const handleGrantAllCollections = () => {
        const actions = ["create", "read", "update", "delete", "share"];
        let completedCount = 0;
        let totalToCreate = 0;
        let hasError = false;

        // Calculate how many permissions need to be created
        filteredCollections.forEach((collectionObj: any) => {
            actions.forEach((action) => {
                const existingPerm = permissions.find(
                    (p: any) => p.collection === collectionObj.collection && p.action === action
                );
                if (!existingPerm) {
                    totalToCreate++;
                }
            });
        });

        if (totalToCreate === 0) {
            message.info("Tất cả quyền đã được cấp");
            return;
        }

        // Only set loading if there's work to do
        setIsLoading(true);

        // Create all missing permissions
        filteredCollections.forEach((collectionObj: any) => {
            actions.forEach((action) => {
                const existingPerm = permissions.find(
                    (p: any) => p.collection === collectionObj.collection && p.action === action
                );

                if (!existingPerm) {
                    createPermission({
                        resource: "permissions",
                        values: {
                            policy: policyId,
                            collection: collectionObj.collection,
                            action,
                            fields: "*",
                        },
                    }, {
                        onSuccess: () => {
                            completedCount++;
                            if (completedCount === totalToCreate) {
                                setIsLoading(false);
                                if (!hasError) {
                                    message.success(`Đã cấp toàn quyền cho tất cả ${filteredCollections.length} collection`);
                                }
                                permissionsData.refetch();
                            }
                        },
                        onError: () => {
                            hasError = true;
                            completedCount++;
                            if (completedCount === totalToCreate) {
                                setIsLoading(false);
                                message.error("Có lỗi xảy ra khi cấp quyền");
                                permissionsData.refetch();
                            }
                        }
                    });
                }
            });
        });
    };

    const handleRevokeAllCollections = () => {
        // Get all permissions for filtered collections
        const permsToDelete = permissions.filter((p: any) =>
            filteredCollections.some((c: any) => c.collection === p.collection)
        );

        if (permsToDelete.length === 0) {
            message.info("Không có quyền nào để hủy");
            return;
        }

        setIsLoading(true);
        let completedCount = 0;
        let hasError = false;

        permsToDelete.forEach((perm: any) => {
            deletePermission({
                resource: "permissions",
                id: perm.id!,
            }, {
                onSuccess: () => {
                    completedCount++;
                    if (completedCount === permsToDelete.length) {
                        setIsLoading(false);
                        if (!hasError) {
                            message.success(`Đã hủy tất cả quyền (${permsToDelete.length} quyền)`);
                        }
                        permissionsData.refetch();
                    }
                },
                onError: () => {
                    hasError = true;
                    completedCount++;
                    if (completedCount === permsToDelete.length) {
                        setIsLoading(false);
                        message.error("Có lỗi xảy ra khi hủy quyền");
                        permissionsData.refetch();
                    }
                }
            });
        });
    };

    const columns = [
        {
            title: "Bảng dữ liệu",
            dataIndex: "collection",
            key: "collection",
            width: 300,
            render: (text: string) => <span className="font-medium">{text}</span>,
        },
        {
            title: "Thêm",
            key: "create",
            align: "center" as const,
            render: (_: any, record: any) => renderCheckbox(record.collection, "create"),
        },
        {
            title: "Xem",
            key: "read",
            align: "center" as const,
            render: (_: any, record: any) => renderCheckbox(record.collection, "read"),
        },
        {
            title: "Sửa",
            key: "update",
            align: "center" as const,
            render: (_: any, record: any) => renderCheckbox(record.collection, "update"),
        },
        {
            title: "Xóa",
            key: "delete",
            align: "center" as const,
            render: (_: any, record: any) => renderCheckbox(record.collection, "delete"),
        },
        {
            title: "Chia sẻ",
            key: "share",
            align: "center" as const,
            render: (_: any, record: any) => renderCheckbox(record.collection, "share"),
        },
        {
            title: "Thao tác nhanh",
            key: "quick-actions",
            align: "center" as const,
            width: 200,
            render: (_: any, record: any) => {
                const hasPerms = hasAnyPermission(record.collection);
                return (
                    <div className="flex gap-2 justify-center">
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => handleQuickAction(record.collection, true)}
                            disabled={isLoading}
                        >
                            Cấp
                        </Button>
                        {hasPerms && (
                            <Button
                                danger
                                size="small"
                                onClick={() => handleQuickAction(record.collection, false)}
                                disabled={isLoading}
                            >
                                Hủy
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    if (collectionsData.isLoading || permissionsData.isLoading) {
        return <div className="text-center py-12"><Spin /></div>;
    }

    return (
        <div>
            <div className="mb-4 flex gap-3 items-center">
                <Input
                    placeholder="Tìm kiếm collection..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="max-w-md"
                />
                <Button
                    type="primary"
                    onClick={handleGrantAllCollections}
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Cấp toàn quyền
                </Button>
                <Button
                    danger
                    onClick={handleRevokeAllCollections}
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Hủy tất cả
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredCollections}
                rowKey="collection"
                pagination={{ pageSize: 10 }}
                size="small"
            // scroll={{ y: 400 }}
            />
        </div>
    );
};
