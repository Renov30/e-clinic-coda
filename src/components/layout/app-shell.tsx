"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { UserSessionPayload } from "@/lib/auth/session";

interface AppShellProps {
  children: React.ReactNode;
  appName?: string;
  clinicName?: string;
  pageTitle?: string;
  currentUser?: UserSessionPayload | null;
  initialSidebarCollapsed?: boolean;
}

export function AppShell({
  children,
  appName = "simitra",
  clinicName = "Smile360",
  pageTitle,
  currentUser,
  initialSidebarCollapsed = false,
}: AppShellProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <div className="min-h-screen w-full bg-[#f8fafc]">{children}</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left Sidebar */}
      <Sidebar
        appName={appName}
        clinicName={clinicName}
        initialCollapsed={initialSidebarCollapsed}
        currentUser={currentUser}
      />

      {/* Right Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white min-w-0">
        <Header title={pageTitle} currentUser={currentUser} />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
