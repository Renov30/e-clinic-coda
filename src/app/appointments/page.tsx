import React from "react";
import { AppointmentTable } from "@/components/appointments/appointment-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Appointments | e-clinic-coda",
  description: "Daftar janji temu dan antrean kunjungan pasien",
};

export default function AppointmentsPage() {
  return <AppointmentTable />;
}
