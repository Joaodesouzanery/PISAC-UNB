"use client";

import { useState } from "react";
import { disasterFinancialScenarios, expectedAnnualLoss } from "@/data/budget-analysis-data";
import { formatCurrency, cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DisasterFinancialScenario } from "@/types";

const riskColors: Record<string, string> = {
  low: "bg-success-100 text-success-700",
  moderate: "bg-warning-100 text-warning-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-danger-100 text-danger-700",
};

const riskLabels: Record<string, string> = {
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  critical: "Crítico",
};

const PIE_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#3b82f6", "#22c55e", "#8b5cf6"];

export default function FinancialSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<DisasterFinancialScenario>(
    disasterFinancialScenarios[0]
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500);
  };

  const totalDirect = Object.values(selectedScenario.directCosts).reduce((s, v) => s + v, 0);
  const totalIndirect = Object.values(selectedScenario.indirectCosts).reduce((s, v) => s + v, 0);
  const totalCost = totalDirect + totalIndirect;
  const totalFunding = Object.values(selectedScenario.fundingSources).reduce((s, v) => s + v, 0);
  const gap = totalCost - totalFunding;

  const costBreakdownData = [
    { name: "Infraestrutura", value: selectedScenario.directCosts.infrastructure },
    { name: "Emergência", value: selectedScenario.directCosts.emergency },
    { name: "Saúde", value: selectedScenario.directCosts.healthcare },
    { name: "Habitação", value: selectedScenario.directCosts.housing },
    { name: "Meio Ambiente", value: selectedScenario.directCosts.environment },
  ].filter((d) => d.value > 0);

  const fundingData = [
    { name: "Orçamento Municipal", value: selectedScenario.fundingSources.municipalBudget },
    { name: "Transferência Estadual", value: selectedScenario.fundingSources.stateTransfer },
    { name: "Auxílio Federal", value: selectedScenario.fundingSources.federalAid },
    { name: "Seguro", value: selectedScenario.fundingSources.insurance },
    { name: "Ajuda Internacional", value: selectedScenario.fundingSources.internationalAid },
    { name: "Linhas de Crédito", value: selectedScenario.fundingSources.creditLines },
  ].filter((d) => d.value > 0);

  const scenarioComparison = disasterFinancialScenarios.map((s) => {
    const direct = Object.values(s.directCosts).reduce((sum, v) => sum + v, 0);
    const indirect = Object.values(s.indirectCosts).reduce((sum, v) => sum + v, 0);
    return {
      name: s.name.substring(0, 20),
      custoDireto: direct / 1000000,
      custoIndireto: indirect / 1000000,
      impactoOrcamento: s.budgetImpactPercent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Expected Annual Loss Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary-600" />
          Perda Anual Esperada vs. Investimentos em Mitigação (R$ milhões)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={expectedAnnualLoss}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => [`R$ ${value}M`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="investimento" fill="#bfdbfe" stroke="#93c5fd" name="Investimento Acumulado" />
            <Line type="monotone" dataKey="semMitigacao" stroke="#ef4444" strokeWidth={2} name="Perda s/ Mitigação" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="comMitigacao" stroke="#22c55e" strokeWidth={2} name="Perda c/ Mitigação" dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning-600" />
          Selecione um Cenário de Desastre para Simulação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {disasterFinancialScenarios.map((scenario) => {
            const sDirect = Object.values(scenario.directCosts).reduce((s, v) => s + v, 0);
            const sIndirect = Object.values(scenario.indirectCosts).reduce((s, v) => s + v, 0);

            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={cn(
                  "text-left p-3 rounded-lg border-2 transition-all",
                  selectedScenario.id === scenario.id
                    ? "border-primary-400 bg-primary-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium", riskColors[scenario.fiscalRiskRating])}>
                    Risco: {riskLabels[scenario.fiscalRiskRating]}
                  </span>
                  <span className="text-[10px] text-gray-400">{scenario.recurrence}</span>
                </div>
                <p className="text-xs font-medium text-gray-900 leading-tight mt-1">{scenario.name}</p>
                <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                  <span>Custo: {formatCurrency(sDirect + sIndirect)}</span>
                  <span>Impacto: {scenario.budgetImpactPercent}%</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isSimulating
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            <Zap className="h-4 w-4" />
            {isSimulating ? "Simulando..." : "Executar Simulação Financeira"}
          </button>
        </div>
      </div>

      {/* Scenario Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Composição de Custos Diretos
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={costBreakdownData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                {costBreakdownData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Funding Sources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Fontes de Financiamento
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fundingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000000).toFixed(0)}M`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#3b82f6" name="Valor" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Resumo do Impacto Financeiro - {selectedScenario.name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-danger-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-danger-700">Custo Direto</p>
            <p className="text-sm font-bold text-danger-800">{formatCurrency(totalDirect)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-orange-700">Custo Indireto</p>
            <p className="text-sm font-bold text-orange-800">{formatCurrency(totalIndirect)}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center border-2 border-red-200">
            <p className="text-[10px] text-red-700 font-bold">CUSTO TOTAL</p>
            <p className="text-sm font-bold text-red-800">{formatCurrency(totalCost)}</p>
          </div>
          <div className="bg-primary-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-primary-700">Financiamento</p>
            <p className="text-sm font-bold text-primary-800">{formatCurrency(totalFunding)}</p>
          </div>
          <div className={cn("rounded-lg p-3 text-center border-2", gap > 0 ? "bg-danger-50 border-danger-300" : "bg-success-50 border-success-300")}>
            <p className={cn("text-[10px] font-bold", gap > 0 ? "text-danger-700" : "text-success-700")}>
              {gap > 0 ? "DÉFICIT" : "SUPERÁVIT"}
            </p>
            <p className={cn("text-sm font-bold", gap > 0 ? "text-danger-800" : "text-success-800")}>
              {formatCurrency(Math.abs(gap))}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Recuperação</p>
            <p className="text-sm font-bold text-gray-900">{selectedScenario.recoveryTimeMonths} meses</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-600">Impacto Orçamento</p>
            <p className={cn("text-sm font-bold", selectedScenario.budgetImpactPercent > 20 ? "text-danger-600" : "text-warning-600")}>
              {selectedScenario.budgetImpactPercent}%
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Comparativo de Cenários (R$ milhões)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={scenarioComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-10} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 40]} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="custoDireto" fill="#ef4444" name="Custo Direto (R$M)" stackId="cost" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="custoIndireto" fill="#f97316" name="Custo Indireto (R$M)" stackId="cost" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="impactoOrcamento" stroke="#7c3aed" strokeWidth={2} name="Impacto Orçamento (%)" dot={{ r: 4 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
