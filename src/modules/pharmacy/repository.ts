import { query, withTransaction } from "@/lib/db";
import { SIMKHANZA_TABLES } from "@/lib/db/simkhanza-map";
import {
  MedicineItem,
  CreateSaleDTO,
  SaleReceipt,
  SaleHistoryItem,
} from "./types";
import { logger } from "@/lib/logger";

interface MedicineDbRow {
  kode_brng: string;
  nama_brng: string;
  kode_sat: string;
  satuan: string;
  kategori: string;
  ralan: number;
  stok: number;
}

interface SaleHistoryDbRow {
  nota_jual: string;
  tgl_jual: string;
  nm_pasien: string;
  keterangan: string;
  total_item: number;
  total_biaya: number;
  status: "Sudah Bayar" | "Belum Bayar";
}

export class PharmacyRepository {
  async searchMedicines(keyword?: string, limit = 50): Promise<MedicineItem[]> {
    try {
      let sql = `
        SELECT db.kode_brng, db.nama_brng, db.kode_sat, 
               COALESCE(ks.satuan, db.kode_sat) as satuan,
               COALESCE(kb.nama, db.kategori) as kategori,
               db.ralan,
               COALESCE(gb.stok, 0) as stok
        FROM ${SIMKHANZA_TABLES.DATABARANG} db
        LEFT JOIN ${SIMKHANZA_TABLES.SATUAN} ks ON db.kode_sat = ks.kode_sat
        LEFT JOIN ${SIMKHANZA_TABLES.KATEGORI_BARANG} kb ON db.kategori = kb.kode
        LEFT JOIN ${SIMKHANZA_TABLES.GUDANGBARANG} gb ON db.kode_brng = gb.kode_brng AND gb.kd_bangsal = 'APT01'
        WHERE db.status = '1'
      `;
      const params: string[] = [];

      if (keyword && keyword.trim().length > 0) {
        const queryTerm = `%${keyword.trim()}%`;
        sql += ` AND (db.nama_brng LIKE ? OR db.kode_brng LIKE ?)`;
        params.push(queryTerm, queryTerm);
      }

      sql += ` ORDER BY db.nama_brng ASC LIMIT ${Number(limit)}`;

      const rows = await query<MedicineDbRow>(sql, params);
      return rows.map((r) => ({
        kodeBrng: r.kode_brng,
        namaBrng: r.nama_brng,
        kodeSat: r.kode_sat,
        satuan: r.satuan,
        kategori: r.kategori,
        hargaJual: r.ralan,
        stok: r.stok,
      }));
    } catch (err) {
      logger.error("Gagal mencari obat dari database", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  async getNextNotaJual(tgl: string): Promise<string> {
    const cleanDate = tgl.replace(/-/g, "");
    const prefix = `JL${cleanDate}`;
    try {
      const rows = await query<{ max_nota: string }>(
        `SELECT MAX(nota_jual) as max_nota 
         FROM ${SIMKHANZA_TABLES.PENJUALAN} 
         WHERE nota_jual LIKE ?`,
        [`${prefix}%`]
      );
      if (rows && rows[0]?.max_nota) {
        const lastSequence = parseInt(rows[0].max_nota.slice(-4), 10);
        const nextSequence = (lastSequence + 1).toString().padStart(4, "0");
        return `${prefix}${nextSequence}`;
      }
      return `${prefix}0001`;
    } catch {
      return `${prefix}0001`;
    }
  }

  async createExternalDrugSale(dto: CreateSaleDTO): Promise<SaleReceipt> {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const jamJual = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const notaJual = await this.getNextNotaJual(today);

    // Gunakan transaksi database aman
    return await withTransaction(async (conn) => {
      // 1. Verifikasi kecukupan stok untuk setiap item obat
      for (const item of dto.items) {
        const [stokRows] = await conn.execute(
          `SELECT stok FROM ${SIMKHANZA_TABLES.GUDANGBARANG} 
           WHERE kode_brng = ? AND kd_bangsal = 'APT01' FOR UPDATE`,
          [item.kodeBrng]
        );
        const currentStock = (stokRows as Array<{ stok: number }>)[0]?.stok || 0;
        if (currentStock < item.jumlah) {
          throw new Error(
            `Stok obat '${item.namaBrng}' tidak mencukupi! Tersedia: ${currentStock}, Dibutuhkan: ${item.jumlah}`
          );
        }
      }

      // 2. Simpan header penjualan (SIMKhanza tabel penjualan)
      await conn.execute(
        `INSERT INTO ${SIMKHANZA_TABLES.PENJUALAN} 
         (nota_jual, tgl_jual, nip, no_rkm_medis, nm_pasien, keterangan, jns_jual, ongkir, status)
         VALUES (?, ?, 'KASIR01', '-', ?, ?, ?, 0, 'Sudah Bayar')`,
        [
          notaJual,
          today,
          dto.nmPasien,
          dto.keterangan || "Penjualan Obat Luar",
          dto.jnsJual || "Jual Bebas",
        ]
      );

      // 3. Simpan rincian detail jual & potong stok
      for (const item of dto.items) {
        const subtotal = item.hargaJual * item.jumlah;
        const total = item.total;
        const diskonRp = subtotal - total;

        await conn.execute(
          `INSERT INTO ${SIMKHANZA_TABLES.DETAILJUAL} 
           (nota_jual, kode_brng, kode_sat, jumlah, h_jual, subtotal, diskon, total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            notaJual,
            item.kodeBrng,
            item.satuan,
            item.jumlah,
            item.hargaJual,
            subtotal,
            diskonRp,
            total,
          ]
        );

        // Potong stok di gudangbarang
        await conn.execute(
          `UPDATE ${SIMKHANZA_TABLES.GUDANGBARANG} 
           SET stok = stok - ? 
           WHERE kode_brng = ? AND kd_bangsal = 'APT01'`,
          [item.jumlah, item.kodeBrng]
        );
      }

      logger.info("Transaksi penjualan obat luar berhasil diproses", {
        notaJual,
        totalItems: dto.items.length,
        totalTagihan: dto.totalTagihan,
      });

      return {
        notaJual,
        tglJual: today,
        jamJual,
        nmPasien: dto.nmPasien,
        keterangan: dto.keterangan || "Penjualan Obat Luar",
        items: dto.items,
        totalTagihan: dto.totalTagihan,
        uangDiterima: dto.uangDiterima,
        kembalian: dto.kembalian,
      };
    });
  }

  async getRecentSales(limit = 30): Promise<SaleHistoryItem[]> {
    try {
      const sql = `
        SELECT p.nota_jual, 
               DATE_FORMAT(p.tgl_jual, '%Y-%m-%d') as tgl_jual, 
               p.nm_pasien, p.keterangan, p.status,
               COUNT(dj.kode_brng) as total_item,
               COALESCE(SUM(dj.total), 0) as total_biaya
        FROM ${SIMKHANZA_TABLES.PENJUALAN} p
        LEFT JOIN ${SIMKHANZA_TABLES.DETAILJUAL} dj ON p.nota_jual = dj.nota_jual
        GROUP BY p.nota_jual, p.tgl_jual, p.nm_pasien, p.keterangan, p.status
        ORDER BY p.nota_jual DESC
        LIMIT ${Number(limit)}
      `;
      const rows = await query<SaleHistoryDbRow>(sql);
      return rows.map((r) => ({
        notaJual: r.nota_jual,
        tglJual: r.tgl_jual,
        nmPasien: r.nm_pasien,
        keterangan: r.keterangan,
        totalItem: r.total_item,
        totalBiaya: r.total_biaya,
        status: r.status,
      }));
    } catch (err) {
      logger.error("Gagal mengambil riwayat penjualan obat", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }
}

export const pharmacyRepository = new PharmacyRepository();

