import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  description?: string;
}

export function LoadingState({
  message = "Memuat data...",
  description = "Mohon tunggu sebentar selagi sistem mengambil informasi.",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 animate-spin">
        <Loader2 className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-800">{message}</h4>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}

