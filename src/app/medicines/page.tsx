import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isRouteAllowed } from "@/lib/auth/permissions";
import { medicineService } from "@/modules/medicines/service";
import { MedicineManagement } from "@/components/medicines/medicine-management";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Data Obat & Stok Apotek | e-clinic-coda",
  description: "Manajemen katalog obat, harga modal, harga jual, dan stok depo farmasi klinik",
};

export default async function MedicinesPage() {
  const session = await getSession();
  if (
    !session ||
    !isRouteAllowed(session.role, "/medicines", session.permissions)
  ) {
    redirect("/");
  }

  const [medicines, categories, units, adjustments] = await Promise.all([
    medicineService.getMedicines(),
    medicineService.getCategories(),
    medicineService.getUnits(),
    medicineService.getStockAdjustments(undefined, 50),
  ]);

  return (
    <MedicineManagement
      initialMedicines={medicines}
      categories={categories}
      units={units}
      initialAdjustments={adjustments}
    />
  );
}
