"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = "md",
  color = "primary",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizeStyles = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const colorStyles = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  };

  const autoColor =
    percentage > 90 ? "danger" : percentage > 70 ? "warning" : color;

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-medium text-gray-600">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-medium text-gray-500">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full", sizeStyles[size])} style={{ backgroundColor: "var(--bg-muted, #26273a)" }}>
        <div
          className={cn(
            "rounded-full transition-all duration-500",
            sizeStyles[size],
            colorStyles[autoColor]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
