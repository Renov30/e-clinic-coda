import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { CreditCard } from "lucide-react";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const config = await clinicConfigService.getClinicProfile();

  return (
    <AppShell clinicName={config.namaKlinik} pageTitle="Payments">
      <div className="py-6">
        <EmptyState
          icon={<CreditCard className="h-6 w-6 text-blue-600" />}
          title="Kasir & Pembayaran"
          description="Modul kasir dan kuitansi pembayaran rawat jalan serta farmasi obat luar (Tahap 3)."
        />
      </div>
    </AppShell>
  );
}
