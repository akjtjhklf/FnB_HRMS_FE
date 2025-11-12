"use client";

import React from "react";
import { ThemedLayout, ThemedTitle } from "@refinedev/antd";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemedLayout
      Header={() => <Header />}
      Title={({ collapsed }: { collapsed: boolean }) => (
        <ThemedTitle
          collapsed={collapsed}
          text="HRMS"
          icon={
            <span style={{ fontSize: "24px" }}>🏢</span>
          }
        />
      )}
    >
      {children}
    </ThemedLayout>
  );
}
