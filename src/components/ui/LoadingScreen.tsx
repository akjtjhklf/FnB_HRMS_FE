import React from "react";
import { Spin } from "antd";

export const LoadingScreen: React.FC<{ message?: string }> = ({ 
  message = "Đang tải..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  );
};
