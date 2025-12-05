import { message, notification } from 'antd';
import type { ArgsProps as NotificationArgsProps } from 'antd/es/notification';
import type { ArgsProps as MessageArgsProps } from 'antd/es/message';

/**
 * Toast Service - Quản lý thông báo toast cho toàn bộ dự án
 * Sử dụng Ant Design message và notification
 */

// ==================== MESSAGE (Toast nhỏ, hiển thị nhanh) ====================

type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  duration?: number; // seconds
  key?: string;
  onClose?: () => void;
}

const DEFAULT_DURATION = 3; // seconds

/**
 * Hiển thị toast message thành công
 */
export const toastSuccess = (content: string, options?: ToastOptions) => {
  message.success({
    content,
    duration: options?.duration ?? DEFAULT_DURATION,
    key: options?.key,
    onClose: options?.onClose,
  });
};

/**
 * Hiển thị toast message lỗi
 */
export const toastError = (content: string, options?: ToastOptions) => {
  message.error({
    content,
    duration: options?.duration ?? 5, // Error hiển thị lâu hơn
    key: options?.key,
    onClose: options?.onClose,
  });
};

/**
 * Hiển thị toast message cảnh báo
 */
export const toastWarning = (content: string, options?: ToastOptions) => {
  message.warning({
    content,
    duration: options?.duration ?? 4,
    key: options?.key,
    onClose: options?.onClose,
  });
};

/**
 * Hiển thị toast message thông tin
 */
export const toastInfo = (content: string, options?: ToastOptions) => {
  message.info({
    content,
    duration: options?.duration ?? DEFAULT_DURATION,
    key: options?.key,
    onClose: options?.onClose,
  });
};

/**
 * Hiển thị toast loading (cần gọi message.destroy(key) để đóng)
 */
export const toastLoading = (content: string, key?: string) => {
  message.loading({
    content,
    duration: 0, // Không tự đóng
    key: key ?? 'loading',
  });
};

/**
 * Đóng toast theo key
 */
export const toastDestroy = (key?: string) => {
  if (key) {
    message.destroy(key);
  } else {
    message.destroy();
  }
};

// ==================== NOTIFICATION (Popup lớn hơn, có tiêu đề) ====================

interface NotifyOptions {
  description?: string;
  duration?: number | null; // null = không tự đóng
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  onClick?: () => void;
  onClose?: () => void;
  key?: string;
  btn?: React.ReactNode;
}

const DEFAULT_PLACEMENT = 'topRight';

/**
 * Hiển thị notification thành công
 */
export const notifySuccess = (title: string, options?: NotifyOptions) => {
  notification.success({
    message: title,
    description: options?.description,
    duration: options?.duration ?? 4.5,
    placement: options?.placement ?? DEFAULT_PLACEMENT,
    onClick: options?.onClick,
    onClose: options?.onClose,
    key: options?.key,
    btn: options?.btn,
  });
};

/**
 * Hiển thị notification lỗi
 */
export const notifyError = (title: string, options?: NotifyOptions) => {
  notification.error({
    message: title,
    description: options?.description,
    duration: options?.duration ?? 6, // Error hiển thị lâu hơn
    placement: options?.placement ?? DEFAULT_PLACEMENT,
    onClick: options?.onClick,
    onClose: options?.onClose,
    key: options?.key,
    btn: options?.btn,
  });
};

/**
 * Hiển thị notification cảnh báo
 */
export const notifyWarning = (title: string, options?: NotifyOptions) => {
  notification.warning({
    message: title,
    description: options?.description,
    duration: options?.duration ?? 5,
    placement: options?.placement ?? DEFAULT_PLACEMENT,
    onClick: options?.onClick,
    onClose: options?.onClose,
    key: options?.key,
    btn: options?.btn,
  });
};

/**
 * Hiển thị notification thông tin
 */
export const notifyInfo = (title: string, options?: NotifyOptions) => {
  notification.info({
    message: title,
    description: options?.description,
    duration: options?.duration ?? 4.5,
    placement: options?.placement ?? DEFAULT_PLACEMENT,
    onClick: options?.onClick,
    onClose: options?.onClose,
    key: options?.key,
    btn: options?.btn,
  });
};

/**
 * Đóng notification theo key
 */
export const notifyDestroy = (key?: string) => {
  if (key) {
    notification.destroy(key);
  } else {
    notification.destroy();
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Hiển thị toast lỗi từ API response
 */
export const toastApiError = (error: any, fallbackMessage = 'Đã có lỗi xảy ra') => {
  const errorMessage = 
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage;
  
  toastError(errorMessage);
};

/**
 * Hiển thị toast lỗi validation form
 */
export const toastValidationError = (message = 'Vui lòng điền đầy đủ thông tin bắt buộc!') => {
  toastError(message);
};

/**
 * Hiển thị toast khi thao tác CRUD thành công
 */
export const toastCrudSuccess = (action: 'create' | 'update' | 'delete', entity: string) => {
  const messages = {
    create: `Tạo ${entity} thành công!`,
    update: `Cập nhật ${entity} thành công!`,
    delete: `Xóa ${entity} thành công!`,
  };
  toastSuccess(messages[action]);
};

/**
 * Hiển thị toast khi thao tác CRUD thất bại
 */
export const toastCrudError = (action: 'create' | 'update' | 'delete', entity: string, error?: any) => {
  const messages = {
    create: `Tạo ${entity} thất bại`,
    update: `Cập nhật ${entity} thất bại`,
    delete: `Xóa ${entity} thất bại`,
  };
  
  const errorDetail = error?.response?.data?.message || error?.message;
  const fullMessage = errorDetail 
    ? `${messages[action]}: ${errorDetail}`
    : messages[action];
  
  toastError(fullMessage);
};

// ==================== TOAST OBJECT (Alternative API) ====================

/**
 * Toast object với các methods tiện dụng
 * Usage: toast.success('Message'), toast.error('Message')
 */
export const toast = {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  loading: toastLoading,
  destroy: toastDestroy,
  
  // API helpers
  apiError: toastApiError,
  validationError: toastValidationError,
  crudSuccess: toastCrudSuccess,
  crudError: toastCrudError,
};

/**
 * Notify object với các methods tiện dụng
 * Usage: notify.success('Title', { description: 'Detail' })
 */
export const notify = {
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
  destroy: notifyDestroy,
};

export default toast;
