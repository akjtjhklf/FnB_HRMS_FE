"use client";

import React from "react";
import { Drawer, Button, Space, Spin } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";

export interface CustomDrawerProps {
  // Basic props
  open: boolean;
  onClose: () => void;
  title: string;
  width?: string | number;
  
  // Content
  children: React.ReactNode;
  
  // Loading state
  loading?: boolean;
  
  // Footer actions
  showFooter?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  saveLoading?: boolean;
  saveDisabled?: boolean;
  
  // Additional footer content
  footerExtra?: React.ReactNode;
  
  // Style
  className?: string;
  bodyClassName?: string;
  
  // Mode
  mode?: "view" | "edit" | "create";
}

export const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  onClose,
  title,
  width = "66%",
  children,
  loading = false,
  showFooter = false,
  onSave,
  onCancel,
  saveText = "Lưu",
  cancelText = "Hủy",
  saveLoading = false,
  saveDisabled = false,
  footerExtra,
  className,
  bodyClassName,
  mode = "view",
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const footer = showFooter ? (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex-1">
        {footerExtra}
      </div>
      <Space>
        <Button
          onClick={handleCancel}
          icon={<CloseOutlined />}
          disabled={saveLoading}
        >
          {cancelText}
        </Button>
        {onSave && (
          <Button
            type="primary"
            onClick={onSave}
            icon={<SaveOutlined />}
            loading={saveLoading}
            disabled={saveDisabled}
          >
            {saveText}
          </Button>
        )}
      </Space>
    </div>
  ) : undefined;

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-8">
          <span className="text-lg font-semibold text-gray-900">{title}</span>
          {mode && (
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {mode === "view" ? "Xem" : mode === "edit" ? "Chỉnh sửa" : "Thêm mới"}
            </span>
          )}
        </div>
      }
      placement="right"
      width={width}
      onClose={onClose}
      open={open}
      footer={footer}
      className={className}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className={`px-6 py-4 ${bodyClassName || ""}`}>
        <Spin spinning={loading} tip="Đang tải...">
          {children}
        </Spin>
      </div>
    </Drawer>
  );
};

export default CustomDrawer;
