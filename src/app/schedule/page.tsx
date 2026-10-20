import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { EmptyState } from "@/components/common/empty-state";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await getSession();
  if (!session || session.role === "farmasi") {
    redirect("/");
  }
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
