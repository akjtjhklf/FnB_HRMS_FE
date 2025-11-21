"use client";

import { AuthProvider } from "@refinedev/core";
import axiosClient from "@/axios-config/apiClient";
import { tokenManager } from "@/axios-config/utils/token-manager";
import { User, UserIdentity } from "../../types/auth";
import { get, post } from "@axios-config";

export const authProviderClient: AuthProvider = {
  login: async ({ email, password, username }) => {
    try {
      const loginIdentifier = email || username;
      if (!loginIdentifier || !password) {
        throw new Error("Email/Username và password là bắt buộc");
      }

      // Gọi API login của HRMS_BE
      const response = await axiosClient.post<
        ResponseAPI<{
          token: string;
          refresh_token: string;
          user?: User;
        }>
      >("/auth/login", {
        email: loginIdentifier,
        password,
      });

      const result = response.data?.data;

      if (result?.token && result?.refresh_token) {
        // Lưu tokens (BE trả về "token" chứ không phải "access_token")
        tokenManager.setTokens(result.token, result.refresh_token);

        // Lưu user info
        if (result.user) {
          localStorage.setItem("user_ifo", JSON.stringify(result.user));
        }

        return {
          success: true,
          redirectTo: "/",
        };
      } else {
        throw new Error("Thông tin đăng nhập không chính xác");
      }
    } catch (error: any) {
      console.error("Login error:", error?.response?.data || error?.message);
      throw new Error(
        error?.response?.data?.message || error?.message || "Đăng nhập thất bại"
      );
    }
  },

  register: async ({
    email,
    password,
    first_name,
    last_name,
    ...otherFields
  }) => {
    try {
      if (!email || !password) {
        throw new Error("Email và password là bắt buộc");
      }

      const response = await post<
        ResponseAPI<User>,
        { email: string; password: string; first_name?: string; last_name?: string; [key: string]: any }
      >(
        "/auth/register",
        {
          email,
          password,
          first_name,
          last_name,
          ...otherFields,
        }
      );

      const data = response.data;

      if (response.is_success) {
        return {
          success: true,
          redirectTo: "/login",
        };
      }

      throw new Error(
        Array.isArray(response?.message)
          ? response.message.join(", ")
          : response?.message || "Đăng ký thất bại"
      );
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(
        error?.response?.data?.message || error?.message || "Đăng ký thất bại"
      );
    }
  },

  logout: async () => {
    try {
      // Gọi API logout của HRMS_BE
      if (tokenManager.isAuthenticated()) {
        try {
          await post("/auth/logout");
        } catch (error) {
          console.error("Logout API error:", error);
        }
      }

      // Xóa tokens và user info
      tokenManager.clearTokens();

      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: true,
        redirectTo: "/login",
      };
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      if (!email) {
        throw new Error("Email bắt buộc");
      }

      const response = await post<ResponseAPI<any>, { email: string }>(
        "/auth/forgot-password",
        {
          email,
        }
      );
      const data = response.data;

      if (data.is_success) {
        return { success: true };
      }

      throw new Error(
        Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Quên mật khẩu thất bại"
      );
    } catch (error: any) {
      console.error("Forgot password error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Quên mật khẩu thất bại"
      );
    }
  },

  updatePassword: async ({ token, password }) => {
    try {
      if (!token || !password) {
        throw new Error("Password bắt buộc");
      }

      const response = await post<
        ResponseAPI<any>,
        { token: string; password: string }
      >("/auth/reset-password", {
        token,
        password,
      });

      const data = response.data;

      if (data.is_success) {
        return { success: true };
      }

      throw new Error(
        Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Đổi mật khẩu thất bại"
      );
    } catch (error: any) {
      console.error("Update password error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Đổi mật khẩu thất bại"
      );
    }
  },

  check: async () => {
    try {
      if (!tokenManager.isAuthenticated()) {
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

      // Kiểm tra token với BE
      const res = await get<ResponseAPI<User>>("/users/me");

      const user = res.data;
      if (user && user.id) {
        return { authenticated: true };
      }

      return {
        authenticated: false,
        redirectTo: "/login",
      };
    } catch {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    try {
      if (!tokenManager.isAuthenticated()) return null;

      const res = await get<ResponseAPI<UserIdentity>>("/users/me");

      const roles = [res?.data.role?.name];
      return roles || [];
    } catch {
      return [];
    }
  },

  getIdentity: async () => {
    try {
      if (!tokenManager.isAuthenticated()) {
        throw new Error("No token found");
      }

      // Call /users/me endpoint which now returns full identity
      // Including: User + Employee + Role + Policies + Permissions
      const response = await axiosClient.get<ResponseAPI<User>>("/users/me");

      const identity = response.data?.data;
      if (!identity) {
        throw new Error("No user data found");
      }

      // Backend already returns full identity with:
      // - employee: Employee object (if linked)
      // - role: RoleWithPermissions (với policies và permissions)
      // - permissions: Permission[] (flattened từ role → policies → permissions)
      // - is_admin: boolean
      // - can_access_app: boolean
      return identity;
    } catch (error) {
      console.error("Get identity error:", error);
      throw error;
    }
  },

  onError: async (error: any) => {
    console.error("AuthProvider error:", error);
    return { error };
  },
};
