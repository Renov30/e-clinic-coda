import React from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SchedulePage() {
  return (
    <div className="py-6">
      <EmptyState
        icon={<Calendar className="h-6 w-6 text-blue-600" />}
        title="Jadwal Praktik Dokter & Poliklinik"
        description="Kelola jadwal jam praktik dokter dan ketersediaan layanan poliklinik."
      />
    </div>
  );
}
