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

  const cardStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" };
  const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Investimento Total", value: formatCurrency(totalCost), sub: `${investmentPlans.length} programas`, accent: "var(--accent)" },
          { label: "Benefícios Esperados", value: formatCurrency(totalBenefits), sub: `BCR médio: ${(totalBenefits / totalCost).toFixed(1)}x`, accent: "#22c55e" },
          { label: "Em Execução", value: String(inExecution), sub: `+ ${approved} aprovados`, accent: "#f59e0b" },
          { label: "Período", value: "2026-2030", sub: "plano plurianual", accent: "#3b82f6" },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className="rounded-xl p-4" style={{ ...cardStyle, borderLeft: `3px solid ${accent}` }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Investment Timeline */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Calendar className="h-4 w-4" style={{ color: "var(--accent)" }} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`R$ ${value.toFixed(0)}M`, ""]} />
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
        <ArrowUpDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Priorizar por:</span>
        {[
          { key: "priority" as const, label: "Prioridade" },
          { key: "cost" as const, label: "Custo" },
          { key: "benefit" as const, label: "Benefício" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: sortBy === key ? "var(--accent-muted)" : "var(--bg-card)",
              color: sortBy === key ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${sortBy === key ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
            }}
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
            <div key={plan.id} className="rounded-xl" style={cardStyle}>
              <button
                onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[plan.category] }} />
                      <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{plan.name}</h4>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.color)}>
                        <StatusIcon className="h-3 w-3" />{status.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                        {categoryLabels[plan.category]}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-1" style={{ color: "var(--text-muted)" }}>{plan.description}</p>

                    <div className="grid grid-cols-5 gap-4 mt-3">
                      <div className="text-xs">
                        <p style={{ color: "var(--text-muted)" }}>Prioridade</p>
                        <p className={cn("font-bold", plan.priority > 85 ? "text-danger-600" : plan.priority > 70 ? "text-warning-600" : "text-primary-600")}>
                          {plan.priority}/100
                        </p>
                      </div>
                      <div className="text-xs">
                        <p style={{ color: "var(--text-muted)" }}>Custo Total</p>
                        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{formatCurrency(plan.totalCost)}</p>
                      </div>
                      <div className="text-xs">
                        <p style={{ color: "var(--text-muted)" }}>Benefício</p>
                        <p className="font-bold text-success-600">{formatCurrency(plan.expectedBenefits)}</p>
                      </div>
                      <div className="text-xs">
                        <p style={{ color: "var(--text-muted)" }}>BCR</p>
                        <p className="font-bold" style={{ color: "var(--accent)" }}>{(plan.expectedBenefits / plan.totalCost).toFixed(1)}x</p>
                      </div>
                      <div className="text-xs">
                        <p style={{ color: "var(--text-muted)" }}>Período</p>
                        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{plan.startYear}-{plan.endYear}</p>
                      </div>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="h-4 w-4 mt-1" style={{ color: "var(--text-muted)" }} />
                    : <ChevronDown className="h-4 w-4 mt-1" style={{ color: "var(--text-muted)" }} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Yearly Allocation */}
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Alocação Anual</h5>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={plan.yearlyAllocation.map((y) => ({ ...y, amount: y.amount / 1000000 }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                          <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`R$ ${value.toFixed(0)}M`, "Valor"]} />
                          <Bar dataKey="amount" fill={categoryColors[plan.category]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-2 text-xs">
                        <p style={{ color: "var(--text-muted)" }}>Fonte: <span className="font-medium" style={{ color: "var(--text-primary)" }}>{plan.fundingSource}</span></p>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
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
                                <span style={{ color: "var(--text-muted)" }}>{kpi.name}</span>
                                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
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
                        <h5 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Informações</h5>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                            <span style={{ color: "var(--text-muted)" }}>Risco do Projeto</span>
                            <span className={cn("font-bold", plan.riskScore > 25 ? "text-warning-600" : "text-success-600")}>{plan.riskScore}/100</span>
                          </div>
                          <div className="flex justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                            <span style={{ color: "var(--text-muted)" }}>BCR</span>
                            <span className="font-bold" style={{ color: "var(--accent)" }}>{(plan.expectedBenefits / plan.totalCost).toFixed(1)}x</span>
                          </div>
                        </div>
                      </div>
                      {plan.dependencies.length > 0 && (
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                            <Link2 className="h-3 w-3" /> Dependências
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {plan.dependencies.map((dep) => {
                              const depPlan = investmentPlans.find((p) => p.id === dep);
                              return (
                                <span key={dep} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
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
