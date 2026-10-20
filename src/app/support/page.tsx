import React from "react";
import { ShieldCheck, HeartHandshake } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center space-x-3 pb-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">Keamanan & Integritas Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              Seluruh data rekam medis pasien, antrean poli, dan transaksi farmasi diproses
              dengan standar privasi dan enkripsi data yang aman.
            </p>
            <p className="text-xs text-slate-500">
              Pencatatan riwayat transaksi dan audit trail aktif untuk setiap perubahan data penting.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center space-x-3 pb-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">Panduan Operasional Klinik</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              Aplikasi ini dirancang untuk kemudahan operasional harian petugas pendaftaran, perawat,
              dokter poliklinik, dan kasir farmasi apotek.
            </p>
            <p className="text-xs text-slate-500">
              Jika membutuhkan bantuan teknis atau pelaporan kendala sistem, hubungi administrator IT klinik.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
