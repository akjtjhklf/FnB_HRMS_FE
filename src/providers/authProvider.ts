import { AuthProvider } from "@refinedev/core";
import apiClient from "@/lib/api-client";
import { LoginResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {

      // Real API call
      const { data } = await apiClient.post<LoginResponse>(`/auth/login`, {
        email,
        password,
      });

      if (data.success && data.data.token) {
        // Store auth data
        localStorage.setItem("auth_token", data.data.token);
        localStorage.setItem("refresh_token", data.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        return {
          success: true,
          redirectTo: "/dashboard",
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid credentials",
        },
      };
    } catch (error: any) {
    
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.response?.data?.message || "Login failed. Please check if backend is running.",
        },
      };
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
      logout: true,
    };
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role?.permissions || [];
      } catch (error) {
        console.error("Error parsing user data:", error);
        return [];
      }
    }

    return [];
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        const userData = JSON.parse(user);
        return {
          id: userData.id,
          name: userData.first_name
            ? `${userData.first_name} ${userData.last_name || ""}`.trim()
            : userData.email,
          email: userData.email,
          avatar: userData.avatar,
          role: userData.role,
        };
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }

    return null;
  },

  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    return { error };
  },
};
