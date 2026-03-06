"use client";

import { useState } from "react";
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
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState<ModulePage>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeAlertCount = alerts.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        alertCount={activeAlertCount}
      />

      <main
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Header
          title={pageConfig[currentPage].title}
          subtitle={pageConfig[currentPage].subtitle}
        />

        <div className={cn(
          "p-6",
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
        </div>
      </main>
    </div>
  );
}
