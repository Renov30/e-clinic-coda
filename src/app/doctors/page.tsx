import React from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Stethoscope } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DoctorsPage() {
  return (
    <div className="py-6">
      <EmptyState
        icon={<Stethoscope className="h-6 w-6 text-blue-600" />}
        title="Daftar Dokter & Tenaga Medis"
        description="Kelola informasi dokter, nomor SIP, spesialisasi, dan poliklinik tugas."
      />
    </div>
  );
}
