"use server";

import { patientRegistrationService } from "./service";
import { CreatePatientDTO, CreateVisitDTO } from "./types";
import { revalidatePath } from "next/cache";

export async function searchPatientsAction(search?: string) {
  return await patientRegistrationService.searchPatients(search);
}

export async function getVisitsTodayAction(dateStr?: string) {
  return await patientRegistrationService.getVisitsToday(dateStr);
}

export async function getRegistrationMasterDataAction() {
  return await patientRegistrationService.getMasterFormData();
}

export async function registerPatientAction(dto: CreatePatientDTO) {
  const result = await patientRegistrationService.registerPatient(dto);
  if (result.success) {
    revalidatePath("/patients");
    revalidatePath("/");
  }
  return result;
}

export async function registerVisitAction(dto: CreateVisitDTO) {
  const result = await patientRegistrationService.registerVisit(dto);
  if (result.success) {
    revalidatePath("/patients");
    revalidatePath("/appointments");
    revalidatePath("/");
  }
  return result;
}

