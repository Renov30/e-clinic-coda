import { query, withTransaction } from "@/lib/db";
import { SIMKHANZA_TABLES } from "@/lib/db/simkhanza-map";
import {
  Medicine,
  CreateMedicineDTO,
  UpdateMedicineDTO,
  AdjustStockDTO,
  StockAdjustment,
  CategoryOption,
  SatuanOption,
  StockSummary,
} from "./types";
import { logger } from "@/lib/logger";

interface MedicineDbRow {
  kode_brng: string;
  nama_brng: string;
  kode_sat: string;
  nama_satuan: string;
  kategori: string;
  nama_kategori: string;
  h_beli: number;
  ralan: number;
  status: "0" | "1";
  stok: number;
}

interface StockAdjustmentDbRow {
  id: number;
  kode_brng: string;
  nama_brng?: string;
  kd_bangsal: string;
  stok_sebelum: number;
  selisih: number;
  stok_sesudah: number;
  jenis: "TAMBAH" | "KURANG" | "OPNAME";
  keterangan: string;
  user_id?: string | null;
  created_at: string;
}

export class MedicineRepository {
  async getAllMedicines(filter?: {
    keyword?: string;
    kategori?: string;
    stockStatus?: "all" | "safe" | "low" | "out";
    status?: "all" | "active" | "inactive";
  }): Promise<Medicine[]> {
    try {
      let sql = `
        SELECT db.kode_brng, db.nama_brng, db.kode_sat, db.kategori, db.h_beli, db.ralan, db.status,
               COALESCE(ks.satuan, db.kode_sat) as nama_satuan,
               COALESCE(kb.nama, db.kategori) as nama_kategori,
               COALESCE(gb.stok, 0) as stok
        FROM ${SIMKHANZA_TABLES.DATABARANG} db
        LEFT JOIN ${SIMKHANZA_TABLES.SATUAN} ks ON db.kode_sat = ks.kode_sat
        LEFT JOIN ${SIMKHANZA_TABLES.KATEGORI_BARANG} kb ON db.kategori = kb.kode
        LEFT JOIN ${SIMKHANZA_TABLES.GUDANGBARANG} gb ON db.kode_brng = gb.kode_brng AND gb.kd_bangsal = 'APT01'
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (filter?.keyword && filter.keyword.trim().length > 0) {
        const queryTerm = `%${filter.keyword.trim()}%`;
        sql += ` AND (db.nama_brng LIKE ? OR db.kode_brng LIKE ?)`;
        params.push(queryTerm, queryTerm);
      }

      if (filter?.kategori && filter.kategori !== "all") {
        sql += ` AND db.kategori = ?`;
        params.push(filter.kategori);
      }

      if (filter?.status && filter.status !== "all") {
        sql += ` AND db.status = ?`;
        params.push(filter.status === "active" ? "1" : "0");
      }

      if (filter?.stockStatus && filter.stockStatus !== "all") {
        if (filter.stockStatus === "out") {
          sql += ` AND COALESCE(gb.stok, 0) <= 0`;
        } else if (filter.stockStatus === "low") {
          sql += ` AND COALESCE(gb.stok, 0) > 0 AND COALESCE(gb.stok, 0) <= 20`;
        } else if (filter.stockStatus === "safe") {
          sql += ` AND COALESCE(gb.stok, 0) > 20`;
        }
      }

      sql += ` ORDER BY db.nama_brng ASC`;

      const rows = await query<MedicineDbRow>(sql, params);
      return rows.map((r) => {
        const hBeli = Number(r.h_beli) || 0;
        const ralan = Number(r.ralan) || 0;
        const marginPercent =
          hBeli > 0 ? Math.round(((ralan - hBeli) / hBeli) * 100) : 0;

        return {
          kodeBrng: r.kode_brng,
          namaBrng: r.nama_brng,
          kodeSat: r.kode_sat,
          namaSatuan: r.nama_satuan,
          kategori: r.kategori,
          namaKategori: r.nama_kategori,
          hBeli,
          ralan,
          status: r.status,
          stok: Number(r.stok) || 0,
          marginPercent,
        };
      });
    } catch (err) {
      logger.error("Gagal mengambil data obat dari database", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  async getMedicineByCode(kodeBrng: string): Promise<Medicine | null> {
    try {
      const sql = `
        SELECT db.kode_brng, db.nama_brng, db.kode_sat, db.kategori, db.h_beli, db.ralan, db.status,
               COALESCE(ks.satuan, db.kode_sat) as nama_satuan,
               COALESCE(kb.nama, db.kategori) as nama_kategori,
               COALESCE(gb.stok, 0) as stok
        FROM ${SIMKHANZA_TABLES.DATABARANG} db
        LEFT JOIN ${SIMKHANZA_TABLES.SATUAN} ks ON db.kode_sat = ks.kode_sat
        LEFT JOIN ${SIMKHANZA_TABLES.KATEGORI_BARANG} kb ON db.kategori = kb.kode
        LEFT JOIN ${SIMKHANZA_TABLES.GUDANGBARANG} gb ON db.kode_brng = gb.kode_brng AND gb.kd_bangsal = 'APT01'
        WHERE db.kode_brng = ?
        LIMIT 1
      `;
      const rows = await query<MedicineDbRow>(sql, [kodeBrng]);
      if (!rows || rows.length === 0) return null;

      const r = rows[0];
      const hBeli = Number(r.h_beli) || 0;
      const ralan = Number(r.ralan) || 0;
      const marginPercent =
        hBeli > 0 ? Math.round(((ralan - hBeli) / hBeli) * 100) : 0;

      return {
        kodeBrng: r.kode_brng,
        namaBrng: r.nama_brng,
        kodeSat: r.kode_sat,
        namaSatuan: r.nama_satuan,
        kategori: r.kategori,
        namaKategori: r.nama_kategori,
        hBeli,
        ralan,
        status: r.status,
        stok: Number(r.stok) || 0,
        marginPercent,
      };
    } catch {
      return null;
    }
  }

  async getNextKodeBrng(): Promise<string> {
    try {
      const rows = await query<{ max_kode: string }>(
        `SELECT MAX(kode_brng) as max_kode FROM ${SIMKHANZA_TABLES.DATABARANG} WHERE kode_brng LIKE 'OBT%'`
      );
      if (rows && rows[0]?.max_kode) {
        const numericPart = rows[0].max_kode.replace("OBT", "");
        const num = parseInt(numericPart, 10);
        if (!isNaN(num)) {
          return `OBT${(num + 1).toString().padStart(3, "0")}`;
        }
      }
      return "OBT001";
    } catch {
      return "OBT001";
    }
  }

  async createMedicine(
    dto: CreateMedicineDTO,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const kodeBrng = dto.kodeBrng.trim().toUpperCase();
      const namaBrng = dto.namaBrng.trim();
      const kodeSat = dto.kodeSat.trim().slice(0, 4);
      const kategori = dto.kategori.trim();
      const hBeli = Number(dto.hBeli) || 0;
      const ralan = Number(dto.ralan) || 0;
      const stokAwal = Number(dto.stokAwal) || 0;
      const status = dto.status || "1";

      return await withTransaction(async (conn) => {
        // Cek duplikasi kode obat
        const [existing] = (await conn.execute(
          `SELECT kode_brng FROM ${SIMKHANZA_TABLES.DATABARANG} WHERE kode_brng = ? LIMIT 1`,
          [kodeBrng]
        )) as [Array<{ kode_brng: string }>, unknown];

        if (existing && existing.length > 0) {
          return {
            success: false,
            error: `Kode obat '${kodeBrng}' sudah terdaftar dalam sistem.`,
          };
        }

        // 1. Simpan ke databarang
        await conn.execute(
          `INSERT INTO ${SIMKHANZA_TABLES.DATABARANG} 
           (kode_brng, nama_brng, kode_sat, kategori, h_beli, ralan, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [kodeBrng, namaBrng, kodeSat, kategori, hBeli, ralan, status]
        );

        // 2. Simpan stok awal di gudangbarang depo APT01
        await conn.execute(
          `INSERT INTO ${SIMKHANZA_TABLES.GUDANGBARANG} 
           (kode_brng, kd_bangsal, stok)
           VALUES (?, 'APT01', ?)
           ON DUPLICATE KEY UPDATE stok = ?`,
          [kodeBrng, stokAwal, stokAwal]
        );

        // 3. Catat audit penyesuaian stok awal jika stokAwal > 0
        if (stokAwal > 0) {
          await conn.execute(
            `INSERT INTO coda_stock_adjustments 
             (kode_brng, kd_bangsal, stok_sebelum, selisih, stok_sesudah, jenis, keterangan, user_id)
             VALUES (?, 'APT01', 0, ?, ?, 'TAMBAH', 'Stok awal registrasi obat baru', ?)`,
            [kodeBrng, stokAwal, stokAwal, userId || null]
          );
        }

        return { success: true };
      });
    } catch (err) {
      logger.error("Gagal mendaftarkan obat baru", {
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menyimpan data obat.",
      };
    }
  }

  async updateMedicine(
    kodeBrng: string,
    dto: UpdateMedicineDTO
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const namaBrng = dto.namaBrng.trim();
      const kodeSat = dto.kodeSat.trim().slice(0, 4);
      const kategori = dto.kategori.trim();
      const hBeli = Number(dto.hBeli) || 0;
      const ralan = Number(dto.ralan) || 0;
      const status = dto.status || "1";

      await query(
        `UPDATE ${SIMKHANZA_TABLES.DATABARANG} 
         SET nama_brng = ?, kode_sat = ?, kategori = ?, h_beli = ?, ralan = ?, status = ?
         WHERE kode_brng = ?`,
        [namaBrng, kodeSat, kategori, hBeli, ralan, status, kodeBrng]
      );

      return { success: true };
    } catch (err) {
      logger.error("Gagal memperbarui data obat", {
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal memperbarui data obat.",
      };
    }
  }

  async toggleMedicineStatus(
    kodeBrng: string,
    newStatus: "0" | "1"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await query(
        `UPDATE ${SIMKHANZA_TABLES.DATABARANG} SET status = ? WHERE kode_brng = ?`,
        [newStatus, kodeBrng]
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal mengubah status obat.",
      };
    }
  }

  async adjustStock(
    dto: AdjustStockDTO,
    userId?: string
  ): Promise<{ success: boolean; error?: string; newStock?: number }> {
    try {
      return await withTransaction(async (conn) => {
        // Ambil stok saat ini dengan lock
        const [rows] = (await conn.execute(
          `SELECT stok FROM ${SIMKHANZA_TABLES.GUDANGBARANG} 
           WHERE kode_brng = ? AND kd_bangsal = 'APT01' FOR UPDATE`,
          [dto.kodeBrng]
        )) as [Array<{ stok: number }>, unknown];

        const stokSebelum = rows && rows.length > 0 ? Number(rows[0].stok) || 0 : 0;
        let selisih = 0;
        let stokSesudah = stokSebelum;

        const inputJumlah = Math.abs(Number(dto.jumlah) || 0);

        if (dto.jenis === "TAMBAH") {
          selisih = inputJumlah;
          stokSesudah = stokSebelum + selisih;
        } else if (dto.jenis === "KURANG") {
          if (inputJumlah > stokSebelum) {
            return {
              success: false,
              error: `Jumlah pengurangan (${inputJumlah}) melebihi stok yang ada (${stokSebelum}).`,
            };
          }
          selisih = -inputJumlah;
          stokSesudah = stokSebelum - inputJumlah;
        } else if (dto.jenis === "OPNAME") {
          stokSesudah = Number(dto.jumlah) >= 0 ? Number(dto.jumlah) : 0;
          selisih = stokSesudah - stokSebelum;
        }

        // Simpan stok baru ke gudangbarang
        await conn.execute(
          `INSERT INTO ${SIMKHANZA_TABLES.GUDANGBARANG} (kode_brng, kd_bangsal, stok)
           VALUES (?, 'APT01', ?)
           ON DUPLICATE KEY UPDATE stok = ?`,
          [dto.kodeBrng, stokSesudah, stokSesudah]
        );

        // Rekam riwayat mutasi / adjustment
        await conn.execute(
          `INSERT INTO coda_stock_adjustments 
           (kode_brng, kd_bangsal, stok_sebelum, selisih, stok_sesudah, jenis, keterangan, user_id)
           VALUES (?, 'APT01', ?, ?, ?, ?, ?, ?)`,
          [
            dto.kodeBrng,
            stokSebelum,
            selisih,
            stokSesudah,
            dto.jenis,
            dto.keterangan.trim() || "Penyesuaian stok fisik apotek",
            userId || null,
          ]
        );

        return { success: true, newStock: stokSesudah };
      });
    } catch (err) {
      logger.error("Gagal menyesuaikan stok obat", {
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menyesuaikan stok.",
      };
    }
  }

  async getCategories(): Promise<CategoryOption[]> {
    try {
      const rows = await query<{ kode: string; nama: string }>(
        `SELECT kode, nama FROM ${SIMKHANZA_TABLES.KATEGORI_BARANG} ORDER BY nama ASC`
      );
      return rows.map((r) => ({ kode: r.kode, nama: r.nama }));
    } catch {
      return [];
    }
  }

  async getUnits(): Promise<SatuanOption[]> {
    try {
      const rows = await query<{ kode_sat: string; satuan: string }>(
        `SELECT kode_sat, satuan FROM ${SIMKHANZA_TABLES.SATUAN} ORDER BY satuan ASC`
      );
      return rows.map((r) => ({ kodeSat: r.kode_sat, satuan: r.satuan }));
    } catch {
      return [];
    }
  }

  async createUnit(
    kodeSat: string,
    satuan: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanKode = kodeSat.trim().toUpperCase().slice(0, 4);
      const cleanSatuan = satuan.trim();

      await query(
        `INSERT INTO ${SIMKHANZA_TABLES.SATUAN} (kode_sat, satuan)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE satuan = ?`,
        [cleanKode, cleanSatuan, cleanSatuan]
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menambah satuan baru.",
      };
    }
  }

  async getStockAdjustments(
    kodeBrng?: string,
    limit = 50
  ): Promise<StockAdjustment[]> {
    try {
      let sql = `
        SELECT sa.id, sa.kode_brng, db.nama_brng, sa.kd_bangsal, sa.stok_sebelum,
               sa.selisih, sa.stok_sesudah, sa.jenis, sa.keterangan, sa.user_id,
               DATE_FORMAT(sa.created_at, '%Y-%m-%d %H:%i') as created_at
        FROM coda_stock_adjustments sa
        LEFT JOIN ${SIMKHANZA_TABLES.DATABARANG} db ON sa.kode_brng = db.kode_brng
      `;
      const params: (string | number)[] = [];

      if (kodeBrng && kodeBrng.trim().length > 0) {
        sql += ` WHERE sa.kode_brng = ?`;
        params.push(kodeBrng.trim());
      }

      sql += ` ORDER BY sa.created_at DESC LIMIT ${Number(limit)}`;

      const rows = await query<StockAdjustmentDbRow>(sql, params);
      return rows.map((r) => ({
        id: r.id,
        kodeBrng: r.kode_brng,
        namaBrng: r.nama_brng || r.kode_brng,
        kdBangsal: r.kd_bangsal,
        stokSebelum: Number(r.stok_sebelum) || 0,
        selisih: Number(r.selisih) || 0,
        stokSesudah: Number(r.stok_sesudah) || 0,
        jenis: r.jenis,
        keterangan: r.keterangan,
        userId: r.user_id,
        createdAt: r.created_at,
      }));
    } catch (err) {
      logger.error("Gagal mengambil riwayat penyesuaian stok", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  async getStockSummary(): Promise<StockSummary> {
    try {
      const rows = await query<{
        total_medicines: number;
        total_stock: number;
        low_stock_count: number;
        out_of_stock_count: number;
        total_asset_value: number;
      }>(`
        SELECT 
          COUNT(db.kode_brng) as total_medicines,
          COALESCE(SUM(gb.stok), 0) as total_stock,
          COALESCE(SUM(CASE WHEN gb.stok > 0 AND gb.stok <= 20 THEN 1 ELSE 0 END), 0) as low_stock_count,
          COALESCE(SUM(CASE WHEN COALESCE(gb.stok, 0) <= 0 THEN 1 ELSE 0 END), 0) as out_of_stock_count,
          COALESCE(SUM(COALESCE(gb.stok, 0) * db.h_beli), 0) as total_asset_value
        FROM ${SIMKHANZA_TABLES.DATABARANG} db
        LEFT JOIN ${SIMKHANZA_TABLES.GUDANGBARANG} gb ON db.kode_brng = gb.kode_brng AND gb.kd_bangsal = 'APT01'
        WHERE db.status = '1'
      `);

      if (rows && rows[0]) {
        const r = rows[0];
        return {
          totalMedicines: Number(r.total_medicines) || 0,
          totalStock: Number(r.total_stock) || 0,
          lowStockCount: Number(r.low_stock_count) || 0,
          outOfStockCount: Number(r.out_of_stock_count) || 0,
          totalAssetValue: Number(r.total_asset_value) || 0,
        };
      }

      return {
        totalMedicines: 0,
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalAssetValue: 0,
      };
    } catch {
      return {
        totalMedicines: 0,
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalAssetValue: 0,
      };
    }
  }
}

export const medicineRepository = new MedicineRepository();

