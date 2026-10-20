"use server";

import { pharmacyService } from "./service";
import { CreateSaleDTO } from "./types";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canProcessPharmacySales } from "@/lib/auth/permissions";

export async function searchMedicinesAction(keyword?: string) {
  return await pharmacyService.searchMedicines(keyword);
}

export async function getRecentSalesAction() {
  return await pharmacyService.getRecentSales();
}

export async function getSaleReceiptAction(notaJual: string) {
  const receipt = await pharmacyService.getSaleReceipt(notaJual);
  if (!receipt) {
    return { success: false, error: "Data resi tidak ditemukan" };
  }
  return { success: true, data: receipt };
}

export async function processDrugSaleAction(dto: CreateSaleDTO) {
  const session = await getSession();
  if (!canProcessPharmacySales(session?.role)) {
    return {
      success: false,
      error: "Akses ditolak: Hanya Staf Farmasi dan Administrator yang berhak memproses penjualan obat.",
    };
  }

  const result = await pharmacyService.processDrugSale(dto);
  if (result.success) {
    revalidatePath("/pharmacy");
    revalidatePath("/");
  }
  return result;
}
