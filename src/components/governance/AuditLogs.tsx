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
  MapPin,
  HelpCircle,
} from "lucide-react";
import type { AuditActionType } from "@/types";

const actionConfig: Record<AuditActionType, { label: string; icon: typeof Eye; color: string }> = {
  login: { label: "Login", icon: LogIn, color: "#3b82f6" },
  logout: { label: "Logout", icon: LogOut, color: "#94a3b8" },
  data_access: { label: "Acesso a Dados", icon: Eye, color: "#22c55e" },
  data_export: { label: "Exportação", icon: FileOutput, color: "#f97316" },
  data_modify: { label: "Modificação", icon: Edit3, color: "#eab308" },
  report_generate: { label: "Relatório Gerado", icon: FileText, color: "#8b5cf6" },
  alert_acknowledge: { label: "Alerta Reconhecido", icon: Bell, color: "#ef4444" },
  config_change: { label: "Config. Alterada", icon: Settings, color: "#06b6d4" },
  permission_change: { label: "Permissão Alterada", icon: Key, color: "#ef4444" },
  crisis_action: { label: "Ação de Crise", icon: Zap, color: "#ef4444" },
  api_call: { label: "Chamada API", icon: Globe, color: "#6366f1" },
};

const riskColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
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

  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Registros", value: totalActions, sub: "últimas 24 horas", icon: ScrollText, color: "var(--accent)" },
          { label: "Ações Negadas", value: failedActions, sub: "requerem investigação", icon: XCircle, color: "#ef4444" },
          { label: "Alto Risco", value: highRiskActions, sub: "ações sensíveis registradas", icon: AlertTriangle, color: "#f59e0b" },
          { label: "Usuários Ativos", value: uniqueUsers, sub: "no período", icon: Shield, color: "#22c55e" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl" style={{ ...cardStyle, borderLeft: `4px solid ${color}` }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Icon className="h-3 w-3" /> {label}
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar em logs de auditoria..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs rounded-lg px-2 py-2"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            >
              <option value="all">Todas as ações</option>
              {Object.entries(actionConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs rounded-lg px-2 py-2"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            >
              <option value="all">Todos os riscos</option>
              <option value="low">Baixo</option>
              <option value="medium">Médio</option>
              <option value="high">Alto</option>
            </select>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ml-auto" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            <Download className="h-3 w-3" />
            Exportar Logs
          </button>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <ScrollText className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Registro de Auditoria — Quem, O quê, Quando, Onde, Por quê
          <span className="text-[10px] font-normal ml-auto" style={{ color: "var(--text-muted)" }}>
            {filteredLogs.length} registros
          </span>
        </h3>

        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const action = actionConfig[log.action];
            const ActionIcon = action.icon;
            const riskColor = riskColors[log.riskLevel];

            return (
              <div
                key={log.id}
                className="flex gap-3 p-3 rounded-lg transition-all"
                style={{
                  border: `2px solid ${!log.success ? "rgba(239,68,68,0.3)" : log.riskLevel === "high" ? "rgba(245,158,11,0.3)" : "var(--border-subtle)"}`,
                  backgroundColor: !log.success ? "rgba(239,68,68,0.05)" : log.riskLevel === "high" ? "rgba(245,158,11,0.03)" : "transparent",
                }}
              >
                <div className="p-2 rounded-lg flex-shrink-0 h-fit" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                  <ActionIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{log.userName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                      {action.label}
                    </span>
                    {!log.success && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                        NEGADO
                      </span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: `${riskColor}15`, color: riskColor }}>
                      Risco: {riskLabels[log.riskLevel]}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{log.details}</p>

                  {/* Enhanced 5W: When, Where, Why */}
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-start gap-1.5 p-1.5 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: "#3b82f6" }} />
                      <div>
                        <p className="text-[9px] font-bold" style={{ color: "#3b82f6" }}>QUANDO</p>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          {new Date(log.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5 p-1.5 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                      <div>
                        <p className="text-[9px] font-bold" style={{ color: "#f59e0b" }}>ONDE</p>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          IP: {log.ipAddress} • Módulo: {log.module}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5 p-1.5 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <HelpCircle className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: "#8b5cf6" }} />
                      <div>
                        <p className="text-[9px] font-bold" style={{ color: "#8b5cf6" }}>POR QUÊ</p>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          {log.action === "login" ? "Acesso ao sistema" : log.action === "logout" ? "Encerramento de sessão" : log.action === "data_access" ? "Consulta de dados operacionais" : log.action === "data_export" ? "Exportação para relatório externo" : log.action === "data_modify" ? "Atualização de registros" : log.action === "crisis_action" ? "Resposta a incidente de crise" : log.action === "permission_change" ? "Gestão de acessos de segurança" : log.action === "config_change" ? "Manutenção de configuração" : log.action === "report_generate" ? "Geração de relatório gerencial" : log.action === "alert_acknowledge" ? "Reconhecimento de alerta do sistema" : "Integração com sistema externo"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[10px] flex-wrap" style={{ color: "var(--text-muted)" }}>
                    <span>Recurso: {log.resource}</span>
                    {log.dataClassification && (
                      <span className="font-medium" style={{ color: "#f97316" }}>Dados: {log.dataClassification}</span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {log.success ? (
                    <CheckCircle className="h-4 w-4" style={{ color: "#22c55e" }} />
                  ) : (
                    <XCircle className="h-4 w-4" style={{ color: "#ef4444" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Policy */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", borderRadius: 12 }}>
        <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>Política de Auditoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          <div>
            <p className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Retenção</p>
            <p>• Logs de acesso: 5 anos</p>
            <p>• Logs de segurança: 10 anos</p>
            <p>• Logs de crise: 20 anos</p>
          </div>
          <div>
            <p className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Integridade</p>
            <p>• Hash SHA-256 por registro</p>
            <p>• Cadeia de integridade blockchain-like</p>
            <p>• Backup imutável em storage separado</p>
          </div>
          <div>
            <p className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Conformidade</p>
            <p>• Art. 37, LGPD (registro de operações)</p>
            <p>• IN GSI/PR nº 1/2020 (segurança)</p>
            <p>• TCU - Normas de auditoria pública</p>
          </div>
        </div>
      </div>
    </div>
  );
}
