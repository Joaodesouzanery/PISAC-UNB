"use client";

import { ePingStandards, complianceMetrics } from "@/data/governance-data";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  Network,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Shield,
  Layers,
  Wifi,
  Database,
  FileText,
  Accessibility,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  compliant: { label: "Conforme", color: "text-success-700", bg: "bg-success-100" },
  partial: { label: "Parcial", color: "text-warning-700", bg: "bg-warning-100" },
  non_compliant: { label: "Não Conforme", color: "text-danger-700", bg: "bg-danger-100" },
  under_review: { label: "Em Revisão", color: "text-blue-700", bg: "bg-blue-100" },
};

const categoryConfig: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  interconnection: { label: "Interconexão", icon: Wifi, color: "bg-blue-100 text-blue-700" },
  security: { label: "Segurança", icon: Shield, color: "bg-red-100 text-red-700" },
  integration: { label: "Meios de Acesso", icon: Layers, color: "bg-green-100 text-green-700" },
  data_organization: { label: "Organização da Informação", icon: Database, color: "bg-purple-100 text-purple-700" },
  content_access: { label: "Áreas de Integração", icon: Accessibility, color: "bg-orange-100 text-orange-700" },
};

export default function Interoperability() {
  const categories = Object.keys(categoryConfig);
  const totalStandards = ePingStandards.length;
  const compliantStandards = ePingStandards.filter((s) => s.implementationStatus === "compliant").length;
  const partialStandards = ePingStandards.filter((s) => s.implementationStatus === "partial").length;

  const ePingMetric = complianceMetrics.find((m) => m.category.includes("e-PING"));
  const overallScore = ePingMetric
    ? Math.round(((ePingMetric.compliant + ePingMetric.partial * 0.5) / ePingMetric.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Network className="h-3 w-3" /> Padrões e-PING
          </p>
          <p className="text-xl font-bold text-gray-900">{totalStandards}</p>
          <p className="text-[10px] text-gray-400">avaliados</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Conformes
          </p>
          <p className="text-xl font-bold text-success-600">{compliantStandards}</p>
          <p className="text-[10px] text-gray-400">{((compliantStandards / totalStandards) * 100).toFixed(0)}% aderência total</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Parciais
          </p>
          <p className="text-xl font-bold text-warning-600">{partialStandards}</p>
          <p className="text-[10px] text-gray-400">em adequação</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-cyan-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Score Geral
          </p>
          <p className="text-xl font-bold text-cyan-600">{overallScore}%</p>
          <p className="text-[10px] text-gray-400">aderência ponderada</p>
        </div>
      </div>

      {/* Category Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-600" />
          Aderência por Segmento e-PING
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            const standards = ePingStandards.filter((s) => s.category === cat);
            const catCompliant = standards.filter((s) => s.implementationStatus === "compliant").length;

            return (
              <div key={cat} className="text-center">
                <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2", config.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-gray-900 mb-1">{config.label}</p>
                <ProgressBar
                  value={catCompliant}
                  max={standards.length}
                  size="sm"
                  color={catCompliant === standards.length ? "success" : "warning"}
                  showPercentage
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {catCompliant}/{standards.length} conformes
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standards Detail */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary-600" />
          Detalhamento dos Padrões Implementados
        </h3>

        {categories.map((cat) => {
          const config = categoryConfig[cat];
          const Icon = config.icon;
          const standards = ePingStandards.filter((s) => s.category === cat);

          return (
            <div key={cat} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-1.5 rounded", config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">{config.label}</h4>
              </div>

              <div className="space-y-2">
                {standards.map((std) => {
                  const status = statusConfig[std.implementationStatus];

                  return (
                    <div key={std.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h5 className="text-xs font-bold text-gray-900">{std.name}</h5>
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", status.bg, status.color)}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-600">{std.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-[10px] bg-gray-50 rounded-lg p-2 mt-2">
                        <div>
                          <p className="text-gray-500">Padrão de Referência</p>
                          <p className="font-medium text-gray-800">{std.standard}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tecnologia Adotada</p>
                          <p className="font-medium text-gray-800">{std.adoptedTechnology}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Observações</p>
                          <p className="font-medium text-gray-800">{std.notes}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Map */}
      <div className="bg-primary-50 rounded-lg border border-primary-200 p-4">
        <h3 className="text-sm font-bold text-primary-900 mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Integrações Governamentais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs font-bold text-primary-900 mb-2">Sistemas Federais</p>
            <div className="space-y-1 text-[10px] text-primary-800">
              <p>• S2iD - Sistema Integrado de Informações sobre Desastres</p>
              <p>• INDE - Infraestrutura Nacional de Dados Espaciais</p>
              <p>• CEMADEN - Centro Nacional de Monitoramento</p>
              <p>• dados.gov.br - Portal de Dados Abertos</p>
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs font-bold text-primary-900 mb-2">Sistemas Distritais</p>
            <div className="space-y-1 text-[10px] text-primary-800">
              <p>• GDF - Sistemas de gestão do Governo do DF</p>
              <p>• CAESB - Monitoramento hídrico</p>
              <p>• CEB - Rede de energia e subestações</p>
              <p>• DETRAN-DF - Dados de tráfego</p>
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs font-bold text-primary-900 mb-2">Dados Abertos</p>
            <div className="space-y-1 text-[10px] text-primary-800">
              <p>• Alertas públicos via API REST (JSON)</p>
              <p>• Camadas GIS em formato GeoJSON</p>
              <p>• Catálogo CKAN de dados abertos</p>
              <p>• Relatórios em PDF/A (ISO 19005)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
