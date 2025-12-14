"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetIdentity } from "@refinedev/core";
import { Result, Spin } from "antd";

type UserRole = "admin" | "manager" | "employee";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component bảo vệ route theo role
 * - Nếu user không có quyền, hiển thị fallback hoặc redirect
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  redirectTo,
}) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: identity, isLoading } = useGetIdentity<{
    id: string;
    role?: string | { name?: string };
    employee_id?: any;
  }>();

  const userRole = useMemo((): UserRole => {
    let roleName: string | undefined;
    
    // Role có thể là string hoặc object { name: string }
    if (typeof identity?.role === "string") {
      roleName = identity.role;
    } else if (typeof identity?.role === "object" && identity?.role?.name) {
      roleName = identity.role.name;
    }
    
    const role = roleName?.toLowerCase();
    // Match các variants của admin: admin, administrator
    if (role === "admin" || role === "administrator") return "admin";
    if (role === "manager") return "manager";
    return "employee";
  }, [identity?.role]);

  const hasAccess = useMemo(() => {
    return allowedRoles.includes(userRole);
  }, [allowedRoles, userRole]);

  // Handle redirect in useEffect to avoid setState during render
  useEffect(() => {
    if (!isLoading && !hasAccess && redirectTo && !isRedirecting) {
      setIsRedirecting(true);
      router.replace(redirectTo);
    }
  }, [isLoading, hasAccess, redirectTo, router, isRedirecting]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  // No access - redirecting
  if (!hasAccess && redirectTo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  // No access - show fallback or denied
  if (!hasAccess) {
    // Show fallback or default access denied
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle="Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ."
        extra={
          <button
            onClick={() => router.push("/profile")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Về trang cá nhân
          </button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
