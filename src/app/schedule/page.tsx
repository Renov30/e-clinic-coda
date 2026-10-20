import React from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SchedulePage() {
  return (
    <div className="py-6">
      <EmptyState
        icon={<Calendar className="h-6 w-6 text-blue-600" />}
        title="Modul Jadwal Dokter & Poliklinik"
        description="Jadwal praktik dokter akan disinkronkan dengan data jadwal poliklinik SIMKhanza pada tahap integrasi berikutnya."
      />
    </div>
  );
}
