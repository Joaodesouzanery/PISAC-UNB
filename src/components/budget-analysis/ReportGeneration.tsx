"use client";

import { useState } from "react";
import { budgetReports, costBenefitAnalyses, investmentPlans, disasterFinancialScenarios } from "@/data/budget-analysis-data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Eye,
  Clock,
  Users,
  CheckCircle,
  FileEdit,
  Send,
  Filter,
  Plus,
  BarChart3,
  Calculator,
  PieChart,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Calendar,
} from "lucide-react";
import type { BudgetReport } from "@/types";

const typeConfig: Record<BudgetReport["type"], { label: string; icon: typeof FileText; color: string }> = {
  cost_benefit: { label: "Custo-Benefício", icon: Calculator, color: "bg-blue-100 text-blue-700" },
  impact_analysis: { label: "Análise de Impacto", icon: AlertTriangle, color: "bg-orange-100 text-orange-700" },
  investment_plan: { label: "Plano de Investimento", icon: PieChart, color: "bg-purple-100 text-purple-700" },
  accountability: { label: "Prestação de Contas", icon: BarChart3, color: "bg-green-100 text-green-700" },
  funding_request: { label: "Captação de Recursos", icon: TrendingUp, color: "bg-cyan-100 text-cyan-700" },
};

const statusConfig: Record<BudgetReport["status"], { label: string; icon: typeof CheckCircle; color: string }> = {
  draft: { label: "Rascunho", icon: FileEdit, color: "bg-gray-100 text-gray-600" },
  final: { label: "Finalizado", icon: CheckCircle, color: "bg-success-100 text-success-700" },
  submitted: { label: "Submetido", icon: Send, color: "bg-primary-100 text-primary-700" },
};

export default function ReportGeneration() {
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<BudgetReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReports = budgetReports.filter(
    (r) => filterType === "all" || r.type === filterType
  );

  const reportTypes = Array.from(new Set(budgetReports.map((r) => r.type)));

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const totalProjects = costBenefitAnalyses.length;
  const totalInvestment = investmentPlans.reduce((s, p) => s + p.totalCost, 0);
  const totalBenefits = investmentPlans.reduce((s, p) => s + p.expectedBenefits, 0);
  const scenariosAnalyzed = disasterFinancialScenarios.length;

  const cardStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <BarChart3 className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Dados Disponíveis para Relatórios
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Projetos Analisados", value: totalProjects, color: "var(--text-primary)" },
            { label: "Investimento Planejado", value: formatCurrency(totalInvestment), color: "#3b82f6" },
            { label: "Benefícios Esperados", value: formatCurrency(totalBenefits), color: "#22c55e" },
            { label: "Cenários Modelados", value: scenariosAnalyzed, color: "#f59e0b" },
            { label: "Relatórios Gerados", value: budgetReports.length, color: "var(--text-primary)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg p-3 text-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-lg font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate New Report */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)" }}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--accent)" }}>
          <Plus className="h-4 w-4" />
          Gerar Novo Relatório
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={generateReport}
                disabled={isGenerating}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all text-center hover:shadow-sm"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
              >
                <Icon className="h-5 w-5" style={{ color: "var(--accent)" }} />
                <span className="text-[10px] font-medium" style={{ color: "var(--text-primary)" }}>{config.label}</span>
              </button>
            );
          })}
        </div>
        {isGenerating && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            <span className="text-xs" style={{ color: "var(--accent)" }}>Gerando relatório com dados integrados da plataforma...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs rounded-lg px-2 py-1.5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            >
              <option value="all">Todos os tipos</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>{typeConfig[type].label}</option>
              ))}
            </select>
            <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>
              {filteredReports.length} relatórios
            </span>
          </div>

          {/* Reports */}
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const type = typeConfig[report.type];
              const status = statusConfig[report.status];
              const TypeIcon = type.icon;
              const StatusIcon = status.icon;
              const isSelected = selectedReport?.id === report.id;

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="w-full text-left rounded-xl p-4 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-primary)"}`,
                    boxShadow: isSelected ? "0 0 0 2px var(--accent-muted)" : undefined,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg flex-shrink-0", type.color)}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{report.title}</h4>
                      </div>
                      <p className="text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>{report.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] flex-wrap" style={{ color: "var(--text-muted)" }}>
                        <span className={cn("px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.color)}>
                          <StatusIcon className="h-3 w-3" />{status.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{report.generatedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />{report.targetAudience}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{report.period}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Detail */}
        <div className="space-y-4">
          {selectedReport ? (
            <>
              <div className="rounded-xl p-4" style={cardStyle}>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Prévia do Relatório</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold mb-1" style={{ color: "var(--text-primary)" }}>{selectedReport.title}</h4>
                    <div className="flex gap-2 mb-2">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", typeConfig[selectedReport.type].color)}>
                        {typeConfig[selectedReport.type].label}
                      </span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusConfig[selectedReport.status].color)}>
                        {statusConfig[selectedReport.status].label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{selectedReport.summary}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <Lightbulb className="h-3 w-3" style={{ color: "var(--accent)" }} />
                      Principais Achados
                    </p>
                    <div className="space-y-1.5">
                      {selectedReport.keyFindings.map((finding, i) => (
                        <div key={i} className="flex gap-2 p-2 rounded-lg" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.2)" }}>
                          <span className="text-[10px] font-bold mt-0.5" style={{ color: "var(--accent)" }}>{i + 1}.</span>
                          <p className="text-[11px]" style={{ color: "var(--text-primary)" }}>{finding}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <AlertTriangle className="h-3 w-3 text-warning-500" />
                      Recomendações
                    </p>
                    <div className="space-y-1.5">
                      {selectedReport.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-2 p-2 rounded-lg" style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                          <span className="text-[10px] text-warning-600 font-bold mt-0.5">{i + 1}.</span>
                          <p className="text-[11px]" style={{ color: "var(--text-primary)" }}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {[
                      { label: "Gerado em", value: selectedReport.generatedAt },
                      { label: "Período", value: selectedReport.period },
                      { label: "Destinatário", value: selectedReport.targetAudience, span: true },
                    ].map(({ label, value, span }) => (
                      <div key={label} className={cn("rounded p-2", span && "col-span-2")} style={{ backgroundColor: "var(--bg-elevated)" }}>
                        <p style={{ color: "var(--text-muted)" }}>{label}</p>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                    <Download className="h-3 w-3" />
                    Exportar PDF
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}>
                    <Download className="h-3 w-3" />
                    Excel
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}>
                    <Send className="h-3 w-3" />
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl p-8 text-center" style={cardStyle}>
              <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Selecione um relatório para visualizar a prévia
              </p>
            </div>
          )}

          {/* Template Guide */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Modelos Disponíveis
            </h3>
            <div className="space-y-2">
              {Object.entries(typeConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div className={cn("p-1 rounded", config.color)}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{config.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] mt-3" style={{ color: "var(--text-muted)" }}>
              Relatórios são gerados automaticamente com dados integrados de
              risco, orçamento e análises da plataforma PISAC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
