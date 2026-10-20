"use server";

import { clinicConfigService } from "./service";
import { UpdateClinicConfigDTO } from "./types";
import { revalidatePath } from "next/cache";

export async function getClinicConfigAction() {
  return await clinicConfigService.getClinicProfile();
}

export async function updateClinicConfigAction(formData: UpdateClinicConfigDTO) {
  const result = await clinicConfigService.updateClinicProfile(formData);
  if (result.success) {
    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/appointments");
  }
  return result;
}

