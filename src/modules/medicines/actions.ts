"use server";

import { medicineService } from "./service";
import {
  CreateMedicineDTO,
  UpdateMedicineDTO,
  AdjustStockDTO,
} from "./types";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManageMedicines } from "@/lib/auth/permissions";

export async function getMedicinesAction(filter?: {
  keyword?: string;
  kategori?: string;
  stockStatus?: "all" | "safe" | "low" | "out";
  status?: "all" | "active" | "inactive";
}) {
  return await medicineService.getMedicines(filter);
}

export async function getNextKodeBrngAction() {
  return await medicineService.getNextKodeBrng();
}

export async function createMedicineAction(dto: CreateMedicineDTO) {
  const session = await getSession();
  if (!canManageMedicines(session?.role, session?.permissions)) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki wewenang untuk menambah data obat.",
    };
  }

  const result = await medicineService.createMedicine(dto, session?.username);
  if (result.success) {
    revalidatePath("/medicines");
    revalidatePath("/pharmacy");
    revalidatePath("/");
  }
  return result;
}

export async function updateMedicineAction(
  kodeBrng: string,
  dto: UpdateMedicineDTO
) {
  const session = await getSession();
  if (!canManageMedicines(session?.role, session?.permissions)) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki wewenang untuk mengubah data obat.",
    };
  }

  const result = await medicineService.updateMedicine(kodeBrng, dto);
  if (result.success) {
    revalidatePath("/medicines");
    revalidatePath("/pharmacy");
    revalidatePath("/");
  }
  return result;
}

export async function toggleMedicineStatusAction(
  kodeBrng: string,
  newStatus: "0" | "1"
) {
  const session = await getSession();
  if (!canManageMedicines(session?.role, session?.permissions)) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki wewenang untuk mengubah status obat.",
    };
  }

  const result = await medicineService.toggleStatus(kodeBrng, newStatus);
  if (result.success) {
    revalidatePath("/medicines");
    revalidatePath("/pharmacy");
    revalidatePath("/");
  }
  return result;
}

export async function adjustStockAction(dto: AdjustStockDTO) {
  const session = await getSession();
  if (!canManageMedicines(session?.role, session?.permissions)) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki wewenang untuk menyesuaikan stok obat.",
    };
  }

  const result = await medicineService.adjustStock(dto, session?.username);
  if (result.success) {
    revalidatePath("/medicines");
    revalidatePath("/pharmacy");
    revalidatePath("/");
  }
  return result;
}

export async function getCategoriesAction() {
  return await medicineService.getCategories();
}

export async function getUnitsAction() {
  return await medicineService.getUnits();
}

export async function createUnitAction(kodeSat: string, satuan: string) {
  const session = await getSession();
  if (!canManageMedicines(session?.role, session?.permissions)) {
    return {
      success: false,
      error: "Akses ditolak: Anda tidak memiliki wewenang untuk menambah satuan.",
    };
  }

  const result = await medicineService.createUnit(kodeSat, satuan);
  if (result.success) {
    revalidatePath("/medicines");
  }
  return result;
}

export async function getStockAdjustmentsAction(kodeBrng?: string) {
  return await medicineService.getStockAdjustments(kodeBrng);
}

export async function getStockSummaryAction() {
  return await medicineService.getStockSummary();
}

