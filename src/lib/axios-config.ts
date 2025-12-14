import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { CORE } from "@/configs";
import { CookieUtil } from "@/utils/cookieUtils";
import { toast } from "sonner";

// ==================== REFRESH TOKEN LOGIC ====================
// Biến để track trạng thái refresh token
let isRefreshing = false;
// Queue các request đang chờ refresh token hoàn thành
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

// Xử lý queue sau khi refresh xong
const processQueue = (error: any, token: string | null = null) => {
  console.log(`📤 [lib/axios] Processing ${failedQueue.length} queued requests`);
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Hàm refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = CookieUtil.get("rf_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("🔄 [lib/axios] Starting token refresh...");

    // Gọi API refresh token - KHÔNG dùng axiosInstance để tránh interceptor loop
    const response = await axios.post(
      `${CORE.API_URL || "http://localhost:4000/api"}/auth/refresh-token`,
      { refresh_token: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        timeout: 10000, // 10s timeout
      }
    );

    // Backend trả về: { success: true, data: { token, refresh_token } }
    const responseData = response.data?.data || response.data || {};
    const newAccessToken = responseData.token || responseData.access_token;
    const newRefreshToken = responseData.refresh_token;

    if (newAccessToken) {
      // Lưu token mới
      CookieUtil.set("ac_token", newAccessToken, 7); // 7 days
      if (newRefreshToken) {
        CookieUtil.set("rf_token", newRefreshToken, 30); // 30 days
      }
      console.log("✅ [lib/axios] Token refreshed successfully");
      return newAccessToken;
    }

    throw new Error("No access token in response");
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message;
    console.error("❌ [lib/axios] Failed to refresh token:", errorMsg);
    
    // Clear tokens if invalid
    if (errorMsg?.includes("Invalid") || error?.response?.status === 401) {
      CookieUtil.remove("ac_token");
      CookieUtil.remove("rf_token");
    }
    
    return null;
  }
};

// Logout và redirect
const forceLogout = () => {
  CookieUtil.remove("ac_token");
  CookieUtil.remove("rf_token");
  toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
  
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// ==================== AXIOS INSTANCE ====================
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
  async (error: AxiosError<BaseResponseAPI<any>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const errorData = error.response?.data;
    const status = error.response?.status;

    // ==================== HANDLE 401 WITH REFRESH TOKEN ====================
    if (status === 401 && !originalRequest._retry) {
      // Nếu là request đến /auth/refresh-token hoặc /auth/login thì không retry
      if (originalRequest.url?.includes("/auth/refresh-token") || originalRequest.url?.includes("/auth/login")) {
        forceLogout();
        return Promise.reject(error);
      }

      // Kiểm tra còn refresh token không
      const refreshToken = CookieUtil.get("rf_token");
      if (!refreshToken) {
        console.log("🚫 [lib/axios] No refresh token, forcing logout");
        forceLogout();
        return Promise.reject(error);
      }

      // Nếu đang refresh thì đợi trong queue
      if (isRefreshing) {
        console.log(`⏳ [lib/axios] Queuing request: ${originalRequest.url}`);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Bắt đầu refresh
      console.log(`🔐 [lib/axios] Starting refresh for: ${originalRequest.url}`);
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Refresh thành công - xử lý queue và retry request
          processQueue(null, newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          // Refresh thất bại
          processQueue(new Error("Refresh token failed"), null);
          forceLogout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ==================== HANDLE OTHER ERRORS ====================
    if (status === 403) {
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
    } else if (status !== 401) {
      // Other errors (skip 401 as it's already handled above)
      const message = Array.isArray(errorData?.message)
        ? errorData.message.join(", ")
        : errorData?.message || "Có lỗi xảy ra!";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
