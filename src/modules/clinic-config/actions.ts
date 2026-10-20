"use server";

import { clinicConfigService } from "./service";
import { UpdateClinicConfigDTO } from "./types";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManageSettings } from "@/lib/auth/permissions";

export async function getClinicConfigAction() {
  return await clinicConfigService.getClinicProfile();
}

export async function updateClinicConfigAction(formData: UpdateClinicConfigDTO) {
  const session = await getSession();
  if (!canManageSettings(session?.role)) {
    return {
      success: false,
      error: "Akses ditolak: Hanya Administrator yang berhak mengubah identitas dan pengaturan instansi.",
    };
  }

  const result = await clinicConfigService.updateClinicProfile(formData);
  if (result.success) {
    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/appointments");
  }
  return result;
}
