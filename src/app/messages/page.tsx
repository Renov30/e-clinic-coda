import React from "react";
import { EmptyState } from "@/components/common/empty-state";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <div className="py-6">
      <EmptyState
        icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
        title="Notifikasi & Komunikasi Pasien"
        description="Fitur reminder WhatsApp / SMS janji temu dan follow up pasien."
      />
    </div>
  );
}
