"use client";

import React from "react";
import { Construction } from "lucide-react";

export default function ChangeRequestsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100 m-4">
      <div className="bg-yellow-50 p-6 rounded-full mb-6">
        <Construction className="w-12 h-12 text-yellow-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">
        Tính năng đang phát triển
      </h1>
      <p className="text-gray-500 max-w-md leading-relaxed">
        Module <span className="font-semibold text-gray-700">Quản lý Yêu cầu Thay đổi</span> đang được đội ngũ kỹ thuật xây dựng và hoàn thiện.
        <br />
        Vui lòng quay lại sau trong các bản cập nhật tiếp theo.
      </p>
      <div className="mt-8 px-4 py-2 bg-gray-50 rounded-md text-xs text-gray-400 font-mono">
        Status: WORK_IN_PROGRESS
      </div>
    </div>
  );
}
