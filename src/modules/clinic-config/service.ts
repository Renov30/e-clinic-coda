import { clinicConfigRepository, ClinicConfigRepository } from "./repository";
import { ClinicConfig, UpdateClinicConfigDTO } from "./types";
import { clinicProfileSchema } from "@/lib/validations/clinic-config";
import { recordAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";

export class ClinicConfigService {
  constructor(private repo: ClinicConfigRepository = clinicConfigRepository) {}

  async getClinicProfile(): Promise<ClinicConfig> {
    return await this.repo.getConfig();
  }

  async updateClinicProfile(data: UpdateClinicConfigDTO): Promise<{
    success: boolean;
    data?: ClinicConfig;
    error?: string;
  }> {
    const validation = clinicProfileSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = validation.error.issues.map((i) => i.message).join(", ");
      logger.warn("Validasi konfigurasi klinik gagal", { issues: validation.error.issues });
      return { success: false, error: errorMessage };
    }

    try {
      const updated = await this.repo.updateConfig(validation.data);

      await recordAuditEvent({
        action: "UPDATE_CLINIC_PROFILE",
        resource: "CLINIC_CONFIG",
        status: "SUCCESS",
        details: {
          namaKlinik: updated.namaKlinik,
          telepon: updated.telepon,
        },
      });

      return { success: true, data: updated };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui konfigurasi klinik";
      logger.error("Error updating clinic profile in service", { error: errorMsg });

      await recordAuditEvent({
        action: "UPDATE_CLINIC_PROFILE",
        resource: "CLINIC_CONFIG",
        status: "FAILURE",
        details: { error: errorMsg },
      });

      return { success: false, error: errorMsg };
    }
  }
}

export const clinicConfigService = new ClinicConfigService();

