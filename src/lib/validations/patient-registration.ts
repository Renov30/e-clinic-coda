import { z } from "zod";

export const patientSchema = z.object({
  nmPasien: z
    .string()
    .min(2, "Nama pasien minimal 2 karakter")
    .max(40, "Nama pasien maksimal 40 karakter"),
  noKtp: z
    .string()
    .regex(/^(\d{16})?$/, "Nomor NIK/KTP harus 16 digit angka jika diisi")
    .optional()
    .default(""),
  jk: z.enum(["L", "P"]),
  tmpLahir: z.string().max(20).optional().default(""),
  tglLahir: z
    .string()
    .min(10, "Format tanggal lahir harus YYYY-MM-DD")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
  alamat: z
    .string()
    .min(3, "Alamat minimal 3 karakter")
    .max(200, "Alamat maksimal 200 karakter"),
  golDarah: z.enum(["A", "B", "AB", "O", "-"]).default("-"),
  noTlp: z.string().max(40).optional().default(""),
  kdPj: z.string().min(1, "Pilih jenis penjamin/pembayaran").default("A01"),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

export const visitSchema = z.object({
  noRkmMedis: z.string().min(1, "Pilih pasien terlebih dahulu"),
  kdPoli: z.string().min(1, "Pilih poliklinik tujuan"),
  kdDokter: z.string().min(1, "Pilih dokter penanggung jawab"),
  kdPj: z.string().min(1, "Pilih metode pembayaran / penjamin"),
  tglRegistrasi: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal registrasi tidak valid")
    .optional(),
  biayaReg: z.number().min(0).optional(),
});

export type VisitFormValues = z.infer<typeof visitSchema>;
