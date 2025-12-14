import { useCallback } from 'react';
import { 
  toast, 
  notify,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  toastLoading,
  toastDestroy,
  toastApiError,
  toastValidationError,
  toastCrudSuccess,
  toastCrudError,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyDestroy,
} from '@/utils/toast';

/**
 * Hook useToast - Quản lý toast notifications
 * 
 * @example
 * ```tsx
 * const { toast, notify } = useToast();
 * 
 * // Toast messages (nhỏ gọn)
 * toast.success('Thành công!');
 * toast.error('Có lỗi xảy ra');
 * toast.warning('Cảnh báo');
 * toast.info('Thông tin');
 * 
 * // Notifications (có tiêu đề + mô tả)
 * notify.success('Thành công', { description: 'Chi tiết...' });
 * notify.error('Lỗi', { description: 'Chi tiết lỗi...' });
 * 
 * // API error handling
 * toast.apiError(error, 'Fallback message');
 * 
 * // Validation error
 * toast.validationError('Vui lòng điền đầy đủ thông tin!');
 * 
 * // CRUD operations
 * toast.crudSuccess('create', 'nhân viên');
 * toast.crudError('update', 'nhân viên', error);
 * ```
 */
export const useToast = () => {
  // Toast methods
  const showSuccess = useCallback((content: string, options?: Parameters<typeof toastSuccess>[1]) => {
    toastSuccess(content, options);
  }, []);

  const showError = useCallback((content: string, options?: Parameters<typeof toastError>[1]) => {
    toastError(content, options);
  }, []);

  const showWarning = useCallback((content: string, options?: Parameters<typeof toastWarning>[1]) => {
    toastWarning(content, options);
  }, []);

  const showInfo = useCallback((content: string, options?: Parameters<typeof toastInfo>[1]) => {
    toastInfo(content, options);
  }, []);

  const showLoading = useCallback((content: string, key?: string) => {
    toastLoading(content, key);
  }, []);

  const hideToast = useCallback((key?: string) => {
    toastDestroy(key);
  }, []);

  // API Error handler
  const handleApiError = useCallback((error: any, fallbackMessage?: string) => {
    toastApiError(error, fallbackMessage);
  }, []);

  // Validation Error
  const handleValidationError = useCallback((message?: string) => {
    toastValidationError(message);
  }, []);

  // CRUD Success
  const handleCrudSuccess = useCallback((action: 'create' | 'update' | 'delete', entity: string) => {
    toastCrudSuccess(action, entity);
  }, []);

  // CRUD Error
  const handleCrudError = useCallback((action: 'create' | 'update' | 'delete', entity: string, error?: any) => {
    toastCrudError(action, entity, error);
  }, []);

  // Notification methods
  const showNotifySuccess = useCallback((title: string, options?: Parameters<typeof notifySuccess>[1]) => {
    notifySuccess(title, options);
  }, []);

  const showNotifyError = useCallback((title: string, options?: Parameters<typeof notifyError>[1]) => {
    notifyError(title, options);
  }, []);

  const showNotifyWarning = useCallback((title: string, options?: Parameters<typeof notifyWarning>[1]) => {
    notifyWarning(title, options);
  }, []);

  const showNotifyInfo = useCallback((title: string, options?: Parameters<typeof notifyInfo>[1]) => {
    notifyInfo(title, options);
  }, []);

  const hideNotify = useCallback((key?: string) => {
    notifyDestroy(key);
  }, []);

  return {
    // Direct toast object
    toast,
    notify,
    
    // Individual toast methods
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    destroy: hideToast,
    
    // Helper methods
    apiError: handleApiError,
    validationError: handleValidationError,
    crudSuccess: handleCrudSuccess,
    crudError: handleCrudError,
    
    // Notification methods
    notifySuccess: showNotifySuccess,
    notifyError: showNotifyError,
    notifyWarning: showNotifyWarning,
    notifyInfo: showNotifyInfo,
    notifyDestroy: hideNotify,
  };
};

export default useToast;
