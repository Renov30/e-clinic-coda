import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppointmentTable } from "@/components/appointments/appointment-table";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Appointments | e-clinic-coda",
  description: "Daftar janji temu dan antrean kunjungan pasien",
};

export default async function AppointmentsPage() {
  const clinicConfig = await clinicConfigService.getClinicProfile();

  return (
    <AppShell
      clinicName={clinicConfig.namaKlinik || "Smile360"}
      pageTitle="Appointments"
    >
      <AppointmentTable />
    </AppShell>
  );
}
