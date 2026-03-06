"use client";

import { cn } from "@/lib/utils";
import type { ModulePage } from "@/types";
import {
  LayoutDashboard,
  Map,
  BarChart3,
  PlayCircle,
  Activity,
  Wallet,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  Siren,
  Calculator,
} from "lucide-react";

interface SidebarProps {
  currentPage: ModulePage;
  onNavigate: (page: ModulePage) => void;
  collapsed: boolean;
  onToggle: () => void;
  alertCount: number;
}

const navItems: { page: ModulePage; label: string; icon: typeof LayoutDashboard }[] = [
  { page: "dashboard", label: "Painel Geral", icon: LayoutDashboard },
  { page: "map", label: "Mapa BIM/GIS/IoT", icon: Map },
  { page: "analysis", label: "Análise de Dados", icon: BarChart3 },
  { page: "simulation", label: "Simulação de Riscos", icon: PlayCircle },
  { page: "monitoring", label: "Monitoramento", icon: Activity },
  { page: "budget", label: "Orçamento", icon: Wallet },
  { page: "crisis", label: "Gestão de Crises", icon: Siren },
  { page: "budget_analysis", label: "Análise Orçamentária", icon: Calculator },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggle,
  alertCount,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-gradient-resilience text-white flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Shield className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-wide">PISAC</h1>
            <p className="text-[10px] text-blue-200 truncate">
              Centro de Comando de Resiliência
            </p>
          </div>
        )}
      </div>

      {/* Alert Badge */}
      {alertCount > 0 && (
        <div
          className={cn(
            "mx-3 mt-3 flex items-center gap-2 rounded-lg bg-danger-600/80 px-3 py-2 cursor-pointer hover:bg-danger-600 transition-colors",
            collapsed && "justify-center px-2"
          )}
          onClick={() => onNavigate("monitoring")}
        >
          <Bell className="h-4 w-4 flex-shrink-0 animate-pulse-dot" />
          {!collapsed && (
            <span className="text-xs font-medium">
              {alertCount} alerta{alertCount > 1 ? "s" : ""} ativo{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              currentPage === page
                ? "bg-white/20 text-white shadow-sm"
                : "text-blue-100 hover:bg-white/10 hover:text-white",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
