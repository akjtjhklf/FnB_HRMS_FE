import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { RefineContext } from "./RefineContext";
import "@refinedev/antd/dist/reset.css";
import "./globals.css";
import "@/lib/dayjs";

export const metadata: Metadata = {
  title: "Greasy Worm HRMS - Hệ thống Quản lý Nhân sự",
  description: "Giải pháp HRMS hoàn chỉnh để quản lý nhân viên, chấm công và bảng lương",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <html lang="vi">
      <body>
        <Suspense>
          <AntdRegistry>
            <RefineContext defaultMode={defaultMode}>
              {children}
            </RefineContext>
          </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}
