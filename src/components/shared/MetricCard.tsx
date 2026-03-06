"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  status?: "normal" | "warning" | "critical";
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  status = "normal",
  className,
}: MetricCardProps) {
  const statusStyles = {
    normal: "border-l-success-500",
    warning: "border-l-warning-500",
    critical: "border-l-danger-500",
  };

  const StatusIcon =
    status === "critical"
      ? AlertTriangle
      : status === "warning"
      ? AlertTriangle
      : CheckCircle;

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 p-4",
        statusStyles[status],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className="ml-3 flex flex-col items-end gap-1">
          {Icon && (
            <div
              className={cn(
                "p-2 rounded-lg",
                status === "critical"
                  ? "bg-danger-50 text-danger-600"
                  : status === "warning"
                  ? "bg-warning-50 text-warning-600"
                  : "bg-primary-50 text-primary-600"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-sm">
          {change > 0 ? (
            <TrendingUp className="h-4 w-4 text-danger-500" />
          ) : change < 0 ? (
            <TrendingDown className="h-4 w-4 text-success-500" />
          ) : (
            <Minus className="h-4 w-4 text-gray-400" />
          )}
          <span
            className={cn(
              "font-medium",
              change > 0
                ? "text-danger-600"
                : change < 0
                ? "text-success-600"
                : "text-gray-500"
            )}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-gray-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
