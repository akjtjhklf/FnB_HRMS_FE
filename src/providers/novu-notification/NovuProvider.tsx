// components/providers/NovuProvider.tsx
"use client";

// Sử dụng @novu/react v3 với NovuProvider mới
import { NovuProvider } from "@novu/react"; 
import React from "react";

export const AppNovuProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) => {
  // Ưu tiên dùng employee.id làm subscriberId (khớp với BE khi gửi notification)
  // Fallback về user.id nếu không có employee
  const subscriberId = user?.employee?.id || user?.employee_id || user?.id;
  
  if (!subscriberId) return <>{children}</>;

  return (
    <NovuProvider
      subscriberId={String(subscriberId)}
      applicationIdentifier="VoHt917w84Br"
    >
      {children}
    </NovuProvider>
  );
};