/**
 * SIMKHANZA SCHEMA COMPATIBILITY MAPPING
 *
 * SIMKhanza menggunakan konvensi tabel legacy MySQL tanpa strict foreign keys.
 * File ini mendokumentasikan pemetaan antara domain model e-clinic-coda dan skema SIMKhanza
 * untuk memastikan tidak ada perubahan skema destruktif pada database lama.
 */

export const SIMKHANZA_TABLES = {
  // Pengaturan instansi / klinik
  SETTING: "setting",

  // Modul Pasien & Registrasi
  PASIEN: "pasien",
  REG_PERIKSA: "reg_periksa",
  DOKTER: "dokter",
  POLIKLINIK: "poliklinik",
  PENJAB: "penjab", // Penanggung jawab / Asuransi (BPJS, Umum, dsb)

  // Modul Farmasi & Obat
  DATABARANG: "databarang",
  GUDANGBARANG: "gudangbarang",
  DETAIL_PEMBERIAN_OBAT: "detail_pemberian_obat",
  PENJUALAN: "penjualan",
  DETAILJUAL: "detailjual",
  MUTASIBARANG: "mutasibarang",
  KATEGORI_BARANG: "kategori_barang",
  GOLONGAN_BARANG: "golongan_barang",
  SATUAN: "kodesatuan",

  // Rekam Medis & Diagnosis
  PENYAKIT: "penyakit", // ICD-10
  DIAGNOSA_PASIEN: "diagnosa_pasien",
} as const;

export interface SimKhanzaSettingRow {
  nama_instansi: string;
  alamat_instansi: string;
  kabupaten: string;
  propinsi: string;
  kontak: string;
  email: string;
  logo?: Buffer | string | null;
  aktifkan?: string;
  kode_ppk?: string;
}

/**
 * Pemetaan kolom setting SIMKhanza ke ClinicProfile domain
 */
export function mapSimKhanzaSettingToProfile(row: Partial<SimKhanzaSettingRow>) {
  return {
    namaKlinik: row.nama_instansi || "",
    alamat: row.alamat_instansi || "",
    kotaKabupaten: row.kabupaten || "",
    propinsi: row.propinsi || "",
    telepon: row.kontak || "",
    email: row.email || "",
    logoUrl: "",
    izinOperasional: row.kode_ppk || "",
    catatanKuitansi: "Terima kasih atas kunjungan Anda. Semoga lekas sembuh.",
  };
}

