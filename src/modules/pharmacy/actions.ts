"use server";

import { pharmacyService } from "./service";
import { CreateSaleDTO } from "./types";
import { revalidatePath } from "next/cache";

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
  const result = await pharmacyService.processDrugSale(dto);
  if (result.success) {
    revalidatePath("/pharmacy");
    revalidatePath("/");
  }
  return result;
}

