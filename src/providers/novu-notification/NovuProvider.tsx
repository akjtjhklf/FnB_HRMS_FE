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
  if (!user?.id) return <>{children}</>;

  return (
    <NovuProvider
      subscriberId={String(user.id)}
      applicationIdentifier="VoHt917w84Br"
    >
      {children}
    </NovuProvider>
  );
};