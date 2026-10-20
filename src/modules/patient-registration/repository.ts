import { query } from "@/lib/db";
import { SIMKHANZA_TABLES } from "@/lib/db/simkhanza-map";
import {
  Patient,
  CreatePatientDTO,
  VisitRegistration,
  CreateVisitDTO,
  DoctorOption,
  PoliOption,
  PenjabOption,
} from "./types";
import { logger } from "@/lib/logger";

interface PatientDbRow {
  no_rkm_medis: string;
  nm_pasien: string;
  no_ktp: string;
  jk: "L" | "P";
  tmp_lahir: string;
  tgl_lahir: string;
  alamat: string;
  gol_darah: "A" | "B" | "AB" | "O" | "-";
  tgl_daftar: string;
  no_tlp: string;
  kd_pj: string;
  png_jawab?: string;
}

interface VisitDbRow {
  no_rawat: string;
  no_reg: string;
  tgl_registrasi: string;
  jam_reg: string;
  kd_dokter: string;
  nm_dokter: string;
  no_rkm_medis: string;
  nm_pasien: string;
  kd_poli: string;
  nm_poli: string;
  biaya_reg: number;
  stts: "Belum" | "Sudah" | "Batal" | "Berkunjung" | "Dirujuk";
  kd_pj: string;
  png_jawab: string;
  status_bayar: "Sudah Bayar" | "Belum Bayar";
}

export class PatientRegistrationRepository {
  async getPatients(search?: string, limit = 50): Promise<Patient[]> {
    try {
      let sql = `
        SELECT p.no_rkm_medis, p.nm_pasien, p.no_ktp, p.jk, p.tmp_lahir, 
               DATE_FORMAT(p.tgl_lahir, '%Y-%m-%d') as tgl_lahir, 
               p.alamat, p.gol_darah, 
               DATE_FORMAT(p.tgl_daftar, '%Y-%m-%d') as tgl_daftar, 
               p.no_tlp, p.kd_pj, pj.png_jawab
        FROM ${SIMKHANZA_TABLES.PASIEN} p
        LEFT JOIN ${SIMKHANZA_TABLES.PENJAB} pj ON p.kd_pj = pj.kd_pj
      `;
      const params: string[] = [];

      if (search && search.trim().length > 0) {
        const keyword = `%${search.trim()}%`;
        sql += ` WHERE p.nm_pasien LIKE ? OR p.no_rkm_medis LIKE ? OR p.no_ktp LIKE ? OR p.no_tlp LIKE ?`;
        params.push(keyword, keyword, keyword, keyword);
      }

      sql += ` ORDER BY p.no_rkm_medis DESC LIMIT ${Number(limit)}`;

      const rows = await query<PatientDbRow>(sql, params);
      return rows.map((r) => ({
        noRkmMedis: r.no_rkm_medis,
        nmPasien: r.nm_pasien,
        noKtp: r.no_ktp,
        jk: r.jk,
        tmpLahir: r.tmp_lahir,
        tglLahir: r.tgl_lahir,
        alamat: r.alamat,
        golDarah: r.gol_darah,
        tglDaftar: r.tgl_daftar,
        noTlp: r.no_tlp,
        kdPj: r.kd_pj,
        pngJawab: r.png_jawab || "Umum",
      }));
    } catch (err) {
      logger.error("Gagal mengambil data pasien dari database", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  async getNextNoRm(): Promise<string> {
    try {
      const rows = await query<{ max_no: string }>(
        `SELECT MAX(CAST(no_rkm_medis AS UNSIGNED)) as max_no FROM ${SIMKHANZA_TABLES.PASIEN}`
      );
      const currentMax = rows[0]?.max_no ? parseInt(rows[0].max_no, 10) : 0;
      const nextNo = (currentMax + 1).toString().padStart(6, "0");
      return nextNo;
    } catch {
      return "000001";
    }
  }

  async createPatient(dto: CreatePatientDTO): Promise<Patient> {
    const noRm = await this.getNextNoRm();
    const today = new Date().toISOString().split("T")[0];

    await query(
      `INSERT INTO ${SIMKHANZA_TABLES.PASIEN} 
       (no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, alamat, gol_darah, tgl_daftar, no_tlp, kd_pj)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        noRm,
        dto.nmPasien,
        dto.noKtp || "",
        dto.jk,
        dto.tmpLahir || "",
        dto.tglLahir,
        dto.alamat,
        dto.golDarah || "-",
        today,
        dto.noTlp || "",
        dto.kdPj || "A01",
      ]
    );

    return {
      noRkmMedis: noRm,
      nmPasien: dto.nmPasien,
      noKtp: dto.noKtp || "",
      jk: dto.jk,
      tmpLahir: dto.tmpLahir || "",
      tglLahir: dto.tglLahir,
      alamat: dto.alamat,
      golDarah: dto.golDarah || "-",
      tglDaftar: today,
      noTlp: dto.noTlp || "",
      kdPj: dto.kdPj || "A01",
    };
  }

  async getVisitsToday(dateStr?: string): Promise<VisitRegistration[]> {
    const targetDate = dateStr || new Date().toISOString().split("T")[0];

    try {
      const sql = `
        SELECT rp.no_rawat, rp.no_reg, 
               DATE_FORMAT(rp.tgl_registrasi, '%Y-%m-%d') as tgl_registrasi, 
               TIME_FORMAT(rp.jam_reg, '%H:%i') as jam_reg, 
               rp.kd_dokter, d.nm_dokter, 
               rp.no_rkm_medis, p.nm_pasien, 
               rp.kd_poli, pol.nm_poli, 
               rp.biaya_reg, rp.stts, 
               rp.kd_pj, pj.png_jawab, 
               rp.status_bayar
        FROM ${SIMKHANZA_TABLES.REG_PERIKSA} rp
        JOIN ${SIMKHANZA_TABLES.PASIEN} p ON rp.no_rkm_medis = p.no_rkm_medis
        JOIN ${SIMKHANZA_TABLES.DOKTER} d ON rp.kd_dokter = d.kd_dokter
        JOIN ${SIMKHANZA_TABLES.POLIKLINIK} pol ON rp.kd_poli = pol.kd_poli
        LEFT JOIN ${SIMKHANZA_TABLES.PENJAB} pj ON rp.kd_pj = pj.kd_pj
        WHERE rp.tgl_registrasi = ?
        ORDER BY rp.jam_reg DESC, rp.no_reg DESC
      `;
      const rows = await query<VisitDbRow>(sql, [targetDate]);
      return rows.map((r) => ({
        noRawat: r.no_rawat,
        noReg: r.no_reg,
        tglRegistrasi: r.tgl_registrasi,
        jamReg: r.jam_reg,
        kdDokter: r.kd_dokter,
        nmDokter: r.nm_dokter,
        noRkmMedis: r.no_rkm_medis,
        nmPasien: r.nm_pasien,
        kdPoli: r.kd_poli,
        nmPoli: r.nm_poli,
        biayaReg: r.biaya_reg,
        stts: r.stts,
        kdPj: r.kd_pj,
        pngJawab: r.png_jawab || "Umum",
        statusBayar: r.status_bayar,
      }));
    } catch (err) {
      logger.error("Gagal mengambil data kunjungan registrasi hari ini", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  async getNextNoRawat(tgl: string): Promise<string> {
    const formattedDate = tgl.replace(/-/g, "/");
    try {
      const rows = await query<{ max_no: string }>(
        `SELECT MAX(SUBSTRING_INDEX(no_rawat, '/', -1)) as max_no 
         FROM ${SIMKHANZA_TABLES.REG_PERIKSA} 
         WHERE tgl_registrasi = ?`,
        [tgl]
      );
      const currentMax = rows[0]?.max_no ? parseInt(rows[0].max_no, 10) : 0;
      const nextNo = (currentMax + 1).toString().padStart(6, "0");
      return `${formattedDate}/${nextNo}`;
    } catch {
      return `${formattedDate}/000001`;
    }
  }

  async getNextNoReg(kdPoli: string, kdDokter: string, tgl: string): Promise<string> {
    try {
      const rows = await query<{ max_reg: string }>(
        `SELECT MAX(CAST(no_reg AS UNSIGNED)) as max_reg 
         FROM ${SIMKHANZA_TABLES.REG_PERIKSA} 
         WHERE kd_poli = ? AND kd_dokter = ? AND tgl_registrasi = ?`,
        [kdPoli, kdDokter, tgl]
      );
      const currentMax = rows[0]?.max_reg ? parseInt(rows[0].max_reg, 10) : 0;
      return (currentMax + 1).toString().padStart(3, "0");
    } catch {
      return "001";
    }
  }

  async createVisit(dto: CreateVisitDTO): Promise<VisitRegistration> {
    const today = dto.tglRegistrasi || new Date().toISOString().split("T")[0];
    const now = new Date();
    const jamReg = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const [noRawat, noReg] = await Promise.all([
      this.getNextNoRawat(today),
      this.getNextNoReg(dto.kdPoli, dto.kdDokter, today),
    ]);

    let biaya = dto.biayaReg;
    if (biaya === undefined) {
      const poliRows = await query<{ registrasi: number }>(
        `SELECT registrasi FROM ${SIMKHANZA_TABLES.POLIKLINIK} WHERE kd_poli = ?`,
        [dto.kdPoli]
      );
      biaya = poliRows[0]?.registrasi || 25000;
    }

    await query(
      `INSERT INTO ${SIMKHANZA_TABLES.REG_PERIKSA} 
       (no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli, biaya_reg, stts, kd_pj, status_bayar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Belum', ?, 'Belum Bayar')`,
      [noReg, noRawat, today, jamReg, dto.kdDokter, dto.noRkmMedis, dto.kdPoli, biaya, dto.kdPj]
    );

    // Get created record detail
    const visitList = await this.getVisitsToday(today);
    const created = visitList.find((v) => v.noRawat === noRawat);
    if (!created) {
      throw new Error("Gagal mengambil detail kunjungan yang baru dibuat.");
    }
    return created;
  }

  async getDoctors(): Promise<DoctorOption[]> {
    try {
      const rows = await query<{ kd_dokter: string; nm_dokter: string }>(
        `SELECT kd_dokter, nm_dokter FROM ${SIMKHANZA_TABLES.DOKTER} WHERE status = '1' ORDER BY nm_dokter ASC`
      );
      return rows.map((r) => ({ kdDokter: r.kd_dokter, nmDokter: r.nm_dokter }));
    } catch {
      return [];
    }
  }

  async getPoliklinik(): Promise<PoliOption[]> {
    try {
      const rows = await query<{ kd_poli: string; nm_poli: string; registrasi: number }>(
        `SELECT kd_poli, nm_poli, registrasi FROM ${SIMKHANZA_TABLES.POLIKLINIK} WHERE status = '1' ORDER BY nm_poli ASC`
      );
      return rows.map((r) => ({
        kdPoli: r.kd_poli,
        nmPoli: r.nm_poli,
        registrasi: r.registrasi,
      }));
    } catch {
      return [];
    }
  }

  async getPenjab(): Promise<PenjabOption[]> {
    try {
      const rows = await query<{ kd_pj: string; png_jawab: string }>(
        `SELECT kd_pj, png_jawab FROM ${SIMKHANZA_TABLES.PENJAB} WHERE status = '1' ORDER BY png_jawab ASC`
      );
      return rows.map((r) => ({ kdPj: r.kd_pj, pngJawab: r.png_jawab }));
    } catch {
      return [];
    }
  }
}

export const patientRegistrationRepository = new PatientRegistrationRepository();

