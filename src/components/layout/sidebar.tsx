"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Stethoscope,
  Pill,
  UserCog,
  Settings,
  HelpCircle,
  Menu,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  clinicName?: string;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Registrasi Pasien", href: "/patients", icon: Users },
  { name: "Antrean & Jadwal", href: "/appointments", icon: Clock },
  { name: "Penjualan Obat Luar", href: "/pharmacy", icon: Pill },
  { name: "Dokter & Poliklinik", href: "/doctors", icon: Stethoscope },
  { name: "Jadwal Praktik", href: "/schedule", icon: Calendar },
  { name: "Pengguna & Akses", href: "/users", icon: UserCog },
];

const BOTTOM_ITEMS = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
];

export function Sidebar({ clinicName = "Smile360" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 select-none py-6 px-4 shrink-0",
        collapsed ? "w-20 items-center" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center mb-8 px-2",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <HeartPulse className="h-6 w-6 stroke-[2.2]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 leading-tight truncate max-w-[130px]">
                {clinicName}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                e-clinic-coda
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors",
            collapsed && "hidden"
          )}
          title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group",
                collapsed ? "justify-center p-3" : "px-3.5 py-2.5 space-x-3.5",
                isActive
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white stroke-[2.2]"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="pt-4 mt-auto border-t border-slate-100 space-y-1.5">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group",
                collapsed ? "justify-center p-3" : "px-3.5 py-2.5 space-x-3.5",
                isActive
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
