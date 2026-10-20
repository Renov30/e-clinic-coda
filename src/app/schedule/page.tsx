import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { Calendar } from "lucide-react";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const config = await clinicConfigService.getClinicProfile();

  return (
    <AppShell clinicName={config.namaKlinik} pageTitle="Schedule">
      <div className="py-6">
        <EmptyState
          icon={<Calendar className="h-6 w-6 text-blue-600" />}
          title="Modul Jadwal Dokter & Poliklinik"
          description="Jadwal praktik dokter akan disinkronkan dengan data jadwal poliklinik SIMKhanza pada tahap integrasi berikutnya."
        />
      </div>
    </AppShell>
  );
}
