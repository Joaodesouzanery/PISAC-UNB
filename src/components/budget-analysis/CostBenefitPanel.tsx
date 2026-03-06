"use client";

import { useState } from "react";
import { costBenefitAnalyses } from "@/data/budget-analysis-data";
import { formatCurrency, cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  Calculator,
  TrendingUp,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  FileEdit,
  AlertTriangle,
  XCircle,
  DollarSign,
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
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { CostBenefitAnalysis } from "@/types";

const statusConfig: Record<
  CostBenefitAnalysis["status"],
  { label: string; icon: typeof CheckCircle; color: string }
> = {
  draft: { label: "Rascunho", icon: FileEdit, color: "bg-gray-100 text-gray-600" },
  under_review: { label: "Em Análise", icon: AlertTriangle, color: "bg-warning-100 text-warning-700" },
  approved: { label: "Aprovado", icon: CheckCircle, color: "bg-success-100 text-success-700" },
  rejected: { label: "Rejeitado", icon: XCircle, color: "bg-danger-100 text-danger-700" },
};

const categoryLabels: Record<string, string> = {
  infrastructure: "Infraestrutura",
  technology: "Tecnologia",
  social: "Social",
  environmental: "Ambiental",
  institutional: "Institucional",
};

export default function CostBenefitPanel() {
  const [selectedProject, setSelectedProject] = useState<CostBenefitAnalysis | null>(null);
  const [sortBy, setSortBy] = useState<"bcr" | "npv" | "irr" | "payback">("bcr");

  const sorted = [...costBenefitAnalyses].sort((a, b) => {
    if (sortBy === "bcr") return b.bcr - a.bcr;
    if (sortBy === "npv") return b.npv - a.npv;
    if (sortBy === "irr") return b.irr - a.irr;
    return a.paybackYears - b.paybackYears;
  });

  const comparisonData = costBenefitAnalyses.map((cba) => ({
    name: cba.projectName.substring(0, 20),
    bcr: cba.bcr,
    irr: cba.irr,
    payback: cba.paybackYears,
    investimento: cba.initialInvestment / 1000000,
  }));

  const efficiencyData = costBenefitAnalyses.map((cba) => ({
    x: cba.initialInvestment / 1000000,
    y: cba.bcr,
    z: cba.riskReduction * 5,
    name: cba.projectName.substring(0, 25),
  }));

  const totalInvestment = costBenefitAnalyses.reduce((s, c) => s + c.initialInvestment, 0);
  const totalBenefits = costBenefitAnalyses.reduce(
    (s, c) => s + c.benefits.avoidedLosses + c.benefits.socialBenefit + c.benefits.economicGrowth + c.benefits.environmentalBenefit,
    0
  );
  const avgBCR = costBenefitAnalyses.reduce((s, c) => s + c.bcr, 0) / costBenefitAnalyses.length;
  const avgIRR = costBenefitAnalyses.reduce((s, c) => s + c.irr, 0) / costBenefitAnalyses.length;

  const cardStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" };
  const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 };

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Investimento Total", value: formatCurrency(totalInvestment), sub: `${costBenefitAnalyses.length} projetos analisados`, accent: "var(--accent)" },
          { label: "Benefícios Totais", value: formatCurrency(totalBenefits), sub: "ao longo da vida útil", accent: "#22c55e" },
          { label: "BCR Médio", value: `${avgBCR.toFixed(1)}x`, sub: "retorno por real investido", accent: "#f59e0b" },
          { label: "TIR Média", value: `${avgIRR.toFixed(1)}%`, sub: "taxa interna de retorno", accent: "#3b82f6" },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className="rounded-xl p-4" style={{ ...cardStyle, borderLeft: `3px solid ${accent}` }}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Chart */}
        <div className="lg:col-span-2 rounded-xl p-4" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Comparativo BCR e TIR por Projeto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} angle={-15} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="bcr" fill="#2563eb" name="BCR (x)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="irr" fill="#22c55e" name="TIR (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Scatter */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Eficiência: Investimento vs BCR
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" dataKey="x" name="Investimento (R$M)" tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                label={{ value: "Investimento (R$M)", position: "bottom", fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis type="number" dataKey="y" name="BCR" tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                label={{ value: "BCR", angle: -90, position: "left", fontSize: 10, fill: "var(--text-muted)" }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => {
                if (name === "x") return [`R$ ${value.toFixed(0)}M`, "Investimento"];
                if (name === "y") return [`${value.toFixed(1)}x`, "BCR"];
                return [value, name];
              }} />
              <Scatter data={efficiencyData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-[10px] mt-2 text-center" style={{ color: "var(--text-muted)" }}>
            Tamanho do ponto = redução de risco esperada
          </p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Ordenar por:</span>
        {[
          { key: "bcr" as const, label: "BCR" },
          { key: "npv" as const, label: "VPL" },
          { key: "irr" as const, label: "TIR" },
          { key: "payback" as const, label: "Payback" },
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

      {/* Project Cards */}
      <div className="space-y-3">
        {sorted.map((cba) => {
          const isExpanded = selectedProject?.id === cba.id;
          const status = statusConfig[cba.status];
          const StatusIcon = status.icon;
          const totalBenefit = cba.benefits.avoidedLosses + cba.benefits.socialBenefit +
            cba.benefits.economicGrowth + cba.benefits.environmentalBenefit;

          const benefitBreakdown = [
            { subject: "Perdas Evitadas", value: (cba.benefits.avoidedLosses / totalBenefit) * 100 },
            { subject: "Social", value: (cba.benefits.socialBenefit / totalBenefit) * 100 },
            { subject: "Econômico", value: (cba.benefits.economicGrowth / totalBenefit) * 100 },
            { subject: "Ambiental", value: (cba.benefits.environmentalBenefit / totalBenefit) * 100 },
          ];

          return (
            <div key={cba.id} className="rounded-xl" style={cardStyle}>
              <button
                onClick={() => setSelectedProject(isExpanded ? null : cba)}
                className="w-full text-left p-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{cba.projectName}</h4>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.color)}>
                      <StatusIcon className="h-3 w-3" />{status.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      {categoryLabels[cba.category]}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-1" style={{ color: "var(--text-muted)" }}>{cba.description}</p>
                  <div className="grid grid-cols-5 gap-4 mt-3">
                    <div className="text-xs">
                      <p style={{ color: "var(--text-muted)" }}>Investimento</p>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{formatCurrency(cba.initialInvestment)}</p>
                    </div>
                    <div className="text-xs">
                      <p style={{ color: "var(--text-muted)" }}>BCR</p>
                      <p className={cn("font-bold", cba.bcr >= 2 ? "text-success-600" : cba.bcr >= 1 ? "text-warning-600" : "text-danger-600")}>
                        {cba.bcr}x
                      </p>
                    </div>
                    <div className="text-xs">
                      <p style={{ color: "var(--text-muted)" }}>TIR</p>
                      <p className="font-bold" style={{ color: "var(--accent)" }}>{cba.irr}%</p>
                    </div>
                    <div className="text-xs">
                      <p style={{ color: "var(--text-muted)" }}>Payback</p>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{cba.paybackYears} anos</p>
                    </div>
                    <div className="text-xs">
                      <p style={{ color: "var(--text-muted)" }}>Red. Risco</p>
                      <p className="font-bold text-success-600">{cba.riskReduction}%</p>
                    </div>
                  </div>
                </div>
                {isExpanded
                  ? <ChevronUp className="h-4 w-4 mt-1" style={{ color: "var(--text-muted)" }} />
                  : <ChevronDown className="h-4 w-4 mt-1" style={{ color: "var(--text-muted)" }} />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Financial Details */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Detalhamento Financeiro</h5>
                      <div className="space-y-2 text-xs">
                        {[
                          { label: "VPL (NPV)", value: formatCurrency(cba.npv), highlight: true },
                          { label: "Investimento Inicial", value: formatCurrency(cba.initialInvestment) },
                          { label: "Manutenção Anual", value: formatCurrency(cba.annualMaintenanceCost) },
                          { label: "Horizonte", value: `${cba.horizonYears} anos (${cba.horizon === "short" ? "curto" : cba.horizon === "medium" ? "médio" : "longo"} prazo)` },
                          { label: "Benefício Total", value: formatCurrency(totalBenefit), highlight: true },
                        ].map(({ label, value, highlight }) => (
                          <div key={label} className="flex justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{label}</span>
                            <span className="font-bold" style={{ color: highlight ? "#22c55e" : "var(--text-primary)" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benefit Radar */}
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Composição dos Benefícios</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={benefitBreakdown}>
                          <PolarGrid stroke="var(--border-subtle)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                          <PolarRadiusAxis tick={{ fontSize: 8, fill: "var(--text-muted)" }} domain={[0, 100]} />
                          <Radar dataKey="value" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Benefits Breakdown */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Benefícios Detalhados</h5>
                      <div className="space-y-2">
                        {[
                          { label: "Perdas Evitadas", value: cba.benefits.avoidedLosses, color: "primary" as const },
                          { label: "Benefício Social", value: cba.benefits.socialBenefit, color: "success" as const },
                          { label: "Crescimento Econômico", value: cba.benefits.economicGrowth, color: "warning" as const },
                          { label: "Benefício Ambiental", value: cba.benefits.environmentalBenefit, color: "primary" as const },
                        ].map(({ label, value, color }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span style={{ color: "var(--text-muted)" }}>{label}</span>
                              <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatCurrency(value)}</span>
                            </div>
                            <ProgressBar value={value} max={totalBenefit} showPercentage={false} size="sm" color={color} />
                          </div>
                        ))}
                      </div>
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
