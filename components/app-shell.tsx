"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { UserRole } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}

export function AppShell({ children, role, userName }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} userName={userName} />
      <div className="lg:ml-72">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 lg:p-10 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
