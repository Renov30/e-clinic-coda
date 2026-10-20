import React from "react";
import { PatientManagement } from "@/components/patients/patient-management";
import { patientRegistrationService } from "@/modules/patient-registration/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registrasi Pasien & Kunjungan | e-clinic-coda",
  description: "Manajemen data rekam medis pasien dan pendaftaran rawat jalan SIMKhanza",
};

export default async function PatientsPage() {
  const [patients, visits, masterData] = await Promise.all([
    patientRegistrationService.searchPatients("", 50),
    patientRegistrationService.getVisitsToday(),
    patientRegistrationService.getMasterFormData(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Registrasi Pasien & Rawat Jalan
          </h2>
          <p className="text-sm text-slate-500">
            Pendaftaran pasien baru, pembuatan nomor rekam medis, dan antrean poli klinik.
          </p>
        </div>
      </div>

      <PatientManagement
        initialPatients={patients}
        initialVisits={visits}
        doctors={masterData.doctors}
        poliklinik={masterData.poliklinik}
        penjab={masterData.penjab}
        nextNoRm={masterData.nextNoRm}
      />
    </div>
  );
}
