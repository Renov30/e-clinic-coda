import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClinicProfileForm } from "@/components/settings/clinic-profile-form";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan Instansi | e-clinic-coda",
  description: "Pengaturan profil instansi, kontak, dan identitas klinik",
};

export default async function SettingsPage() {
  const clinicConfig = await clinicConfigService.getClinicProfile();

  return (
    <AppShell
      clinicName={clinicConfig.namaKlinik || "Smile360"}
      pageTitle="Settings"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pengaturan Sistem & Instansi</h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola identitas instansi, konfigurasi database, dan preferensi operasional e-clinic-coda.
          </p>
        </div>

        <ClinicProfileForm initialConfig={clinicConfig} />
      </div>
    </AppShell>
  );
}
