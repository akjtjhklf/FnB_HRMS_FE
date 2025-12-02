// components/providers/NovuProvider.tsx
"use client";

// SỬA: Import từ @novu/notification-center thay vì @novu/react hay @novu/nextjs
import { NovuProvider } from "@novu/notification-center"; 
import React from "react";

export const AppNovuProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) => {
  if (!user?.id) return <>{children}</>;

  return (
    <NovuProvider
      subscriberId={String(user.id)}
      applicationIdentifier="VoHt917w84Br"
      // Các tùy chọn khác nếu cần
      // styles={{}} // Có thể để trống nếu làm headless hoàn toàn
    >
      {children}
    </NovuProvider>
  );
};