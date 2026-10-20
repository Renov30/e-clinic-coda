"use client";

import React, { useState, useMemo, useTransition } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  UserCog,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserSessionPayload } from "@/lib/auth/session";
import { logoutAction } from "@/modules/users/actions";

interface HeaderProps {
  title?: string;
  doctorName?: string;
  currentUser?: UserSessionPayload | null;
}

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/patients": "Registrasi & Data Pasien",
  "/appointments": "Antrean & Janji Temu",
  "/pharmacy": "Penjualan Obat Luar",
  "/schedule": "Jadwal Praktik Dokter",
  "/doctors": "Dokter & Poliklinik",
  "/users": "Manajemen Pengguna & Hak Akses",
  "/settings": "Pengaturan Instansi",
  "/support": "Bantuan & Sistem",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  dokter: "Dokter Penanggung Jawab",
  pendaftaran: "Petugas Pendaftaran",
  farmasi: "Staf Farmasi",
};

export function Header({
  title,
  doctorName = "Dr. Shin Tamura",
  currentUser,
}: HeaderProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, startTransition] = useTransition();

  const pageTitle = useMemo(() => {
    if (title) return title;
    return ROUTE_TITLES[pathname] || "e-clinic-coda";
  }, [title, pathname]);

  const displayName = currentUser?.namaLengkap || doctorName;
  const displayRole = currentUser?.role
    ? ROLE_LABELS[currentUser.role] || currentUser.role
    : "Dokter Penanggung Jawab";

  const userInitials = useMemo(() => {
    return displayName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [displayName]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const confirmLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <header className="flex h-20 items-center justify-between px-8 border-b border-slate-200/80 bg-white shrink-0">
        {/* Title */}
        <div className="flex items-center min-w-[200px]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 transition-colors">
            {pageTitle}
          </h1>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-10 pl-11 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            {isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left hidden sm:flex">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {displayRole}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                  <p className="text-xs text-slate-500">{displayRole}</p>
                  {currentUser?.username && (
                    <p className="text-[11px] text-blue-600 font-mono">@{currentUser.username}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/users" className="flex items-center cursor-pointer">
                  <UserCog className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Manajemen Pengguna</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Pengaturan Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/api/health" target="_blank" className="flex items-center cursor-pointer">
                  <ShieldCheck className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Status Sistem & DB</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                onSelect={() => setIsLogoutDialogOpen(true)}
              >
                <LogOut className="mr-2 h-4 w-4 text-rose-600" />
                <span>Keluar dari Sistem</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Dialog Konfirmasi Logout Kustom */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Konfirmasi Keluar dari Sistem
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-1">
              Apakah Anda yakin ingin mengakhiri sesi kerja saat ini? Anda perlu memasukkan kredensial login kembali untuk mengakses sistem.
            </DialogDescription>
          </DialogHeader>

          {/* User Preview Card */}
          <div className="my-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden flex-1 text-left">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {displayRole}
                {currentUser?.username && (
                  <span className="font-mono text-slate-400 ml-1.5">
                    (@{currentUser.username})
                  </span>
                )}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutDialogOpen(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isLoggingOut}
              onClick={confirmLogout}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Mengeluarkan...
                </>
              ) : (
                "Ya, Keluar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
