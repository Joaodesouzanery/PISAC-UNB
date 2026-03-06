"use client";

import { useState } from "react";
import { auditLogs } from "@/data/governance-data";
import { cn } from "@/lib/utils";
import {
  ScrollText,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Download,
  LogIn,
  LogOut,
  Eye,
  Edit3,
  FileOutput,
  FileText,
  Bell,
  Settings,
  Key,
  Zap,
  Globe,
} from "lucide-react";
import type { AuditActionType } from "@/types";

const actionConfig: Record<AuditActionType, { label: string; icon: typeof Eye; color: string }> = {
  login: { label: "Login", icon: LogIn, color: "bg-blue-100 text-blue-700" },
  logout: { label: "Logout", icon: LogOut, color: "bg-gray-100 text-gray-700" },
  data_access: { label: "Acesso a Dados", icon: Eye, color: "bg-green-100 text-green-700" },
  data_export: { label: "Exportação", icon: FileOutput, color: "bg-orange-100 text-orange-700" },
  data_modify: { label: "Modificação", icon: Edit3, color: "bg-yellow-100 text-yellow-700" },
  report_generate: { label: "Relatório Gerado", icon: FileText, color: "bg-purple-100 text-purple-700" },
  alert_acknowledge: { label: "Alerta Reconhecido", icon: Bell, color: "bg-red-100 text-red-700" },
  config_change: { label: "Config. Alterada", icon: Settings, color: "bg-cyan-100 text-cyan-700" },
  permission_change: { label: "Permissão Alterada", icon: Key, color: "bg-red-100 text-red-700" },
  crisis_action: { label: "Ação de Crise", icon: Zap, color: "bg-red-100 text-red-700" },
  api_call: { label: "Chamada API", icon: Globe, color: "bg-indigo-100 text-indigo-700" },
};

const riskColors: Record<string, string> = {
  low: "bg-success-100 text-success-700",
  medium: "bg-warning-100 text-warning-700",
  high: "bg-danger-100 text-danger-700",
};

const riskLabels: Record<string, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (filterRisk !== "all" && log.riskLevel !== filterRisk) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        log.userName.toLowerCase().includes(s) ||
        log.details.toLowerCase().includes(s) ||
        log.resource.toLowerCase().includes(s) ||
        log.module.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalActions = auditLogs.length;
  const failedActions = auditLogs.filter((l) => !l.success).length;
  const highRiskActions = auditLogs.filter((l) => l.riskLevel === "high").length;
  const uniqueUsers = new Set(auditLogs.map((l) => l.userId)).size;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <ScrollText className="h-3 w-3" /> Total de Registros
          </p>
          <p className="text-xl font-bold text-gray-900">{totalActions}</p>
          <p className="text-[10px] text-gray-400">últimas 24 horas</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-danger-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Ações Negadas
          </p>
          <p className="text-xl font-bold text-danger-600">{failedActions}</p>
          <p className="text-[10px] text-gray-400">requerem investigação</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Alto Risco
          </p>
          <p className="text-xl font-bold text-warning-600">{highRiskActions}</p>
          <p className="text-[10px] text-gray-400">ações sensíveis registradas</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Usuários Ativos
          </p>
          <p className="text-xl font-bold text-gray-900">{uniqueUsers}</p>
          <p className="text-[10px] text-gray-400">no período</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar em logs de auditoria..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
            >
              <option value="all">Todas as ações</option>
              {Object.entries(actionConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
            >
              <option value="all">Todos os riscos</option>
              <option value="low">Baixo</option>
              <option value="medium">Médio</option>
              <option value="high">Alto</option>
            </select>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors ml-auto">
            <Download className="h-3 w-3" />
            Exportar Logs
          </button>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-primary-600" />
          Registro de Auditoria
          <span className="text-[10px] text-gray-400 font-normal ml-auto">
            {filteredLogs.length} registros
          </span>
        </h3>

        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const action = actionConfig[log.action];
            const ActionIcon = action.icon;

            return (
              <div
                key={log.id}
                className={cn(
                  "flex gap-3 p-3 rounded-lg border-2 transition-all",
                  !log.success
                    ? "border-danger-200 bg-danger-50/30"
                    : log.riskLevel === "high"
                    ? "border-warning-200 bg-warning-50/20"
                    : "border-gray-100 bg-white"
                )}
              >
                <div className={cn("p-2 rounded-lg flex-shrink-0 h-fit", action.color)}>
                  <ActionIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-gray-900">{log.userName}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", action.color)}>
                      {action.label}
                    </span>
                    {!log.success && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-danger-500 text-white rounded font-bold">
                        NEGADO
                      </span>
                    )}
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", riskColors[log.riskLevel])}>
                      Risco: {riskLabels[log.riskLevel]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{log.details}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString("pt-BR", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit"
                      })}
                    </span>
                    <span>Módulo: {log.module}</span>
                    <span>Recurso: {log.resource}</span>
                    <span>IP: {log.ipAddress}</span>
                    {log.dataClassification && (
                      <span className="font-medium text-orange-600">
                        Dados: {log.dataClassification}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {log.success ? (
                    <CheckCircle className="h-4 w-4 text-success-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-danger-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Policy */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          Política de Auditoria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div>
            <p className="font-bold text-gray-900 mb-1">Retenção</p>
            <p>• Logs de acesso: 5 anos</p>
            <p>• Logs de segurança: 10 anos</p>
            <p>• Logs de crise: 20 anos</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-1">Integridade</p>
            <p>• Hash SHA-256 por registro</p>
            <p>• Cadeia de integridade blockchain-like</p>
            <p>• Backup imutável em storage separado</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-1">Conformidade</p>
            <p>• Art. 37, LGPD (registro de operações)</p>
            <p>• IN GSI/PR nº 1/2020 (segurança)</p>
            <p>• TCU - Normas de auditoria pública</p>
          </div>
        </div>
      </div>
    </div>
  );
}
