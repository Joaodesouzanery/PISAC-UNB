"use client";

import { useState } from "react";
import {
  Calculator,
  TrendingUp,
  BarChart3,
  FileText,
  PieChart,
} from "lucide-react";
import CostBenefitPanel from "./CostBenefitPanel";
import FinancialSimulation from "./FinancialSimulation";
import InvestmentPlanning from "./InvestmentPlanning";
import ReportGeneration from "./ReportGeneration";

type AnalysisView =
  | "cost_benefit"
  | "financial_sim"
  | "investment"
  | "reports";

export default function BudgetAnalysisModule() {
  const [view, setView] = useState<AnalysisView>("cost_benefit");

  const tabs: { key: AnalysisView; label: string; icon: typeof Calculator }[] = [
    { key: "cost_benefit", label: "Custo-Benefício", icon: Calculator },
    { key: "financial_sim", label: "Simulação Financeira", icon: TrendingUp },
    { key: "investment", label: "Planejamento de Investimentos", icon: PieChart },
    { key: "reports", label: "Relatórios", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === key
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {view === "cost_benefit" && <CostBenefitPanel />}
      {view === "financial_sim" && <FinancialSimulation />}
      {view === "investment" && <InvestmentPlanning />}
      {view === "reports" && <ReportGeneration />}
    </div>
  );
}
