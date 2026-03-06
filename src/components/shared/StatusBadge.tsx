"use client";

import { cn, getStatusColor, getSeverityColor } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  variant?: "status" | "severity";
  className?: string;
}

export default function StatusBadge({
  label,
  variant = "status",
  className,
}: StatusBadgeProps) {
  const colorFn = variant === "severity" ? getSeverityColor : getStatusColor;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorFn(label),
        className
      )}
    >
      {label.charAt(0).toUpperCase() + label.slice(1).replace("_", " ")}
    </span>
  );
}
