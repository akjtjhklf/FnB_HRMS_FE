"use client";

import { Suspense, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticated, useGetIdentity } from "@refinedev/core";

export default function IndexPage() {
  return (
    <Suspense>
      <Authenticated key="home-page" fallback={<div>Đang tải...</div>}>
        <RedirectBasedOnRole />
      </Authenticated>
    </Suspense>
  );
}

function RedirectBasedOnRole() {
  const router = useRouter();
  const { data: identity, isLoading } = useGetIdentity<{
    id: string;
    role?: string | { name?: string };
  }>();

  // Lấy role từ identity (có thể là string hoặc object)
  const userRole = useMemo(() => {
    let roleName: string | undefined;
    
    if (typeof identity?.role === "string") {
      roleName = identity.role;
    } else if (typeof identity?.role === "object" && identity?.role?.name) {
      roleName = identity.role.name;
    }
    
    return roleName?.toLowerCase();
  }, [identity?.role]);

  useEffect(() => {
    if (isLoading) return;

    // Admin/Administrator và Manager → Dashboard
    // Employee → Profile
    if (userRole === "admin" || userRole === "administrator" || userRole === "manager") {
      router.replace("/dashboard");
    } else {
      router.replace("/profile");
    }
  }, [router, userRole, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
