import { patientRegistrationRepository, PatientRegistrationRepository } from "./repository";
import { Patient, CreatePatientDTO, VisitRegistration, CreateVisitDTO } from "./types";
import { patientSchema, visitSchema } from "@/lib/validations/patient-registration";
import { recordAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";

export class PatientRegistrationService {
  constructor(private repo: PatientRegistrationRepository = patientRegistrationRepository) {}

  async searchPatients(search?: string, limit = 50): Promise<Patient[]> {
    return await this.repo.getPatients(search, limit);
  }

  async getVisitsToday(dateStr?: string): Promise<VisitRegistration[]> {
    return await this.repo.getVisitsToday(dateStr);
  }

  async getMasterFormData() {
    const [doctors, poliklinik, penjab, nextNoRm] = await Promise.all([
      this.repo.getDoctors(),
      this.repo.getPoliklinik(),
      this.repo.getPenjab(),
      this.repo.getNextNoRm(),
    ]);
    return { doctors, poliklinik, penjab, nextNoRm };
  }

  async registerPatient(data: CreatePatientDTO): Promise<{
    success: boolean;
    data?: Patient;
    error?: string;
  }> {
    const validation = patientSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    try {
      const created = await this.repo.createPatient(validation.data);

      await recordAuditEvent({
        action: "REGISTER_NEW_PATIENT",
        resource: "PASIEN",
        resourceId: created.noRkmMedis,
        status: "SUCCESS",
        details: {
          noRkmMedis: created.noRkmMedis,
          nmPasien: created.nmPasien,
        },
      });

      return { success: true, data: created };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan pasien baru";
      logger.error("Error saat menyimpan pasien baru", { error: errorMsg });

      await recordAuditEvent({
        action: "REGISTER_NEW_PATIENT",
        resource: "PASIEN",
        status: "FAILURE",
        details: { error: errorMsg },
      });

      return { success: false, error: errorMsg };
    }
  }

  async registerVisit(data: CreateVisitDTO): Promise<{
    success: boolean;
    data?: VisitRegistration;
    error?: string;
  }> {
    const validation = visitSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    try {
      const created = await this.repo.createVisit(validation.data);

      await recordAuditEvent({
        action: "REGISTER_PATIENT_VISIT",
        resource: "REG_PERIKSA",
        resourceId: created.noRawat,
        status: "SUCCESS",
        details: {
          noRawat: created.noRawat,
          noReg: created.noReg,
          noRkmMedis: created.noRkmMedis,
          kdPoli: created.kdPoli,
        },
      });

      return { success: true, data: created };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal mendaftarkan kunjungan pasien";
      logger.error("Error saat mendaftarkan kunjungan pasien", { error: errorMsg });

      await recordAuditEvent({
        action: "REGISTER_PATIENT_VISIT",
        resource: "REG_PERIKSA",
        status: "FAILURE",
        details: { error: errorMsg },
      });

      return { success: false, error: errorMsg };
    }
  }
}

export const patientRegistrationService = new PatientRegistrationService();

