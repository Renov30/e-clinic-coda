import React from "react";
import { LoadingState } from "@/components/common/loading-state";

export default function Loading() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <LoadingState
        message="Memuat modul..."
        description="Menyiapkan data antarmuka klinik..."
      />
    </div>
  );
}
