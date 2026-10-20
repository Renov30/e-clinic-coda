import React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "confirmed"
  | "completed"
  | "cancelled"
  | "pending"
  | "in_progress"
  | "draft";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const normalized = (type || status).toLowerCase().replace(/[\s-]/g, "_");

  let colorClasses = "text-slate-600 bg-slate-50";

  if (["confirmed", "selesai", "sudah", "completed", "paid", "lunas"].includes(normalized)) {
    colorClasses = "text-emerald-600 bg-emerald-50/70";
  } else if (["cancelled", "batal", "void"].includes(normalized)) {
    colorClasses = "text-rose-500 bg-rose-50/70";
  } else if (["pending", "menunggu", "antri", "registered"].includes(normalized)) {
    colorClasses = "text-amber-600 bg-amber-50/70";
  } else if (["in_progress", "pemeriksaan", "proses"].includes(normalized)) {
    colorClasses = "text-blue-600 bg-blue-50/70";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tracking-wide",
        colorClasses,
        className
      )}
    >
      {status}
    </span>
  );
}

