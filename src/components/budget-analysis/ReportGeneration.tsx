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

  // Quick stats for overview
  const totalProjects = costBenefitAnalyses.length;
  const totalInvestment = investmentPlans.reduce((s, p) => s + p.totalCost, 0);
  const totalBenefits = investmentPlans.reduce((s, p) => s + p.expectedBenefits, 0);
  const scenariosAnalyzed = disasterFinancialScenarios.length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary-600" />
          Dados Disponíveis para Relatórios
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500">Projetos Analisados</p>
            <p className="text-lg font-bold text-gray-900">{totalProjects}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500">Investimento Planejado</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500">Benefícios Esperados</p>
            <p className="text-lg font-bold text-success-600">{formatCurrency(totalBenefits)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500">Cenários Modelados</p>
            <p className="text-lg font-bold text-warning-600">{scenariosAnalyzed}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500">Relatórios Gerados</p>
            <p className="text-lg font-bold text-gray-900">{budgetReports.length}</p>
          </div>
        </div>
      </div>

      {/* Generate New Report */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-primary-900 mb-3 flex items-center gap-2">
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
                className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-lg border border-primary-200 hover:border-primary-400 hover:shadow-sm transition-all text-center"
              >
                <Icon className="h-5 w-5 text-primary-600" />
                <span className="text-[10px] font-medium text-gray-700">{config.label}</span>
              </button>
            );
          })}
        </div>
        {isGenerating && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-primary-700">Gerando relatório com dados integrados da plataforma...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="all">Todos os tipos</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>{typeConfig[type].label}</option>
              ))}
            </select>
            <span className="text-[10px] text-gray-400 ml-auto">
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
                  className={cn(
                    "w-full text-left bg-white rounded-lg shadow-sm border-2 p-4 transition-all hover:shadow-md",
                    isSelected ? "border-primary-400 ring-2 ring-primary-100" : "border-gray-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg flex-shrink-0", type.color)}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-bold text-gray-900">{report.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{report.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 flex-wrap">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-primary-600" />
                  <h3 className="text-sm font-bold text-gray-900">Prévia do Relatório</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1">{selectedReport.title}</h4>
                    <div className="flex gap-2 mb-2">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", typeConfig[selectedReport.type].color)}>
                        {typeConfig[selectedReport.type].label}
                      </span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusConfig[selectedReport.status].color)}>
                        {statusConfig[selectedReport.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedReport.summary}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-primary-500" />
                      Principais Achados
                    </p>
                    <div className="space-y-1.5">
                      {selectedReport.keyFindings.map((finding, i) => (
                        <div key={i} className="flex gap-2 p-2 bg-primary-50 rounded-lg border border-primary-100">
                          <span className="text-[10px] text-primary-600 font-bold mt-0.5">{i + 1}.</span>
                          <p className="text-[11px] text-primary-800">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-warning-500" />
                      Recomendações
                    </p>
                    <div className="space-y-1.5">
                      {selectedReport.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-2 p-2 bg-warning-50 rounded-lg border border-warning-100">
                          <span className="text-[10px] text-warning-600 font-bold mt-0.5">{i + 1}.</span>
                          <p className="text-[11px] text-warning-800">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-gray-500">Gerado em</p>
                      <p className="font-medium text-gray-900">{selectedReport.generatedAt}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-gray-500">Período</p>
                      <p className="font-medium text-gray-900">{selectedReport.period}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 col-span-2">
                      <p className="text-gray-500">Destinatário</p>
                      <p className="font-medium text-gray-900">{selectedReport.targetAudience}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">
                    <Download className="h-3 w-3" />
                    Exportar PDF
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Download className="h-3 w-3" />
                    Exportar Excel
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Send className="h-3 w-3" />
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Selecione um relatório para visualizar a prévia
              </p>
            </div>
          )}

          {/* Template Guide */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
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
                    <span className="text-gray-700 font-medium">{config.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-3">
              Relatórios são gerados automaticamente com dados integrados de
              risco, orçamento e análises da plataforma PISAC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
