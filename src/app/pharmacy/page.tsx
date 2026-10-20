import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isRouteAllowed } from "@/lib/auth/permissions";
import { PharmacyPos } from "@/components/pharmacy/pharmacy-pos";
import { pharmacyService } from "@/modules/pharmacy/service";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Penjualan Obat Luar | e-clinic-coda",
  description: "Kasir dan transaksi penjualan obat bebas serta resep luar apotek klinik",
};

export default async function PharmacyPage() {
  const session = await getSession();
  if (
    !session ||
    !isRouteAllowed(session.role, "/pharmacy", session.permissions)
  ) {
    redirect("/");
  }

  const [medicines, recentSales, clinicConfig] = await Promise.all([
    pharmacyService.searchMedicines(""),
    pharmacyService.getRecentSales(),
    clinicConfigService.getClinicProfile(),
  ]);

  return (
    <PharmacyPos
      initialMedicines={medicines}
      initialSales={recentSales}
      clinicConfig={clinicConfig}
    />
  );
}
