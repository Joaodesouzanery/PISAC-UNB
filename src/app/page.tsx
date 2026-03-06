"use client";

import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import MapModule from "@/components/maps/MapModule";
import AnalysisModule from "@/components/analysis/AnalysisModule";
import SimulationModule from "@/components/simulation/SimulationModule";
import MonitoringModule from "@/components/monitoring/MonitoringModule";
import BudgetModule from "@/components/budget/BudgetModule";
import CrisisModule from "@/components/crisis/CrisisModule";
import BudgetAnalysisModule from "@/components/budget-analysis/BudgetAnalysisModule";
import GovernanceModule from "@/components/governance/GovernanceModule";
import { alerts } from "@/data/mock-data";
import { cn } from "@/lib/utils";
import type { ModulePage } from "@/types";

const pageConfig: Record<ModulePage, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Painel de Controle",
    subtitle: "Visão geral do status da resiliência municipal",
  },
  map: {
    title: "Mapa Integrado BIM/GIS/IoT",
    subtitle: "Visualização georreferenciada de infraestruturas, sensores e alertas",
  },
  analysis: {
    title: "Análise de Dados Avançada",
    subtitle: "Vulnerabilidades, padrões históricos e correlações",
  },
  simulation: {
    title: "Simulação de Cenários de Risco",
    subtitle: "Modelagem de impacto e planejamento de resposta",
  },
  monitoring: {
    title: "Monitoramento em Tempo Real",
    subtitle: "Rede de sensores IoT e alertas proativos",
  },
  budget: {
    title: "Gestão Orçamentária",
    subtitle: "Cruzamento orçamentário e investimentos em resiliência",
  },
  crisis: {
    title: "Gestão de Crises Colaborativa",
    subtitle: "Coordenação intermunicipal, comunicação e resposta a emergências",
  },
  budget_analysis: {
    title: "Análise Orçamentária para Resiliência",
    subtitle: "Custo-benefício, simulação financeira, planejamento de investimentos e relatórios",
  },
  governance: {
    title: "Governança e Conformidade",
    subtitle: "RBAC, auditoria, LGPD, interoperabilidade e-PING e arquitetura de microsserviços",
  },
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<ModulePage>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeAlertCount = alerts.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        alertCount={activeAlertCount}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main
        id="main-content"
        role="main"
        aria-label="Conteúdo principal"
        className={cn(
          "transition-all duration-300",
          "lg:ml-64",
          sidebarCollapsed && "lg:ml-16",
          "ml-0"
        )}
      >
        <Header
          title={pageConfig[currentPage].title}
          subtitle={pageConfig[currentPage].subtitle}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <div className={cn(
          "p-3 sm:p-4 md:p-6",
          currentPage === "map" && "p-0"
        )}>
          {currentPage === "dashboard" && <DashboardOverview />}
          {currentPage === "map" && <MapModule />}
          {currentPage === "analysis" && <AnalysisModule />}
          {currentPage === "simulation" && <SimulationModule />}
          {currentPage === "monitoring" && <MonitoringModule />}
          {currentPage === "budget" && <BudgetModule />}
          {currentPage === "crisis" && <CrisisModule />}
          {currentPage === "budget_analysis" && <BudgetAnalysisModule />}
          {currentPage === "governance" && <GovernanceModule />}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
