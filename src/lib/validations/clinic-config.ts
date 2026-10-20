import { z } from "zod";

export const clinicProfileSchema = z.object({
  namaKlinik: z
    .string()
    .min(3, "Nama klinik minimal 3 karakter")
    .max(120, "Nama klinik maksimal 120 karakter"),
  alamat: z
    .string()
    .min(5, "Alamat klinik minimal 5 karakter")
    .max(255, "Alamat klinik maksimal 255 karakter"),
  kotaKabupaten: z.string().max(80).default(""),
  propinsi: z.string().max(80).default(""),
  telepon: z
    .string()
    .min(6, "Nomor telepon minimal 6 karakter")
    .max(30, "Nomor telepon maksimal 30 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(100, "Email maksimal 100 karakter"),
  logoUrl: z.string().max(255).optional().default(""),
  izinOperasional: z.string().max(100).optional().default(""),
  catatanKuitansi: z.string().max(300).optional().default(""),
});

export type ClinicProfileFormValues = z.infer<typeof clinicProfileSchema>;

