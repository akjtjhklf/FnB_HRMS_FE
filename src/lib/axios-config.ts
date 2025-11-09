import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { CORE } from "@/configs";
import { CookieUtil } from "@/utils/cookieUtils";
import { toast } from "sonner";

// Tạo axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: CORE.API_URL || "http://localhost:4000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor - Tự động thêm token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = CookieUtil.get("ac_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý response và error
axiosInstance.interceptors.response.use(
  (response) => {
    // BE trả về: { statusCode, message, data, is_success, ... }
    const data = response.data as BaseResponseAPI<any>;
    
    // Chỉ lấy phần data để dễ xử lý
    return {
      ...response,
      data: data,
    };
  },
  (error: AxiosError<BaseResponseAPI<any>>) => {
    const errorData = error.response?.data;
    const status = error.response?.status;

    // Xử lý các loại lỗi
    if (status === 401) {
      // Unauthorized - Token hết hạn hoặc không hợp lệ
      CookieUtil.remove("ac_token");
      CookieUtil.remove("rf_token");
      toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
      
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      // Forbidden - Không có quyền truy cập
      toast.error("Bạn không có quyền thực hiện hành động này!");
    } else if (status === 404) {
      // Not Found
      toast.error("Không tìm thấy tài nguyên yêu cầu!");
    } else if (status === 422) {
      // Validation Error
      const message = Array.isArray(errorData?.message) 
        ? errorData.message.join(", ") 
        : errorData?.message || "Dữ liệu không hợp lệ!";
      toast.error(message);
    } else if (status === 500) {
      // Internal Server Error
      toast.error("Lỗi máy chủ. Vui lòng thử lại sau!");
    } else if (error.code === "ECONNABORTED") {
      // Timeout
      toast.error("Yêu cầu quá thời gian. Vui lòng thử lại!");
    } else if (!error.response) {
      // Network Error
      toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối!");
    } else {
      // Other errors
      const message = Array.isArray(errorData?.message)
        ? errorData.message.join(", ")
        : errorData?.message || "Có lỗi xảy ra!";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
