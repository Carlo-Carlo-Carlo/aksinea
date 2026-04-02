"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";

interface DashboardShellProps {
  userName: string;
  cabinetName: string;
  children: React.ReactNode;
}

export function DashboardShell({
  userName,
  cabinetName,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        userName={userName}
        cabinetName={cabinetName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 -ml-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold text-primary-700">Aksinea</span>
        </div>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
