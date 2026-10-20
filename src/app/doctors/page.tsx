import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { Stethoscope } from "lucide-react";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const config = await clinicConfigService.getClinicProfile();

  return (
    <AppShell clinicName={config.namaKlinik} pageTitle="Doctors">
      <div className="py-6">
        <EmptyState
          icon={<Stethoscope className="h-6 w-6 text-blue-600" />}
          title="Modul Dokter & Tenaga Medis"
          description="Daftar dokter, SIP, spesialisasi, dan hak akses tindakan klinik disiapkan sesuai pemetaan tabel 'dokter' SIMKhanza."
        />
      </div>
    </AppShell>
  );
}
