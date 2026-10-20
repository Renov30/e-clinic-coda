import { query } from "@/lib/db";
import { User, UserWithPassword, CreateUserDTO, UpdateUserDTO } from "./types";
import { hashPassword } from "@/lib/auth/password";
import { logger } from "@/lib/logger";

interface UserDbRow {
  id: string;
  username: string;
  nama_lengkap: string;
  email: string;
  password_hash: string;
  role: "admin" | "dokter" | "pendaftaran" | "farmasi";
  status: "aktif" | "nonaktif";
  created_at: string;
  updated_at?: string;
}

export class UserRepository {
  async ensureTableExists(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS coda_users (
          id varchar(36) NOT NULL,
          username varchar(50) NOT NULL,
          nama_lengkap varchar(100) NOT NULL,
          email varchar(100) NOT NULL DEFAULT '',
          password_hash varchar(255) NOT NULL,
          role enum('admin','dokter','pendaftaran','farmasi') NOT NULL DEFAULT 'admin',
          status enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
          created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Cek apakah tabel kosong, jika iya seed akun default
      const rows = await query<{ count: number }>("SELECT COUNT(*) as count FROM coda_users");
      if (rows[0]?.count === 0) {
        const adminPass = await hashPassword("admin123");
        const docPass = await hashPassword("shin123");
        const regPass = await hashPassword("reg123");
        const farmPass = await hashPassword("farmasi123");

        await query(`
          INSERT INTO coda_users (id, username, nama_lengkap, email, password_hash, role, status) VALUES
          ('usr-001', 'admin', 'Administrator Utama', 'admin@smile360clinic.com', ?, 'admin', 'aktif'),
          ('usr-002', 'dr.shin', 'Dr. Shin Tamura', 'dr.shin@smile360clinic.com', ?, 'dokter', 'aktif'),
          ('usr-003', 'registrasi', 'Petugas Pendaftaran', 'frontdesk@smile360clinic.com', ?, 'pendaftaran', 'aktif'),
          ('usr-004', 'apotek', 'Petugas Farmasi & Kasir', 'farmasi@smile360clinic.com', ?, 'farmasi', 'aktif')
        `, [adminPass, docPass, regPass, farmPass]);

        logger.info("Akun bawaan sistem berhasil diinisialisasi");
      }
    } catch (err) {
      logger.error("Gagal memastikan tabel coda_users", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async getUsers(): Promise<User[]> {
    await this.ensureTableExists();
    try {
      const rows = await query<UserDbRow>(
        `SELECT id, username, nama_lengkap, email, role, status, 
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
         FROM coda_users
         ORDER BY created_at ASC`
      );
      return rows.map((r) => ({
        id: r.id,
        username: r.username,
        namaLengkap: r.nama_lengkap,
        email: r.email,
        role: r.role,
        status: r.status,
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  }

  async getUserByUsername(username: string): Promise<UserWithPassword | null> {
    await this.ensureTableExists();
    try {
      const rows = await query<UserDbRow>(
        `SELECT id, username, nama_lengkap, email, password_hash, role, status, 
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
         FROM coda_users
         WHERE username = ? LIMIT 1`,
        [username]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        username: r.username,
        namaLengkap: r.nama_lengkap,
        email: r.email,
        passwordHash: r.password_hash,
        role: r.role,
        status: r.status,
        createdAt: r.created_at,
      };
    } catch {
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    await this.ensureTableExists();
    try {
      const rows = await query<UserDbRow>(
        `SELECT id, username, nama_lengkap, email, role, status, 
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
         FROM coda_users
         WHERE id = ? LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        username: r.username,
        namaLengkap: r.nama_lengkap,
        email: r.email,
        role: r.role,
        status: r.status,
        createdAt: r.created_at,
      };
    } catch {
      return null;
    }
  }

  async createUser(dto: CreateUserDTO): Promise<User> {
    await this.ensureTableExists();
    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = await hashPassword(dto.password);

    await query(
      `INSERT INTO coda_users (id, username, nama_lengkap, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, ?, 'aktif')`,
      [id, dto.username.toLowerCase().trim(), dto.namaLengkap, dto.email || "", passwordHash, dto.role]
    );

    return {
      id,
      username: dto.username.toLowerCase().trim(),
      namaLengkap: dto.namaLengkap,
      email: dto.email || "",
      role: dto.role,
      status: "aktif",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
  }

  async updateUser(id: string, dto: UpdateUserDTO): Promise<User | null> {
    await this.ensureTableExists();
    const currentUser = await this.getUserById(id);
    if (!currentUser) return null;

    const newNama = dto.namaLengkap ?? currentUser.namaLengkap;
    const newEmail = dto.email ?? currentUser.email;
    const newRole = dto.role ?? currentUser.role;
    const newStatus = dto.status ?? currentUser.status;

    await query(
      `UPDATE coda_users 
       SET nama_lengkap = ?, email = ?, role = ?, status = ?
       WHERE id = ?`,
      [newNama, newEmail, newRole, newStatus, id]
    );

    return {
      ...currentUser,
      namaLengkap: newNama,
      email: newEmail,
      role: newRole,
      status: newStatus,
    };
  }

  async toggleStatus(id: string): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    const nextStatus = user.status === "aktif" ? "nonaktif" : "aktif";
    await query("UPDATE coda_users SET status = ? WHERE id = ?", [nextStatus, id]);
    return { ...user, status: nextStatus };
  }

  async resetPassword(id: string, newPasswordPlain: string): Promise<boolean> {
    const hash = await hashPassword(newPasswordPlain);
    await query("UPDATE coda_users SET password_hash = ? WHERE id = ?", [hash, id]);
    return true;
  }

  async deleteUser(id: string): Promise<boolean> {
    await query("DELETE FROM coda_users WHERE id = ?", [id]);
    return true;
  }
}

export const userRepository = new UserRepository();

