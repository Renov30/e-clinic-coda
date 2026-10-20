import React from "react";
import { EmptyState } from "@/components/common/empty-state";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PaymentsPage() {
  return (
    <div className="py-6">
      <EmptyState
        icon={<CreditCard className="h-6 w-6 text-blue-600" />}
        title="Kasir & Pembayaran"
        description="Modul kasir dan kuitansi pembayaran rawat jalan serta farmasi obat luar (Tahap 3)."
      />
    </div>
  );
}
