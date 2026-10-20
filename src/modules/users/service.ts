import { userRepository, UserRepository } from "./repository";
import { User, CreateUserDTO, UpdateUserDTO } from "./types";
import { comparePassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie, deleteSessionCookie, getSession } from "@/lib/auth/session";
import { loginSchema, createUserSchema, updateUserSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { recordAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { query } from "@/lib/db";

export class UserService {
  constructor(private repo: UserRepository = userRepository) {}

  async login(usernameInput: string, passwordInput: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    const validation = loginSchema.safeParse({ username: usernameInput, password: passwordInput });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    try {
      const user = await this.repo.getUserByUsername(usernameInput.toLowerCase().trim());
      if (!user) {
        logger.warn("Percobaan login dengan username tidak dikenal", { username: usernameInput });
        return { success: false, error: "Username atau password salah." };
      }

      if (user.status !== "aktif") {
        logger.warn("Percobaan login pada akun nonaktif", { username: usernameInput });
        return { success: false, error: "Akun Anda berstatus nonaktif. Silakan hubungi administrator." };
      }

      const isMatch = await comparePassword(passwordInput, user.passwordHash);
      if (!isMatch) {
        logger.warn("Password salah saat login", { username: usernameInput });
        return { success: false, error: "Username atau password salah." };
      }

      // Ambil daftar permissions untuk role pengguna
      let permissions: string[] = [];
      try {
        const permRows = await query<{ permission_key: string }>(
          `SELECT rp.permission_key 
           FROM coda_role_permissions rp 
           JOIN coda_roles r ON rp.role_id = r.id 
           WHERE r.name = ?`,
          [user.role]
        );
        permissions = permRows.map((p) => p.permission_key);
      } catch {
        // Abaikan jika query gagal
      }

      // Generate session token & simpan di httpOnly cookie
      const token = await createSessionToken({
        userId: user.id,
        username: user.username,
        namaLengkap: user.namaLengkap,
        role: user.role,
        permissions,
      });

      await setSessionCookie(token);

      await recordAuditEvent({
        action: "USER_LOGIN",
        resource: "AUTH",
        userId: user.id,
        username: user.username,
        status: "SUCCESS",
        details: { role: user.role },
      });

      const { passwordHash: _ignored, ...safeUser } = user;
      void _ignored;
      return { success: true, user: safeUser };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kendala saat proses masuk sistem.";
      logger.error("Error pada proses login", { error: msg });
      return { success: false, error: msg };
    }
  }

  async logout(): Promise<void> {
    const session = await getSession();
    if (session) {
      await recordAuditEvent({
        action: "USER_LOGOUT",
        resource: "AUTH",
        userId: session.userId,
        username: session.username,
        status: "SUCCESS",
      });
    }
    await deleteSessionCookie();
  }

  async getUsers(): Promise<User[]> {
    return await this.repo.getUsers();
  }

  async createUser(dto: CreateUserDTO): Promise<{
    success: boolean;
    data?: User;
    error?: string;
  }> {
    const validation = createUserSchema.safeParse(dto);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    try {
      const existing = await this.repo.getUserByUsername(dto.username.toLowerCase().trim());
      if (existing) {
        return { success: false, error: `Username '${dto.username}' sudah digunakan.` };
      }

      const created = await this.repo.createUser(validation.data);

      await recordAuditEvent({
        action: "CREATE_USER",
        resource: "USER_MANAGEMENT",
        resourceId: created.id,
        status: "SUCCESS",
        details: { username: created.username, role: created.role },
      });

      return { success: true, data: created };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menambahkan user baru";
      return { success: false, error: msg };
    }
  }

  async updateUser(id: string, dto: UpdateUserDTO): Promise<{
    success: boolean;
    data?: User;
    error?: string;
  }> {
    const validation = updateUserSchema.safeParse(dto);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    try {
      const updated = await this.repo.updateUser(id, validation.data);
      if (!updated) {
        return { success: false, error: "User tidak ditemukan" };
      }

      await recordAuditEvent({
        action: "UPDATE_USER",
        resource: "USER_MANAGEMENT",
        resourceId: id,
        status: "SUCCESS",
        details: { role: updated.role, status: updated.status },
      });

      return { success: true, data: updated };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui user";
      return { success: false, error: msg };
    }
  }

  async toggleStatus(id: string): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const updated = await this.repo.toggleStatus(id);
      if (!updated) return { success: false, error: "User tidak ditemukan" };
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Gagal mengubah status" };
    }
  }

  async resetPassword(id: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const validation = resetPasswordSchema.safeParse({ newPassword: newPass });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }
    try {
      await this.repo.resetPassword(id, newPass);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Gagal reset password" };
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repo.deleteUser(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus user" };
    }
  }
}

export const userService = new UserService();
