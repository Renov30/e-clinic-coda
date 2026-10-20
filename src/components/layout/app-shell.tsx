"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
  clinicName?: string;
  pageTitle?: string;
}

export function AppShell({
  children,
  clinicName = "Smile360",
  pageTitle,
}: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left Sidebar */}
      <Sidebar clinicName={clinicName} />

      {/* Right Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white min-w-0">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
