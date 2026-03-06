"use client";

import { useState } from "react";
import { disasterFinancialScenarios, expectedAnnualLoss } from "@/data/budget-analysis-data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Shield,
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

  const cardStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" };
  const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 };

  return (
    <div className="space-y-6">
      {/* Expected Annual Loss Chart */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <TrendingUp className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Perda Anual Esperada vs. Investimentos em Mitigação (R$ milhões)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={expectedAnnualLoss}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`R$ ${value}M`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="investimento" fill="#bfdbfe" stroke="#93c5fd" name="Investimento Acumulado" />
            <Line type="monotone" dataKey="semMitigacao" stroke="#ef4444" strokeWidth={2} name="Perda s/ Mitigação" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="comMitigacao" stroke="#22c55e" strokeWidth={2} name="Perda c/ Mitigação" dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Selector */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Zap className="h-4 w-4 text-warning-600" />
          Selecione um Cenário de Desastre para Simulação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {disasterFinancialScenarios.map((scenario) => {
            const sDirect = Object.values(scenario.directCosts).reduce((s, v) => s + v, 0);
            const sIndirect = Object.values(scenario.indirectCosts).reduce((s, v) => s + v, 0);
            const isSelected = selectedScenario.id === scenario.id;

            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className="text-left p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: isSelected ? "var(--accent-muted)" : "var(--bg-elevated)",
                  border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-subtle)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium", riskColors[scenario.fiscalRiskRating])}>
                    Risco: {riskLabels[scenario.fiscalRiskRating]}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{scenario.recurrence}</span>
                </div>
                <p className="text-xs font-medium leading-tight mt-1" style={{ color: "var(--text-primary)" }}>{scenario.name}</p>
                <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: isSimulating ? "var(--bg-elevated)" : "var(--accent)",
              color: isSimulating ? "var(--text-muted)" : "#fff",
              cursor: isSimulating ? "not-allowed" : "pointer",
            }}
          >
            <Zap className="h-4 w-4" />
            {isSimulating ? "Simulando..." : "Executar Simulação Financeira"}
          </button>
        </div>
      </div>

      {/* Scenario Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
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
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Funding Sources */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Fontes de Financiamento
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fundingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickFormatter={(v) => `R$${(v / 1000000).toFixed(0)}M`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={120} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#3b82f6" name="Valor" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Resumo do Impacto Financeiro - {selectedScenario.name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Custo Direto", value: formatCurrency(totalDirect), bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
            { label: "Custo Indireto", value: formatCurrency(totalIndirect), bg: "rgba(249,115,22,0.1)", color: "#f97316" },
            { label: "CUSTO TOTAL", value: formatCurrency(totalCost), bg: "rgba(239,68,68,0.15)", color: "#dc2626", bold: true },
            { label: "Financiamento", value: formatCurrency(totalFunding), bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
            { label: gap > 0 ? "DÉFICIT" : "SUPERÁVIT", value: formatCurrency(Math.abs(gap)), bg: gap > 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: gap > 0 ? "#dc2626" : "#22c55e", bold: true },
            { label: "Recuperação", value: `${selectedScenario.recoveryTimeMonths} meses`, bg: "var(--bg-elevated)", color: "var(--text-primary)" },
            { label: "Impacto Orçamento", value: `${selectedScenario.budgetImpactPercent}%`, bg: "var(--bg-elevated)", color: selectedScenario.budgetImpactPercent > 20 ? "#ef4444" : "#f59e0b" },
          ].map(({ label, value, bg, color, bold }) => (
            <div key={label} className="rounded-lg p-3 text-center" style={{ backgroundColor: bg, border: bold ? `2px solid ${color}` : undefined }}>
              <p className="text-[10px] font-medium" style={{ color }}>{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Comparativo de Cenários (R$ milhões)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={scenarioComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} angle={-10} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "var(--text-muted)" }} domain={[0, 40]} />
            <Tooltip contentStyle={tooltipStyle} />
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
