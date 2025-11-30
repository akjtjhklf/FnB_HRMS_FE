import {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenManager } from "./token-manager";
import { AUTH_CONFIG } from "../constants";

type RefreshTokenResponse = ResponseAPI<{
  token: string;
  refresh_token: string;
}>;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

type QueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

async function refreshAccessToken(axiosInstance: AxiosInstance) {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  console.log("🔄 [Refresh Token] Starting refresh process...");

  try {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      AUTH_CONFIG.REFRESH_TOKEN_ENDPOINT, 
      { refresh_token: refreshToken }
    );

    const { token, refresh_token } = response.data.data;

    tokenManager.setTokens(token, refresh_token);

    console.log("✅ [Refresh Token] Successfully refreshed token");

    return true;
  } catch (error) {
    console.error("❌ [Refresh Token] Failed:", error);
    tokenManager.clearTokens();
    throw error;
  }
}

async function logout(axiosInstance: AxiosInstance) {
  try {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      await axiosInstance.post(AUTH_CONFIG.LOGOUT_ENDPOINT);
    }
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    tokenManager.clearTokens();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

export async function handleTokenRefresh(
  originalRequest: RetryableRequestConfig,
  axiosInstance: AxiosInstance
): Promise<unknown> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(() => {
      const newAccessToken = tokenManager.getAccessToken();
      if (newAccessToken) {
        originalRequest.headers.set(
          "Authorization",
          `Bearer ${newAccessToken}`
        );
      }
      return axiosInstance(originalRequest);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    await refreshAccessToken(axiosInstance);
    processQueue(null);

    const newAccessToken = tokenManager.getAccessToken();
    if (newAccessToken) {
      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
    }

    return axiosInstance(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError);
    await logout(axiosInstance);
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
}
