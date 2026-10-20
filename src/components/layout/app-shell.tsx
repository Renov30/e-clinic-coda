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
    <div className="flex h-screen w-full bg-[#f1f3f6] p-4 lg:p-6 overflow-hidden">
      {/* Outer rounded card container (matching design reference) */}
      <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200/80">
        {/* Left Sidebar */}
        <Sidebar clinicName={clinicName} />

        {/* Right Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          <Header title={pageTitle} />
          <main className="flex-1 overflow-y-auto bg-white p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

