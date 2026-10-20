import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { Users } from "lucide-react";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const config = await clinicConfigService.getClinicProfile();

  return (
    <AppShell clinicName={config.namaKlinik} pageTitle="Patients">
      <div className="py-6">
        <EmptyState
          icon={<Users className="h-6 w-6 text-blue-600" />}
          title="Modul Registrasi & Master Pasien"
          description="Pencarian rekam medis, pembuatan nomor RM baru, dan sinkronisasi tabel 'pasien' SIMKhanza disiapkan untuk Tahap 2 pengembangan."
        />
      </div>
    </AppShell>
  );
}
