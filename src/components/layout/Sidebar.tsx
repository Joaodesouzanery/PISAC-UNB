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
  ShieldCheck,
  ChevronDown,
  X,
} from "lucide-react";

interface SidebarProps {
  currentPage: ModulePage;
  onNavigate: (page: ModulePage) => void;
  collapsed: boolean;
  onToggle: () => void;
  alertCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavGroup {
  title: string;
  items: { page: ModulePage; label: string; icon: typeof LayoutDashboard }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Menu Principal",
    items: [
      { page: "dashboard", label: "Painel Geral", icon: LayoutDashboard },
      { page: "map", label: "Mapa BIM/GIS/IoT", icon: Map },
      { page: "monitoring", label: "Monitoramento", icon: Activity },
    ],
  },
  {
    title: "Análise",
    items: [
      { page: "analysis", label: "Análise de Dados", icon: BarChart3 },
      { page: "simulation", label: "Simulação de Riscos", icon: PlayCircle },
    ],
  },
  {
    title: "Gestão",
    items: [
      { page: "crisis", label: "Gestão de Crises", icon: Siren },
      { page: "budget", label: "Orçamento", icon: Wallet },
      { page: "budget_analysis", label: "Análise Orçamentária", icon: Calculator },
    ],
  },
  {
    title: "Administração",
    items: [
      { page: "governance", label: "Governança", icon: ShieldCheck },
    ],
  },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggle,
  alertCount,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const handleNavigate = (page: ModulePage) => {
    onNavigate(page);
    onMobileClose();
  };

  const sidebarContent = (showLabels: boolean) => (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid var(--border-primary)" }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Shield className="h-5 w-5 text-white" />
        </div>
        {showLabels && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Plataforma
                </p>
                <h1 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  PISAC
                </h1>
              </div>
              <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Alert Badge */}
      {alertCount > 0 && (
        <div
          className={cn(
            "mx-3 mt-3 flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors",
            !showLabels && "justify-center px-2"
          )}
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
          }}
          onClick={() => handleNavigate("monitoring")}
        >
          <Bell className="h-4 w-4 flex-shrink-0 animate-pulse-dot text-danger-500" />
          {showLabels && (
            <span className="text-xs font-medium text-danger-400">
              {alertCount} alerta{alertCount > 1 ? "s" : ""} ativo{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 mt-4 px-3 overflow-y-auto scrollbar-thin space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            {showLabels && (
              <p
                className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ page, label, icon: Icon }) => {
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => handleNavigate(page)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      !showLabels && "justify-center px-2"
                    )}
                    style={{
                      backgroundColor: isActive ? "var(--accent-muted)" : "transparent",
                      color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}
                    title={!showLabels ? label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {showLabels && <span className="truncate">{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen flex flex-col z-50 transition-transform duration-300 lg:hidden w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--bg-card)",
          borderRight: "1px solid var(--border-primary)",
        }}
      >
        {/* Mobile close button */}
        <div className="absolute top-4 right-3">
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen flex-col transition-all duration-300 z-50 hidden lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
        style={{
          backgroundColor: "var(--bg-card)",
          borderRight: "1px solid var(--border-primary)",
        }}
      >
        {sidebarContent(!collapsed)}

        {/* Collapse Toggle (desktop only) */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
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
    </>
  );
}
