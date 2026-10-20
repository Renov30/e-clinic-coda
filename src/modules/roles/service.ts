import { roleRepository, RoleRepository } from "./repository";
import { RoleWithPermissions, CreateRoleDTO, UpdateRoleDTO } from "./types";
import { recordAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";

export class RoleService {
  constructor(private repo: RoleRepository = roleRepository) {}

  async getRoles(): Promise<RoleWithPermissions[]> {
    return await this.repo.getRoles();
  }

  async getRoleById(id: string): Promise<RoleWithPermissions | null> {
    return await this.repo.getRoleById(id);
  }

  async createRole(dto: CreateRoleDTO): Promise<{
    success: boolean;
    data?: RoleWithPermissions;
    error?: string;
  }> {
    try {
      const name = dto.name.toLowerCase().trim();
      if (!name || name.length < 3) {
        return { success: false, error: "Kode peran minimal 3 karakter." };
      }

      if (!/^[a-z0-9_-]+$/.test(name)) {
        return {
          success: false,
          error: "Kode peran hanya boleh menggunakan huruf kecil, angka, garis bawah, dan strip.",
        };
      }

      if (!dto.label || dto.label.trim().length < 3) {
        return { success: false, error: "Nama peran minimal 3 karakter." };
      }

      const existing = await this.repo.getRoleByName(name);
      if (existing) {
        return { success: false, error: `Kode peran "${name}" sudah digunakan.` };
      }

      const role = await this.repo.createRole(dto);

      await recordAuditEvent({
        action: "CREATE_ROLE",
        resource: "ROLE",
        resourceId: role.id,
        status: "SUCCESS",
        details: { name: role.name, label: role.label, permissionsCount: role.permissions.length },
      });

      return { success: true, data: role };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menambahkan peran baru.";
      logger.error("Error creating role", { error: msg });
      return { success: false, error: msg };
    }
  }

  async updateRole(
    id: string,
    dto: UpdateRoleDTO
  ): Promise<{
    success: boolean;
    data?: RoleWithPermissions;
    error?: string;
  }> {
    try {
      if (!dto.label || dto.label.trim().length < 3) {
        return { success: false, error: "Nama peran minimal 3 karakter." };
      }

      const role = await this.repo.updateRole(id, dto);

      await recordAuditEvent({
        action: "UPDATE_ROLE",
        resource: "ROLE",
        resourceId: role.id,
        status: "SUCCESS",
        details: { name: role.name, label: role.label, permissionsCount: role.permissions.length },
      });

      return { success: true, data: role };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui peran.";
      logger.error("Error updating role", { error: msg });
      return { success: false, error: msg };
    }
  }

  async deleteRole(id: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await this.repo.deleteRole(id);

      await recordAuditEvent({
        action: "DELETE_ROLE",
        resource: "ROLE",
        resourceId: id,
        status: "SUCCESS",
      });

      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus peran.";
      logger.error("Error deleting role", { error: msg });
      return { success: false, error: msg };
    }
  }
}

export const roleService = new RoleService();

