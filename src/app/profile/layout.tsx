"use client";

import React, { useState, useCallback } from "react";
import { ModernSidebar } from "@/components/layout";
import { Header } from "@/components/header";
import { Menu } from "lucide-react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileClose = useCallback(() => setMobileOpen(false), []);
  const handleMobileOpen = useCallback(() => setMobileOpen(true), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ModernSidebar 
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      
      {/* Main Content */}
      <div className="lg:ml-24 transition-all duration-300">
        {/* Header */}
        <div className="relative">
          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileOpen}
            className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
          
          <Header />
        </div>
        
        {/* Page Content */}
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
