"use client";

import { useState } from "react";
import { investmentPlans, investmentTimeline } from "@/data/budget-analysis-data";
import { formatCurrency, cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  PieChart as PieChartIcon,
  Calendar,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  PlayCircle,
  Pause,
  FileText,
  ArrowUpDown,
  Link2,
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
  AreaChart,
  Area,
} from "recharts";
import type { InvestmentPlan } from "@/types";

const statusConfig: Record<InvestmentPlan["status"], { label: string; icon: typeof CheckCircle; color: string }> = {
  planned: { label: "Planejado", icon: FileText, color: "bg-gray-100 text-gray-600" },
  approved: { label: "Aprovado", icon: CheckCircle, color: "bg-primary-100 text-primary-700" },
  in_execution: { label: "Em Execução", icon: PlayCircle, color: "bg-warning-100 text-warning-700" },
  completed: { label: "Concluído", icon: CheckCircle, color: "bg-success-100 text-success-700" },
  deferred: { label: "Adiado", icon: Pause, color: "bg-gray-100 text-gray-500" },
};

const categoryColors: Record<string, string> = {
  infrastructure: "#3b82f6",
  technology: "#8b5cf6",
  social: "#f59e0b",
  environmental: "#22c55e",
  institutional: "#6b7280",
};

const categoryLabels: Record<string, string> = {
  infrastructure: "Infraestrutura",
  technology: "Tecnologia",
  social: "Social",
  environmental: "Ambiental",
  institutional: "Institucional",
};

export default function InvestmentPlanning() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"priority" | "cost" | "benefit">("priority");

  const sorted = [...investmentPlans].sort((a, b) => {
    if (sortBy === "priority") return b.priority - a.priority;
    if (sortBy === "cost") return b.totalCost - a.totalCost;
    return b.expectedBenefits - a.expectedBenefits;
  });

  const totalCost = investmentPlans.reduce((s, p) => s + p.totalCost, 0);
  const totalBenefits = investmentPlans.reduce((s, p) => s + p.expectedBenefits, 0);
  const inExecution = investmentPlans.filter((p) => p.status === "in_execution").length;
  const approved = investmentPlans.filter((p) => p.status === "approved").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500">Investimento Total</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
          <p className="text-[10px] text-gray-400">{investmentPlans.length} programas</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500">Benefícios Esperados</p>
          <p className="text-xl font-bold text-success-600">{formatCurrency(totalBenefits)}</p>
          <p className="text-[10px] text-gray-400">BCR médio: {(totalBenefits / totalCost).toFixed(1)}x</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500">Em Execução</p>
          <p className="text-xl font-bold text-warning-600">{inExecution}</p>
          <p className="text-[10px] text-gray-400">+ {approved} aprovados</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-400 p-4">
          <p className="text-xs text-gray-500">Período</p>
          <p className="text-xl font-bold text-primary-600">2026-2030</p>
          <p className="text-[10px] text-gray-400">plano plurianual</p>
        </div>
      </div>

      {/* Investment Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-600" />
          Cronograma de Investimentos por Categoria (R$ milhões)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={investmentTimeline.map((t) => ({
            ...t,
            infrastructure: t.infrastructure / 1000000,
            technology: t.technology / 1000000,
            social: t.social / 1000000,
            environmental: t.environmental / 1000000,
            institutional: t.institutional / 1000000,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(0)}M`, ""]} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="infrastructure" stackId="1" fill="#3b82f6" stroke="#2563eb" name="Infraestrutura" />
            <Area type="monotone" dataKey="technology" stackId="1" fill="#8b5cf6" stroke="#7c3aed" name="Tecnologia" />
            <Area type="monotone" dataKey="social" stackId="1" fill="#f59e0b" stroke="#d97706" name="Social" />
            <Area type="monotone" dataKey="environmental" stackId="1" fill="#22c55e" stroke="#16a34a" name="Ambiental" />
            <Area type="monotone" dataKey="institutional" stackId="1" fill="#6b7280" stroke="#4b5563" name="Institucional" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-500">Priorizar por:</span>
        {[
          { key: "priority" as const, label: "Prioridade" },
          { key: "cost" as const, label: "Custo" },
          { key: "benefit" as const, label: "Benefício" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              sortBy === key
                ? "bg-primary-50 text-primary-700 border-primary-200"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="space-y-3">
        {sorted.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          const status = statusConfig[plan.status];
          const StatusIcon = status.icon;

          return (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[plan.category] }} />
                      <h4 className="text-sm font-bold text-gray-900">{plan.name}</h4>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.color)}>
                        <StatusIcon className="h-3 w-3" />{status.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {categoryLabels[plan.category]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{plan.description}</p>

                    <div className="grid grid-cols-5 gap-4 mt-3">
                      <div className="text-xs">
                        <p className="text-gray-400">Prioridade</p>
                        <p className={cn("font-bold", plan.priority > 85 ? "text-danger-600" : plan.priority > 70 ? "text-warning-600" : "text-primary-600")}>
                          {plan.priority}/100
                        </p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-400">Custo Total</p>
                        <p className="font-bold text-gray-900">{formatCurrency(plan.totalCost)}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-400">Benefício</p>
                        <p className="font-bold text-success-600">{formatCurrency(plan.expectedBenefits)}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-400">BCR</p>
                        <p className="font-bold text-primary-600">{(plan.expectedBenefits / plan.totalCost).toFixed(1)}x</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-400">Período</p>
                        <p className="font-bold text-gray-900">{plan.startYear}-{plan.endYear}</p>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 mt-1" /> : <ChevronDown className="h-4 w-4 text-gray-400 mt-1" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Yearly Allocation */}
                    <div>
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Alocação Anual</h5>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={plan.yearlyAllocation.map((y) => ({ ...y, amount: y.amount / 1000000 }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(0)}M`, "Valor"]} />
                          <Bar dataKey="amount" fill={categoryColors[plan.category]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-2 text-xs">
                        <p className="text-gray-500">Fonte: <span className="font-medium text-gray-700">{plan.fundingSource}</span></p>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div>
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Target className="h-3 w-3" /> Indicadores (KPIs)
                      </h5>
                      <div className="space-y-3">
                        {plan.kpis.map((kpi, i) => {
                          const progress = kpi.target > 0
                            ? Math.abs(kpi.current / kpi.target) * 100
                            : 0;
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-600">{kpi.name}</span>
                                <span className="font-medium text-gray-900">
                                  {kpi.current} / {kpi.target} {kpi.unit}
                                </span>
                              </div>
                              <ProgressBar
                                value={Math.min(progress, 100)}
                                showPercentage={true}
                                size="sm"
                                color={progress > 60 ? "success" : progress > 30 ? "warning" : "danger"}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Informações</h5>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-gray-500">Risco do Projeto</span>
                            <span className={cn("font-bold", plan.riskScore > 25 ? "text-warning-600" : "text-success-600")}>{plan.riskScore}/100</span>
                          </div>
                          <div className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-gray-500">BCR</span>
                            <span className="font-bold text-primary-600">{(plan.expectedBenefits / plan.totalCost).toFixed(1)}x</span>
                          </div>
                        </div>
                      </div>
                      {plan.dependencies.length > 0 && (
                        <div>
                          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Link2 className="h-3 w-3" /> Dependências
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {plan.dependencies.map((dep) => {
                              const depPlan = investmentPlans.find((p) => p.id === dep);
                              return (
                                <span key={dep} className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                                  {depPlan?.name.substring(0, 25) || dep}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
