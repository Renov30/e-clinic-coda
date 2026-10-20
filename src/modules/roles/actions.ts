"use server";

import { roleService } from "./service";
import { CreateRoleDTO, UpdateRoleDTO } from "./types";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/auth/permissions";

export async function getRolesAction() {
  return await roleService.getRoles();
}

export async function createRoleAction(dto: CreateRoleDTO) {
  const session = await getSession();
  if (!canManageUsers(session?.role)) {
    return {
      success: false,
      error: "Akses ditolak: Hanya Administrator yang berhak membuat peran baru.",
    };
  }

  const result = await roleService.createRole(dto);
  if (result.success) {
    revalidatePath("/roles");
    revalidatePath("/users");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function updateRoleAction(id: string, dto: UpdateRoleDTO) {
  const session = await getSession();
  if (!canManageUsers(session?.role)) {
    return {
      success: false,
      error: "Akses ditolak: Hanya Administrator yang berhak mengubah wewenang peran.",
    };
  }

  const result = await roleService.updateRole(id, dto);
  if (result.success) {
    revalidatePath("/roles");
    revalidatePath("/users");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function deleteRoleAction(id: string) {
  const session = await getSession();
  if (!canManageUsers(session?.role)) {
    return {
      success: false,
      error: "Akses ditolak: Hanya Administrator yang berhak menghapus peran.",
    };
  }

  const result = await roleService.deleteRole(id);
  if (result.success) {
    revalidatePath("/roles");
    revalidatePath("/users");
    revalidatePath("/", "layout");
  }
  return result;
}

