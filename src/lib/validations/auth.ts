import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(5, "Password minimal 5 karakter"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username hanya boleh huruf, angka, titik, strip, atau underscore"),
  namaLengkap: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "dokter", "pendaftaran", "farmasi"], {
    message: "Pilih peran pengguna yang valid",
  }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  namaLengkap: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  role: z.enum(["admin", "dokter", "pendaftaran", "farmasi"]),
  status: z.enum(["aktif", "nonaktif"]),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});
