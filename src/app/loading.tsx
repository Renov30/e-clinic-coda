import React from "react";
import { LoadingState } from "@/components/common/loading-state";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f1f3f6]">
      <LoadingState
        message="Memuat e-clinic-coda..."
        description="Menyiapkan data antarmuka klinik..."
      />
    </div>
  );
}

