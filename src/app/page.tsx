import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { clinicConfigService } from "@/modules/clinic-config/service";
import { checkDatabaseHealth } from "@/lib/db";
import {
  Users,
  CalendarCheck,
  Activity,
  Database,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Klinik | e-clinic-coda",
  description: "Sistem Informasi Manajemen Klinik Terpadu e-clinic-coda",
};

export default async function DashboardPage() {
  const [clinicConfig, dbHealth] = await Promise.all([
    clinicConfigService.getClinicProfile(),
    checkDatabaseHealth(),
  ]);

  return (
    <div className="space-y-8">
      {/* Top welcome banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100/60">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                Fase Fondasi
              </span>
              <span className="text-xs text-slate-500">
                Kompatibel SIMKhanza
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-2">
              Selamat datang di {clinicConfig.namaKlinik}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Sistem informasi manajemen klinik modern dan modular
              e-clinic-coda.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/appointments">
              <Button className="rounded-xl flex items-center space-x-2">
                <span>Buka Jadwal Kunjungan</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="rounded-2xl border-slate-100 shadow-xs hover:border-slate-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Janji Temu Hari Ini
              </CardTitle>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">9 Pasien</div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                7 Terkonfirmasi • 2 Dibatalkan
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 shadow-xs hover:border-slate-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Pasien Aktif
              </CardTitle>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">1,248</div>
              <p className="text-xs text-slate-500 mt-1">
                Data terintegrasi SIMKhanza
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 shadow-xs hover:border-slate-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Poli Aktif
              </CardTitle>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">4 Poli</div>
              <p className="text-xs text-slate-500 mt-1">
                Gigi, Umum, KIA, Farmasi
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 shadow-xs hover:border-slate-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Koneksi Database
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
                      MySQL Terhubung
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">
                      Siap (Docker Dev)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {dbHealth.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Section: Recent Appointments & Clinic Identity Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <Card className="lg:col-span-2 rounded-2xl border-slate-100 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Kunjungan Pasien Terkini
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesuai tampilan antrean dan janji temu klinik
                </p>
              </div>
              <Link href="/appointments">
                <Button variant="outline" size="sm" className="rounded-xl text-xs">
                  Lihat Semua
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[
                  {
                    name: "Riko Tanaka",
                    gender: "Female",
                    time: "9:30-10:30",
                    diagnosis: "Root Canal Treatment",
                    status: "Confirmed",
                  },
                  {
                    name: "Akiko Takahashi",
                    gender: "Male",
                    time: "13:00-14:00",
                    diagnosis: "Scaling",
                    status: "Confirmed",
                  },
                  {
                    name: "Hiroki Kimura",
                    gender: "Male",
                    time: "11:00-12:00",
                    diagnosis: "Consultation",
                    status: "Confirmed",
                  },
                  {
                    name: "Peter Nakamura",
                    gender: "Male",
                    time: "10:00-11:00",
                    diagnosis: "Consultation",
                    status: "Cancelled",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.diagnosis} • {item.gender}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{item.time}</span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinic Identity & Roadmap Card */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-slate-100 shadow-xs">
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
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                      Ubah Pengaturan Instansi
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 shadow-xs bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Rencana Pengembangan Modular
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                  <span className="font-medium text-slate-800">1. Dashboard Klinik</span>
                  <span className="text-emerald-600 font-semibold">Fondasi Siap</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                  <span className="font-medium text-slate-800">2. Registrasi Pasien & Kunjungan</span>
                  <span className="text-blue-600 font-semibold">Modul Berikutnya</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                  <span className="font-medium text-slate-800">3. Penjualan Obat Luar</span>
                  <span className="text-slate-400">Modul Tahap 3</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
