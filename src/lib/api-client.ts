import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (only on client side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle errors globally
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          break;
        case 403:
          toast.error("Bạn không có quyền truy cập tài nguyên này.");
          break;
        case 404:
          toast.error("Không tìm thấy tài nguyên yêu cầu.");
          break;
        case 422:
          // Validation errors
          const message = data.message || "Dữ liệu không hợp lệ.";
          toast.error(message);
          break;
        case 500:
          toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
          break;
        default:
          toast.error(data.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } else if (error.request) {
      // Request made but no response
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.");
    } else {
      // Error in request setup
      toast.error("Đã xảy ra lỗi không mong muốn.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions for common API calls
export const api = {
  get: <T = any>(url: string, config?: any) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  
  post: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  
  put: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
  
  delete: <T = any>(url: string, config?: any) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};
