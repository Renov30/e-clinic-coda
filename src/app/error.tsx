"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/common/error-state";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Root application error caught by boundary", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f1f3f6] p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <ErrorState
          title="Terjadi Kesalahan pada Aplikasi"
          message={error.message || "Sistem mengalami kendala saat memuat halaman."}
          onRetry={reset}
        />
      </div>
    </div>
  );
}

