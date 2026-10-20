// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { clinicConfigService } from "@/modules/clinic-config/service";
import { patientRegistrationService } from "@/modules/patient-registration/service";
import { pharmacyService } from "@/modules/pharmacy/service";
import { checkDatabaseHealth } from "@/lib/db";
import {
  Users,
  CalendarCheck,
  Database,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Pill,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ==========================================
// 2. CONFIGURATION & METADATA
// ==========================================
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Klinik | e-clinic-coda",
  description: "Sistem Informasi Manajemen Klinik Terpadu e-clinic-coda",
};

// ==========================================
// 3. MAIN COMPONENT (DashboardPage)
// ==========================================
export default async function DashboardPage() {
  const [clinicConfig, dbHealth, patients, visitsToday, recentSales] = await Promise.all([
    clinicConfigService.getClinicProfile(),
    checkDatabaseHealth(),
    patientRegistrationService.searchPatients("", 100),
    patientRegistrationService.getVisitsToday(),
    pharmacyService.getRecentSales(10),
  ]);

  const totalOmsetObat = recentSales.reduce((acc, s) => acc + s.totalBiaya, 0);

  return (
    <div className="space-y-6">
      {/* Top welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100/60">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
              Sistem Aktif
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            {clinicConfig.namaKlinik}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Sistem informasi manajemen operasional klinik terpadu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/patients">
            <Button className="rounded-xl flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="h-4 w-4" />
              <span>Registrasi Kunjungan</span>
            </Button>
          </Link>
          <Link href="/pharmacy">
            <Button variant="outline" className="rounded-xl flex items-center space-x-2 border-slate-300">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              <span>Kasir Obat Luar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Kunjungan Rawat Jalan
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{visitsToday.length} Pasien</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Kunjungan terdaftar hari ini
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Database Pasien (RM)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{patients.length} Pasien</div>
            <p className="text-xs text-slate-500 mt-1">
              Total rekam medis terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Penjualan Obat Luar
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Pill className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{recentSales.length} Nota</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              {formatCurrency(totalOmsetObat)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Koneksi Server Data
            </CardTitle>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                dbHealth.connected
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <Database className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {dbHealth.connected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">
                    Sistem Terhubung
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700">
                    Siap Digunakan
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {dbHealth.connected ? "Layanan data siap dan aktif" : "Mode mandiri aktif"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Section: Registered Visits & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Pendaftaran Rawat Jalan Terkini
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Kunjungan dan antrean pasien rawat jalan hari ini
              </p>
            </div>
            <Link href="/patients">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 shadow-2xs">
                Buka Registrasi
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {visitsToday.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada pendaftaran pasien rawat jalan hari ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visitsToday.slice(0, 5).map((item) => (
                  <div
                    key={item.noRawat}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
                        {item.noReg}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.nmPasien}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.nmPoli} • {item.nmDokter}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-xs text-slate-500 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{item.jamReg}</span>
                      </div>
                      <StatusBadge status={item.stts} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clinic Identity & Roadmap Card */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Profil Instansi Aktif
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-medium text-slate-400 block">
                  Nama Klinik
                </span>
                <span className="font-semibold text-slate-800">
                  {clinicConfig.namaKlinik}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">
                  Alamat
                </span>
                <span className="text-slate-600 text-xs">
                  {clinicConfig.alamat}, {clinicConfig.kotaKabupaten}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">
                  Kontak & Izin
                </span>
                <span className="text-slate-600 text-xs">
                  {clinicConfig.telepon} • Izin: {clinicConfig.izinOperasional || "-"}
                </span>
              </div>
              <div className="pt-2">
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 shadow-2xs">
                    Ubah Pengaturan Instansi
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Status Modul Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-medium text-slate-800">1. Dashboard Klinik</span>
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Selesai</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-medium text-slate-800">2. Registrasi Pasien & Kunjungan</span>
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Selesai</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-medium text-slate-800">3. Penjualan Obat Luar</span>
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Selesai</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
