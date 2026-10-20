import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { MessageSquare } from "lucide-react";
import { clinicConfigService } from "@/modules/clinic-config/service";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const config = await clinicConfigService.getClinicProfile();

  return (
    <AppShell clinicName={config.namaKlinik} pageTitle="Messages">
      <div className="py-6">
        <EmptyState
          icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
          title="Notifikasi & Komunikasi Pasien"
          description="Fitur reminder WhatsApp / SMS janji temu dan follow up pasien."
        />
      </div>
    </AppShell>
  );
}
