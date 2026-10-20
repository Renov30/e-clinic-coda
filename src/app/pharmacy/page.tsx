import React from "react";
import { PharmacyPos } from "@/components/pharmacy/pharmacy-pos";
import { pharmacyService } from "@/modules/pharmacy/service";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Penjualan Obat Luar | e-clinic-coda",
  description: "Kasir dan transaksi penjualan obat bebas serta resep luar apotek klinik",
};

export default async function PharmacyPage() {
  const [medicines, recentSales, clinicConfig] = await Promise.all([
    pharmacyService.searchMedicines(""),
    pharmacyService.getRecentSales(),
    clinicConfigService.getClinicProfile(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Penjualan Obat Luar (Farmasi)
          </h2>
          <p className="text-sm text-slate-500">
            Kasir apotek, transaksi obat bebas/resep luar, dan pencetakan nota kuitansi resmi.
          </p>
        </div>
      </div>

      <PharmacyPos
        initialMedicines={medicines}
        initialSales={recentSales}
        clinicConfig={clinicConfig}
      />
    </div>
  );
}

