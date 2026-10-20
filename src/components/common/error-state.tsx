import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-100 bg-rose-50/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900">{title}</h3>
      <p className="mt-1 text-sm text-rose-700 max-w-md mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="sm">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

