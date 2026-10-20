import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AppointmentTable } from "@/components/appointments/appointment-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Appointments | e-clinic-coda",
  description: "Daftar janji temu dan antrean kunjungan pasien",
};

export default async function AppointmentsPage() {
  const session = await getSession();
  if (!session || session.role === "farmasi") {
    redirect("/");
  }

  return <AppointmentTable />;
}
