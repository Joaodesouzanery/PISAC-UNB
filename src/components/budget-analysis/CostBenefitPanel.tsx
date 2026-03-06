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

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500">Investimento Total</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalInvestment)}</p>
          <p className="text-[10px] text-gray-400">{costBenefitAnalyses.length} projetos analisados</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500">Benefícios Totais</p>
          <p className="text-xl font-bold text-success-600">{formatCurrency(totalBenefits)}</p>
          <p className="text-[10px] text-gray-400">ao longo da vida útil</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500">BCR Médio</p>
          <p className="text-xl font-bold text-warning-600">{avgBCR.toFixed(1)}x</p>
          <p className="text-[10px] text-gray-400">retorno por real investido</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-400 p-4">
          <p className="text-xs text-gray-500">TIR Média</p>
          <p className="text-xl font-bold text-primary-600">{avgIRR.toFixed(1)}%</p>
          <p className="text-[10px] text-gray-400">taxa interna de retorno</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Comparativo BCR e TIR por Projeto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="bcr" fill="#2563eb" name="BCR (x)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="irr" fill="#22c55e" name="TIR (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Scatter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Eficiência: Investimento vs BCR
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" name="Investimento (R$M)" tick={{ fontSize: 10 }}
                label={{ value: "Investimento (R$M)", position: "bottom", fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name="BCR" tick={{ fontSize: 10 }}
                label={{ value: "BCR", angle: -90, position: "left", fontSize: 10 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip formatter={(value: number, name: string) => {
                if (name === "x") return [`R$ ${value.toFixed(0)}M`, "Investimento"];
                if (name === "y") return [`${value.toFixed(1)}x`, "BCR"];
                return [value, name];
              }} />
              <Scatter data={efficiencyData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Tamanho do ponto = redução de risco esperada
          </p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Ordenar por:</span>
        {[
          { key: "bcr" as const, label: "BCR" },
          { key: "npv" as const, label: "VPL" },
          { key: "irr" as const, label: "TIR" },
          { key: "payback" as const, label: "Payback" },
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
            <div key={cba.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setSelectedProject(isExpanded ? null : cba)}
                className="w-full text-left p-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{cba.projectName}</h4>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.color)}>
                      <StatusIcon className="h-3 w-3" />{status.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {categoryLabels[cba.category]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{cba.description}</p>
                  <div className="grid grid-cols-5 gap-4 mt-3">
                    <div className="text-xs">
                      <p className="text-gray-400">Investimento</p>
                      <p className="font-bold text-gray-900">{formatCurrency(cba.initialInvestment)}</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400">BCR</p>
                      <p className={cn("font-bold", cba.bcr >= 2 ? "text-success-600" : cba.bcr >= 1 ? "text-warning-600" : "text-danger-600")}>
                        {cba.bcr}x
                      </p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400">TIR</p>
                      <p className="font-bold text-primary-600">{cba.irr}%</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400">Payback</p>
                      <p className="font-bold text-gray-900">{cba.paybackYears} anos</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400">Red. Risco</p>
                      <p className="font-bold text-success-600">{cba.riskReduction}%</p>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 mt-1" /> : <ChevronDown className="h-4 w-4 text-gray-400 mt-1" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Financial Details */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Detalhamento Financeiro</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-gray-500">VPL (NPV)</span>
                          <span className="font-bold text-success-600">{formatCurrency(cba.npv)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-gray-500">Investimento Inicial</span>
                          <span className="font-bold">{formatCurrency(cba.initialInvestment)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-gray-500">Manutenção Anual</span>
                          <span className="font-bold">{formatCurrency(cba.annualMaintenanceCost)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-gray-500">Horizonte</span>
                          <span className="font-bold">{cba.horizonYears} anos ({cba.horizon === "short" ? "curto" : cba.horizon === "medium" ? "médio" : "longo"} prazo)</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-gray-500">Benefício Total</span>
                          <span className="font-bold text-success-600">{formatCurrency(totalBenefit)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Benefit Radar */}
                    <div>
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Composição dos Benefícios</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={benefitBreakdown}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                          <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                          <Radar dataKey="value" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Benefits Breakdown */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Benefícios Detalhados</h5>
                      <div className="space-y-2">
                        {[
                          { label: "Perdas Evitadas", value: cba.benefits.avoidedLosses, color: "primary" as const },
                          { label: "Benefício Social", value: cba.benefits.socialBenefit, color: "success" as const },
                          { label: "Crescimento Econômico", value: cba.benefits.economicGrowth, color: "warning" as const },
                          { label: "Benefício Ambiental", value: cba.benefits.environmentalBenefit, color: "primary" as const },
                        ].map(({ label, value, color }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-medium">{formatCurrency(value)}</span>
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
