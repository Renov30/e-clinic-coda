"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Stethoscope,
  Pill,
  Package,
  UserCog,
  Settings,
  HelpCircle,
  HeartPulse,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSessionPayload } from "@/lib/auth/session";
import { isRouteAllowed } from "@/lib/auth/permissions";

interface SidebarProps {
  appName?: string;
  clinicName?: string;
  initialCollapsed?: boolean;
  currentUser?: UserSessionPayload | null;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Registrasi Pasien", href: "/patients", icon: Users },
  { name: "Antrean & Jadwal", href: "/appointments", icon: Clock },
  { name: "Penjualan Obat Luar", href: "/pharmacy", icon: Pill },
  { name: "Data Obat & Stok", href: "/medicines", icon: Package },
  { name: "Dokter & Poliklinik", href: "/doctors", icon: Stethoscope },
  { name: "Jadwal Praktik", href: "/schedule", icon: Calendar },
  { name: "Pengguna & Akses", href: "/users", icon: UserCog },
];

const BOTTOM_ITEMS = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
];

const STORAGE_KEY = "coda_sidebar_collapsed";

export function Sidebar({
  appName = "simitra",
  clinicName = "Smile360",
  initialCollapsed = false,
  currentUser,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  // Sinkronisasi perubahan across tabs jika ada
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setCollapsed(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
        document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Abaikan jika ada pembatasan cookie/storage pada lingkungan tertentu
      }
      return next;
    });
  };

  // Filter navigasi berdasarkan hak akses peran pengguna
  const userRole = currentUser?.role;
  const userPermissions = currentUser?.permissions;

  const visibleNavItems = useMemo(() => {
    if (!userRole) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => isRouteAllowed(userRole, item.href, userPermissions));
  }, [userRole, userPermissions]);

  const visibleBottomItems = useMemo(() => {
    if (!userRole) return BOTTOM_ITEMS;
    return BOTTOM_ITEMS.filter((item) => isRouteAllowed(userRole, item.href, userPermissions));
  }, [userRole, userPermissions]);

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
          "flex items-center mb-8 px-1 transition-all",
          collapsed ? "flex-col gap-3 justify-center" : "justify-between"
        )}
      >
        <Link href="/" className="flex items-center space-x-3 group" title={appName || clinicName}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <HeartPulse className="h-6 w-6 stroke-[2.2]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg text-slate-900 leading-tight truncate max-w-[130px]">
                {appName || "simitra"}
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 font-semibold">
                SIM Klinik CODA
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          aria-label={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 w-full">
        {visibleNavItems.map((item) => {
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
      <div className="pt-4 mt-auto border-t border-slate-100 space-y-1.5 w-full">
        {visibleBottomItems.map((item) => {
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
