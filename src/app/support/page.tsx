import React from "react";
import { Terminal, FileCode2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Pusat Bantuan & Arsitektur Sistem</h2>
        <p className="text-sm text-slate-500 mt-1">
          Panduan teknis pengoperasian dan pengembangan sistem informasi e-clinic-coda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="rounded-2xl border-slate-100 shadow-xs">
          <CardHeader className="flex flex-row items-center space-x-3 pb-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Terminal className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">Lingkungan Docker</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>Jalankan container pengembangan dengan perintah:</p>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono">
              docker compose up -d
            </pre>
            <p className="text-xs text-slate-500">
              Layanan mencakup Next.js App dan MySQL 8.0 dengan volume persisten.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 shadow-xs">
          <CardHeader className="flex flex-row items-center space-x-3 pb-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <FileCode2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">Prinsip SIMKhanza</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>
              Sistem tidak melakukan perubahan skema destruktif, <code>db push</code>,
              atau alter table otomatis pada database produksi SIMKhanza.
            </p>
            <p className="text-xs text-slate-500">
              Seluruh migrasi dan integrasi diverifikasi terlebih dahulu melalui skema SQL sanitasi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
