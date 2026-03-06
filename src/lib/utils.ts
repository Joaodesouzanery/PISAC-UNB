import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "online":
    case "excellent":
    case "good":
    case "normal":
    case "completed":
      return "text-success-600 bg-success-50 border-success-200";
    case "warning":
    case "fair":
    case "proposed":
      return "text-warning-600 bg-warning-50 border-warning-200";
    case "critical":
    case "poor":
    case "emergency":
      return "text-danger-600 bg-danger-50 border-danger-200";
    case "offline":
    case "in_progress":
    case "approved":
      return "text-primary-600 bg-primary-50 border-primary-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "critical":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "emergency":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

export function getRiskColor(score: number): string {
  if (score <= 25) return "text-success-600";
  if (score <= 50) return "text-warning-500";
  if (score <= 75) return "text-orange-500";
  return "text-danger-600";
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s atrás`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}
