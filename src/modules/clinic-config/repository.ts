import { query } from "@/lib/db";
import { SIMKHANZA_TABLES, SimKhanzaSettingRow, mapSimKhanzaSettingToProfile } from "@/lib/db/simkhanza-map";
import { DEFAULT_CLINIC_PROFILE } from "@/config/clinic-default";
import { ClinicConfig, UpdateClinicConfigDTO } from "./types";
import { logger } from "@/lib/logger";

// Fallback runtime cache jika database belum di-seed atau offline
let inMemoryConfig: ClinicConfig = { ...DEFAULT_CLINIC_PROFILE };

export class ClinicConfigRepository {
  async getConfig(): Promise<ClinicConfig> {
    try {
      // Coba ambil dari tabel setting SIMKhanza
      const rows = await query<SimKhanzaSettingRow>(
        `SELECT nama_instansi, alamat_instansi, kabupaten, propinsi, kontak, email, kode_ppk 
         FROM ${SIMKHANZA_TABLES.SETTING} 
         LIMIT 1`
      );

      if (rows && rows.length > 0) {
        const row = rows[0];
        const mapped = mapSimKhanzaSettingToProfile(row);
        inMemoryConfig = {
          ...inMemoryConfig,
          ...mapped,
        };
        return inMemoryConfig;
      }
    } catch (err) {
      // Jika tabel belum ada atau DB offline, gunakan in-memory cache
      logger.warn("Gagal membaca setting dari database, menggunakan konfigurasi fallback", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return inMemoryConfig;
  }

  async updateConfig(dto: UpdateClinicConfigDTO): Promise<ClinicConfig> {
    inMemoryConfig = {
      ...inMemoryConfig,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Coba perbarui tabel setting SIMKhanza tanpa mengubah struktur tabel
      await query(
        `UPDATE ${SIMKHANZA_TABLES.SETTING} 
         SET nama_instansi = ?, alamat_instansi = ?, kabupaten = ?, propinsi = ?, kontak = ?, email = ?
         LIMIT 1`,
        [
          dto.namaKlinik,
          dto.alamat,
          dto.kotaKabupaten || "",
          dto.propinsi || "",
          dto.telepon,
          dto.email,
        ]
      );
      logger.info("Konfigurasi klinik berhasil disimpan ke database SIMKhanza");
    } catch (err) {
      logger.warn("Database update skipped or failed, saved to in-memory config", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return inMemoryConfig;
  }
}

export const clinicConfigRepository = new ClinicConfigRepository();

