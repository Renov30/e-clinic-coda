import React from "react";
import { ClinicProfileForm } from "@/components/settings/clinic-profile-form";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan Instansi | e-clinic-coda",
  description: "Pengaturan profil instansi, kontak, dan identitas klinik",
};

export default async function SettingsPage() {
  const clinicConfig = await clinicConfigService.getClinicProfile();

  return <ClinicProfileForm initialConfig={clinicConfig} />;
}
