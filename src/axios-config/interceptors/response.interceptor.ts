import {
  type AxiosError,
  type AxiosInstance,
  type AxiosInterceptorManager,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

import { AUTH_CONFIG } from "../constants";
import { createErrorResponse } from "../utils/api-error-response";
import { handleTokenRefresh } from "../utils/refresh-token-handler";
import { handleRetryLogic, shouldRetry } from "../utils/retry-handler";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

export const responseInterceptor = (
  response: AxiosInterceptorManager<AxiosResponse>,
  axiosInstance: AxiosInstance
) => {
  response.use(
    (data: AxiosResponse) => {
      return data;
    },
    async (error: AxiosError<BaseResponseAPI<any>>) => {
      const originalRequest = error.config as RetryableRequestConfig;

      if (!originalRequest) {
        return Promise.reject(createErrorResponse(error));
      }

      const isLoginRequest = originalRequest.url?.includes(
        AUTH_CONFIG.LOGIN_ENDPOINT
      );
      const isRefreshRequest = originalRequest.url?.includes(
        AUTH_CONFIG.REFRESH_TOKEN_ENDPOINT
      );
      const isLogoutRequest = originalRequest.url?.includes(
        AUTH_CONFIG.LOGOUT_ENDPOINT
      );

      // Handle 401 - Unauthorized
      if (error.response?.status === 401) {
        if (isLoginRequest) {
          const message = Array.isArray(error.response.data?.message)
            ? error.response.data.message.join(", ")
            : error.response.data?.message || "Đăng nhập thất bại";
          toast.error(message);
          return Promise.reject(createErrorResponse(error));
        }

        if (isRefreshRequest) {
          return Promise.reject(createErrorResponse(error));
        }

        if (!originalRequest._retry) {
          try {
            return await handleTokenRefresh(originalRequest, axiosInstance);
          } catch (_refreshError) {
            console.error("Refresh token failed:", _refreshError);
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            return Promise.reject(createErrorResponse(error));
          }
        }
      }

      // Handle retry logic for 5xx errors
      if (shouldRetry(error)) {
        if (isLogoutRequest) {
          return Promise.reject(createErrorResponse(error));
        }
        return handleRetryLogic(error, originalRequest, axiosInstance);
      }

      // Handle other status codes
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 403) {
        toast.error("Bạn không có quyền thực hiện hành động này!");
        console.warn(
          "Access forbidden - insufficient permissions",
          errorData
        );
      } else if (status === 404) {
        toast.error("Không tìm thấy tài nguyên yêu cầu!");
      } else if (status === 422) {
        const message = Array.isArray(errorData?.message)
          ? errorData.message.join(", ")
          : errorData?.message || "Dữ liệu không hợp lệ!";
        toast.error(message);
      } else if (status === 500) {
        toast.error("Lỗi máy chủ. Vui lòng thử lại sau!");
      } else if (error.code === "ECONNABORTED") {
        toast.error("Yêu cầu quá thời gian. Vui lòng thử lại!");
      } else if (!error.response) {
        toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối!");
      } else {
        const message = Array.isArray(errorData?.message)
          ? errorData.message.join(", ")
          : errorData?.message || "Có lỗi xảy ra!";
        toast.error(message);
      }

      return Promise.reject(createErrorResponse(error));
    }
  );
};
