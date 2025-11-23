"use client";

import React from "react";
import { Modal, App } from "antd";
import { ExclamationCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { useConfirmModalStore } from "@/store/confirmModalStore";

export const ConfirmModal: React.FC = () => {
  const {
    isOpen,
    title,
    content,
    onConfirm,
    onCancel,
    okText,
    cancelText,
    type,
    loading,
    closeConfirm,
    setLoading,
  } = useConfirmModalStore();

  const { message } = App.useApp();

  const handleOk = async () => {
    try {
      setLoading(true);
      await onConfirm();
      closeConfirm();
    } catch (error: any) {
      console.error("Confirm action error:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Có lỗi xảy ra!";
      message.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeConfirm();
  };

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <ExclamationCircleOutlined className="text-red-500" />;
      case "warning":
        return <WarningOutlined className="text-yellow-500" />;
      default:
        return <ExclamationCircleOutlined className="text-blue-500" />;
    }
  };

  return (
    <Modal
      open={isOpen}
      title={
        <div className="flex items-center gap-2">
          {getIcon()}
          <span>{title}</span>
        </div>
      }
      onOk={handleOk}
      onCancel={handleCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{
        danger: type === "danger",
        loading: loading,
      }}
      confirmLoading={loading}
      centered
    >
      {content}
    </Modal>
  );
};
