"use client";

import { useState } from "react";
import {
  budgetCategories,
  mitigationInvestments,
  financialImpacts,
  riskScenarios,
  budgetExecutionTimeline,
} from "@/data/mock-data";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Wallet,
  TrendingUp,
  Shield,
  ArrowUpRight,
  PiggyBank,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from "recharts";

const PIE_COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#60a5fa",
  "#818cf8",
  "#a78bfa",
];

export default function BudgetModule() {
  const [view, setView] = useState<"overview" | "investments" | "impact">(
    "overview"
  );

  const totalAllocated = budgetCategories.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetCategories.reduce((s, b) => s + b.spent, 0);
  const totalCommitted = budgetCategories.reduce((s, b) => s + b.committed, 0);
  const totalAvailable = totalAllocated - totalSpent - totalCommitted;

  const pieData = budgetCategories.map((bc) => ({
    name: bc.name,
    value: bc.allocated,
  }));

  const investmentsByStatus = {
    proposed: mitigationInvestments.filter((i) => i.status === "proposed"),
    approved: mitigationInvestments.filter((i) => i.status === "approved"),
    in_progress: mitigationInvestments.filter((i) => i.status === "in_progress"),
    completed: mitigationInvestments.filter((i) => i.status === "completed"),
  };

  const totalInvestmentCost = mitigationInvestments.reduce(
    (s, i) => s + i.estimatedCost,
    0
  );

  // Financial impact comparison
  const impactComparison = financialImpacts.map((fi) => {
    const scenario = riskScenarios.find((rs) => rs.id === fi.scenarioId);
    const relatedInvestments = mitigationInvestments.filter((mi) =>
      mi.relatedScenarios.includes(fi.scenarioId)
    );
    const mitigationCost = relatedInvestments.reduce(
      (s, mi) => s + mi.estimatedCost,
      0
    );
    const avgRiskReduction =
      relatedInvestments.length > 0
        ? relatedInvestments.reduce((s, mi) => s + mi.expectedRiskReduction, 0) /
          relatedInvestments.length
        : 0;
    const mitigatedCost =
      (fi.directCost + fi.indirectCost) * (1 - avgRiskReduction / 100);

    return {
      name: scenario?.name.substring(0, 25) || fi.scenarioId,
      custoSemMitigacao: (fi.directCost + fi.indirectCost) / 1000000,
      custoComMitigacao: mitigatedCost / 1000000,
      investimento: mitigationCost / 1000000,
      economia: ((fi.directCost + fi.indirectCost - mitigatedCost) / 1000000),
    };
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "overview" as const, label: "Visão Geral", icon: Wallet },
          { key: "investments" as const, label: "Investimentos em Mitigação", icon: Shield },
          { key: "impact" as const, label: "Análise de Impacto", icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === key
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
              <p className="text-xs text-gray-500">Orçamento Total</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalAllocated)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Exercício 2026</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
              <p className="text-xs text-gray-500">Executado</p>
              <p className="text-xl font-bold text-success-600">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {((totalSpent / totalAllocated) * 100).toFixed(1)}% do total
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
              <p className="text-xs text-gray-500">Empenhado</p>
              <p className="text-xl font-bold text-warning-600">
                {formatCurrency(totalCommitted)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {((totalCommitted / totalAllocated) * 100).toFixed(1)}% do total
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-400 p-4">
              <p className="text-xs text-gray-500">Disponível</p>
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(totalAvailable)}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {((totalAvailable / totalAllocated) * 100).toFixed(1)}% do total
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                Execução Orçamentária Acumulada (%)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={budgetExecutionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    fill="#bfdbfe"
                    stroke="#93c5fd"
                    name="Planejado"
                  />
                  <Line
                    type="monotone"
                    dataKey="executed"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Executado"
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Budget Distribution Pie */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-primary-600" />
                Distribuição por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={true}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Detalhamento por Categoria
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      Categoria
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      Alocado
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      Executado
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      Empenhado
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      Disponível
                    </th>
                    <th className="py-2 px-3 text-gray-500 font-medium w-32">
                      Execução
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetCategories.map((bc) => (
                    <tr
                      key={bc.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {bc.name}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {formatCurrency(bc.allocated)}
                      </td>
                      <td className="py-2 px-3 text-right text-success-600 font-medium">
                        {formatCurrency(bc.spent)}
                      </td>
                      <td className="py-2 px-3 text-right text-warning-600">
                        {formatCurrency(bc.committed)}
                      </td>
                      <td className="py-2 px-3 text-right text-primary-600">
                        {formatCurrency(bc.allocated - bc.spent - bc.committed)}
                      </td>
                      <td className="py-2 px-3">
                        <ProgressBar
                          value={bc.spent}
                          max={bc.allocated}
                          size="sm"
                          showPercentage={false}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-bold">
                    <td className="py-2 px-3 text-gray-900">TOTAL</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(totalAllocated)}</td>
                    <td className="py-2 px-3 text-right text-success-600">{formatCurrency(totalSpent)}</td>
                    <td className="py-2 px-3 text-right text-warning-600">{formatCurrency(totalCommitted)}</td>
                    <td className="py-2 px-3 text-right text-primary-600">{formatCurrency(totalAvailable)}</td>
                    <td className="py-2 px-3">
                      <ProgressBar
                        value={totalSpent}
                        max={totalAllocated}
                        size="sm"
                        showPercentage={false}
                      />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {view === "investments" && (
        <>
          {/* Investment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" /> Propostos
              </p>
              <p className="text-xl font-bold text-gray-600">
                {investmentsByStatus.proposed.length}
              </p>
              <p className="text-[10px] text-gray-400">
                {formatCurrency(
                  investmentsByStatus.proposed.reduce(
                    (s, i) => s + i.estimatedCost,
                    0
                  )
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Aprovados
              </p>
              <p className="text-xl font-bold text-primary-600">
                {investmentsByStatus.approved.length}
              </p>
              <p className="text-[10px] text-gray-400">
                {formatCurrency(
                  investmentsByStatus.approved.reduce(
                    (s, i) => s + i.estimatedCost,
                    0
                  )
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Em Execução
              </p>
              <p className="text-xl font-bold text-warning-600">
                {investmentsByStatus.in_progress.length}
              </p>
              <p className="text-[10px] text-gray-400">
                {formatCurrency(
                  investmentsByStatus.in_progress.reduce(
                    (s, i) => s + i.estimatedCost,
                    0
                  )
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Investimento Total</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalInvestmentCost)}
              </p>
              <p className="text-[10px] text-gray-400">
                {mitigationInvestments.length} projetos
              </p>
            </div>
          </div>

          {/* Investment Cards */}
          <div className="space-y-3">
            {mitigationInvestments
              .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((investment) => (
                <div
                  key={investment.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {investment.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {investment.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-medium",
                          investment.priority === "critical"
                            ? "bg-red-100 text-red-700"
                            : investment.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : investment.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        )}
                      >
                        {investment.priority.toUpperCase()}
                      </span>
                      <StatusBadge label={investment.status} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-center">
                      <p className="text-gray-500">Custo</p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(investment.estimatedCost)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-center">
                      <p className="text-gray-500">Redução Risco</p>
                      <p className="font-bold text-success-600">
                        {investment.expectedRiskReduction}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-center">
                      <p className="text-gray-500">ROI</p>
                      <p className="font-bold text-primary-600">
                        {investment.roi}x
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-xs text-center">
                      <p className="text-gray-500">Cenários</p>
                      <p className="font-bold text-gray-900">
                        {investment.relatedScenarios.length}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {view === "impact" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Comparison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary-600" />
              Custo: Sem Mitigação vs. Com Mitigação (R$ Mi)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={impactComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number) => [
                    `R$ ${value.toFixed(0)}M`,
                    "",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="custoSemMitigacao"
                  fill="#ef4444"
                  name="Sem Mitigação"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="custoComMitigacao"
                  fill="#22c55e"
                  name="Com Mitigação"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ROI Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-success-600" />
              Análise de Retorno sobre Investimento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={mitigationInvestments.map((i) => ({
                  name: i.name.substring(0, 20),
                  roi: i.roi,
                  reducao: i.expectedRiskReduction,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  yAxisId="left"
                  dataKey="roi"
                  fill="#2563eb"
                  name="ROI (x)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="reducao"
                  fill="#22c55e"
                  name="Red. Risco (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Resumo de Impacto Financeiro
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-danger-50 rounded-lg p-3 text-center">
                <p className="text-xs text-danger-700">Custo Total Potencial</p>
                <p className="text-lg font-bold text-danger-800">
                  {formatCurrency(
                    financialImpacts.reduce(
                      (s, fi) => s + fi.directCost + fi.indirectCost,
                      0
                    )
                  )}
                </p>
                <p className="text-[10px] text-danger-600">sem mitigação</p>
              </div>
              <div className="bg-success-50 rounded-lg p-3 text-center">
                <p className="text-xs text-success-700">Investimento em Mitigação</p>
                <p className="text-lg font-bold text-success-800">
                  {formatCurrency(totalInvestmentCost)}
                </p>
                <p className="text-[10px] text-success-600">
                  {mitigationInvestments.length} projetos
                </p>
              </div>
              <div className="bg-primary-50 rounded-lg p-3 text-center">
                <p className="text-xs text-primary-700">Economia Estimada</p>
                <p className="text-lg font-bold text-primary-800">
                  {formatCurrency(
                    impactComparison.reduce((s, ic) => s + ic.economia * 1000000, 0)
                  )}
                </p>
                <p className="text-[10px] text-primary-600">com investimentos</p>
              </div>
              <div className="bg-warning-50 rounded-lg p-3 text-center">
                <p className="text-xs text-warning-700">ROI Médio</p>
                <p className="text-lg font-bold text-warning-800">
                  {(
                    mitigationInvestments.reduce((s, i) => s + i.roi, 0) /
                    mitigationInvestments.length
                  ).toFixed(1)}
                  x
                </p>
                <p className="text-[10px] text-warning-600">retorno por real investido</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
