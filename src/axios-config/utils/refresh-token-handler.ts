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

// Singleton promise for refresh - ensures only ONE refresh request at a time
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(axiosInstance: AxiosInstance): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  console.log("🔄 [Refresh Token] Starting refresh process...");
  console.log("🔑 [Refresh Token] Using token:", refreshToken.substring(0, 20) + "...");

  try {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      AUTH_CONFIG.REFRESH_TOKEN_ENDPOINT, 
      { refresh_token: refreshToken }
    );

    const { token, refresh_token } = response.data.data;

    console.log("📦 [Refresh Token] Got new tokens");
    console.log("🔑 [Refresh Token] New refresh_token:", refresh_token.substring(0, 20) + "...");

    tokenManager.setTokens(token, refresh_token);

    console.log("✅ [Refresh Token] Successfully refreshed and stored new tokens");

    return true;
  } catch (error) {
    console.error("❌ [Refresh Token] Failed:", error);
    tokenManager.clearTokens();
    throw error;
  }
}

// Get or create refresh promise - ensures single refresh
async function refreshAccessToken(axiosInstance: AxiosInstance): Promise<boolean> {
  // If already refreshing, return the existing promise
  if (refreshPromise) {
    console.log("🔄 [Refresh Token] Using existing refresh promise");
    return refreshPromise;
  }

  // Create new refresh promise
  refreshPromise = doRefresh(axiosInstance).finally(() => {
    // Clear promise after completion (success or failure)
    refreshPromise = null;
  });

  return refreshPromise;
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
  console.log(`🔐 [Auth] Token refresh needed for ${originalRequest.url}`);
  
  originalRequest._retry = true;

  try {
    // Wait for refresh (singleton promise ensures only one refresh at a time)
    await refreshAccessToken(axiosInstance);
    
    // Retry original request with new token
    const newAccessToken = tokenManager.getAccessToken();
    if (newAccessToken) {
      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
    }

    console.log(`🔄 [Auth] Retrying original request: ${originalRequest.url}`);
    return axiosInstance(originalRequest);
  } catch (refreshError) {
    console.error(`❌ [Auth] Refresh failed, logging out`);
    await logout(axiosInstance);
    throw refreshError;
  }
}
