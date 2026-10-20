import React from "react";
import { PatientManagement } from "@/components/patients/patient-management";
import { patientRegistrationService } from "@/modules/patient-registration/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registrasi Pasien & Kunjungan | e-clinic-coda",
  description: "Manajemen data rekam medis pasien dan pendaftaran rawat jalan",
};

export default async function PatientsPage() {
  const [patients, visits, masterData] = await Promise.all([
    patientRegistrationService.searchPatients("", 50),
    patientRegistrationService.getVisitsToday(),
    patientRegistrationService.getMasterFormData(),
  ]);

  return (
    <PatientManagement
      initialPatients={patients}
      initialVisits={visits}
      doctors={masterData.doctors}
      poliklinik={masterData.poliklinik}
      penjab={masterData.penjab}
      nextNoRm={masterData.nextNoRm}
    />
  );
}
