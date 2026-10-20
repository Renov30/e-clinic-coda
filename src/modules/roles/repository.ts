import { query, withTransaction } from "@/lib/db";
import { RoleWithPermissions, CreateRoleDTO, UpdateRoleDTO } from "./types";
import { logger } from "@/lib/logger";

interface RoleDbRow {
  id: string;
  name: string;
  label: string;
  description: string;
  is_system: number;
  user_count: number;
  created_at: string;
  updated_at?: string;
}

export class RoleRepository {
  async ensureTablesExist(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS coda_roles (
          id varchar(36) NOT NULL,
          name varchar(50) NOT NULL,
          label varchar(100) NOT NULL,
          description varchar(255) DEFAULT '',
          is_system tinyint(1) NOT NULL DEFAULT 0,
          created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS coda_role_permissions (
          role_id varchar(36) NOT NULL,
          permission_key varchar(100) NOT NULL,
          PRIMARY KEY (role_id, permission_key),
          KEY role_id (role_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (err) {
      logger.error("Gagal memastikan tabel coda_roles ada", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async getRoles(): Promise<RoleWithPermissions[]> {
    await this.ensureTablesExist();

    try {
      const rolesSql = `
        SELECT r.id, r.name, r.label, r.description, r.is_system, 
               r.created_at, r.updated_at,
               COUNT(u.id) as user_count
        FROM coda_roles r
        LEFT JOIN coda_users u ON r.name = u.role
        GROUP BY r.id, r.name, r.label, r.description, r.is_system, r.created_at, r.updated_at
        ORDER BY r.is_system DESC, r.name ASC
      `;
      const roleRows = await query<RoleDbRow>(rolesSql);

      const permsSql = `
        SELECT role_id, permission_key FROM coda_role_permissions
      `;
      const permRows = await query<{ role_id: string; permission_key: string }>(permsSql);

      const permsMap = new Map<string, string[]>();
      for (const p of permRows) {
        const list = permsMap.get(p.role_id) || [];
        list.push(p.permission_key);
        permsMap.set(p.role_id, list);
      }

      return roleRows.map((r) => ({
        id: r.id,
        name: r.name,
        label: r.label,
        description: r.description || "",
        isSystem: Boolean(r.is_system),
        userCount: Number(r.user_count || 0),
        permissions: permsMap.get(r.id) || [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      logger.error("Gagal mengambil data peran", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  async getRoleById(id: string): Promise<RoleWithPermissions | null> {
    const roles = await this.getRoles();
    return roles.find((r) => r.id === id) || null;
  }

  async getRoleByName(name: string): Promise<RoleWithPermissions | null> {
    const roles = await this.getRoles();
    return roles.find((r) => r.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async createRole(dto: CreateRoleDTO): Promise<RoleWithPermissions> {
    await this.ensureTablesExist();

    const cleanName = dto.name.toLowerCase().trim();
    const roleId = `role-${cleanName}-${Date.now().toString(36)}`;

    return await withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO coda_roles (id, name, label, description, is_system) VALUES (?, ?, ?, ?, 0)`,
        [roleId, cleanName, dto.label.trim(), dto.description?.trim() || ""]
      );

      if (dto.permissions && dto.permissions.length > 0) {
        for (const perm of dto.permissions) {
          await conn.execute(
            `INSERT IGNORE INTO coda_role_permissions (role_id, permission_key) VALUES (?, ?)`,
            [roleId, perm]
          );
        }
      }

      return {
        id: roleId,
        name: cleanName,
        label: dto.label.trim(),
        description: dto.description?.trim() || "",
        isSystem: false,
        userCount: 0,
        permissions: dto.permissions || [],
        createdAt: new Date().toISOString(),
      };
    });
  }

  async updateRole(id: string, dto: UpdateRoleDTO): Promise<RoleWithPermissions> {
    await this.ensureTablesExist();

    const existing = await this.getRoleById(id);
    if (!existing) {
      throw new Error("Peran tidak ditemukan.");
    }

    return await withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE coda_roles SET label = ?, description = ? WHERE id = ?`,
        [dto.label.trim(), dto.description?.trim() || "", id]
      );

      // Refresh permissions
      await conn.execute(`DELETE FROM coda_role_permissions WHERE role_id = ?`, [id]);

      if (dto.permissions && dto.permissions.length > 0) {
        for (const perm of dto.permissions) {
          await conn.execute(
            `INSERT INTO coda_role_permissions (role_id, permission_key) VALUES (?, ?)`,
            [id, perm]
          );
        }
      }

      return {
        ...existing,
        label: dto.label.trim(),
        description: dto.description?.trim() || "",
        permissions: dto.permissions,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async deleteRole(id: string): Promise<void> {
    await this.ensureTablesExist();

    const existing = await this.getRoleById(id);
    if (!existing) {
      throw new Error("Peran tidak ditemukan.");
    }

    if (existing.isSystem) {
      throw new Error("Peran bawaan sistem tidak dapat dihapus.");
    }

    if (existing.userCount > 0) {
      throw new Error(
        `Peran "${existing.label}" tidak dapat dihapus karena masih digunakan oleh ${existing.userCount} pengguna.`
      );
    }

    await withTransaction(async (conn) => {
      await conn.execute(`DELETE FROM coda_role_permissions WHERE role_id = ?`, [id]);
      await conn.execute(`DELETE FROM coda_roles WHERE id = ?`, [id]);
    });
  }
}

export const roleRepository = new RoleRepository();

