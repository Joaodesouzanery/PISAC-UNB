"use client";

import { useState } from "react";
import { incidents, crises } from "@/data/crisis-data";
import { cn, timeAgo } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  ClipboardList,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Building2,
  MapPin,
  Tag,
  MessageCircle,
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileCheck,
  UserCheck,
  Play,
  CheckCircle,
  Archive,
} from "lucide-react";
import type { Incident, IncidentStatus, IncidentPriority } from "@/types";

const priorityConfig: Record<
  IncidentPriority,
  { label: string; color: string; sortOrder: number }
> = {
  critical: { label: "Crítico", color: "#ef4444", sortOrder: 0 },
  high: { label: "Alto", color: "#f97316", sortOrder: 1 },
  medium: { label: "Médio", color: "#f59e0b", sortOrder: 2 },
  low: { label: "Baixo", color: "#22c55e", sortOrder: 3 },
};

const statusIcons: Record<IncidentStatus, typeof Circle> = {
  open: Circle,
  in_progress: Clock,
  resolved: CheckCircle2,
  escalated: ArrowUpCircle,
};

const statusLabels: Record<IncidentStatus, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  escalated: "Escalado",
};

const statusColors: Record<IncidentStatus, string> = {
  open: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#22c55e",
  escalated: "#ef4444",
};

const workflowSteps = [
  { id: "register", label: "Registro", icon: ClipboardList, description: "Abertura e categorização" },
  { id: "triage", label: "Triagem", icon: Filter, description: "Avaliação de prioridade" },
  { id: "assign", label: "Atribuição", icon: UserCheck, description: "Designação de equipe" },
  { id: "execute", label: "Execução", icon: Play, description: "Ações de resposta" },
  { id: "resolve", label: "Resolução", icon: CheckCircle, description: "Mitigação concluída" },
  { id: "close", label: "Fechamento", icon: Archive, description: "Documentação final" },
];

function getWorkflowStep(status: IncidentStatus): number {
  switch (status) {
    case "open": return 1;
    case "escalated": return 2;
    case "in_progress": return 3;
    case "resolved": return 5;
    default: return 0;
  }
}

export default function IncidentManagement() {
  const [filterCrisis, setFilterCrisis] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<IncidentPriority | "all">("all");
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  const filteredIncidents = incidents
    .filter((inc) => {
      if (filterCrisis !== "all" && inc.crisisId !== filterCrisis) return false;
      if (filterStatus !== "all" && inc.status !== filterStatus) return false;
      if (filterPriority !== "all" && inc.priority !== filterPriority) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = priorityConfig[a.priority].sortOrder;
      const pb = priorityConfig[b.priority].sortOrder;
      if (pa !== pb) return pa - pb;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    inProgress: incidents.filter((i) => i.status === "in_progress").length,
    escalated: incidents.filter((i) => i.status === "escalated").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  };

  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };

  return (
    <div className="space-y-6">
      {/* Workflow Pipeline */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <ClipboardList className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Workflow de Incidentes Configurável
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
                <div className="flex flex-col items-center gap-1 min-w-[90px]">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)" }}>
                    <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>{step.label}</span>
                  <span className="text-[9px] text-center" style={{ color: "var(--text-muted)" }}>{step.description}</span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 flex-shrink-0 mx-1" style={{ color: "var(--text-muted)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "var(--text-muted)" },
          { label: "Abertos", value: stats.open, color: "#3b82f6" },
          { label: "Em Andamento", value: stats.inProgress, color: "#f59e0b" },
          { label: "Escalados", value: stats.escalated, color: "#ef4444" },
          { label: "Resolvidos", value: stats.resolved, color: "#22c55e" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ ...cardStyle, borderLeft: `4px solid ${color}` }}
          >
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl px-4 py-2 flex items-center gap-3 flex-wrap" style={cardStyle}>
        <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        <select
          value={filterCrisis}
          onChange={(e) => setFilterCrisis(e.target.value)}
          className="text-xs rounded-lg px-2 py-1.5"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
        >
          <option value="all">Todas as crises</option>
          {crises.map((c) => (
            <option key={c.id} value={c.id}>{c.title.substring(0, 40)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | "all")}
          className="text-xs rounded-lg px-2 py-1.5"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
        >
          <option value="all">Todos os status</option>
          <option value="open">Aberto</option>
          <option value="in_progress">Em Andamento</option>
          <option value="escalated">Escalado</option>
          <option value="resolved">Resolvido</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as IncidentPriority | "all")}
          className="text-xs rounded-lg px-2 py-1.5"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
        >
          <option value="all">Todas as prioridades</option>
          <option value="critical">Crítico</option>
          <option value="high">Alto</option>
          <option value="medium">Médio</option>
          <option value="low">Baixo</option>
        </select>
        <span className="ml-auto text-[10px]" style={{ color: "var(--text-muted)" }}>
          {filteredIncidents.length} incidentes
        </span>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          const isExpanded = expandedIncident === incident.id;
          const StatusIcon = statusIcons[incident.status];
          const currentStep = getWorkflowStep(incident.status);

          return (
            <div
              key={incident.id}
              className="rounded-xl transition-all"
              style={{
                backgroundColor: "var(--bg-card)",
                border: `2px solid ${incident.status === "escalated" ? "rgba(239,68,68,0.4)" : incident.priority === "critical" ? "rgba(249,115,22,0.3)" : "var(--border-primary)"}`,
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                <div
                  className="mt-0.5 p-1.5 rounded-lg"
                  style={{
                    backgroundColor: `${statusColors[incident.status]}15`,
                    color: statusColors[incident.status],
                  }}
                >
                  <StatusIcon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {incident.title}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${priorityConfig[incident.priority].color}15`, color: priorityConfig[incident.priority].color, border: `1px solid ${priorityConfig[incident.priority].color}30` }}
                    >
                      {priorityConfig[incident.priority].label}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${statusColors[incident.status]}15`, color: statusColors[incident.status] }}
                    >
                      {statusLabels[incident.status]}
                    </span>
                  </div>
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] flex-wrap" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{incident.assignedTo}</span>
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{incident.assignedAgency}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{incident.municipality}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(incident.updatedAt)}</span>
                    {incident.updates.length > 0 && (
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{incident.updates.length} atualizações</span>
                    )}
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                ) : (
                  <ChevronDown className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                )}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  {/* Workflow Progress for this incident */}
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                      Progresso do Workflow
                    </p>
                    <div className="flex items-center gap-1">
                      {workflowSteps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-1 flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className="w-full h-1.5 rounded-full"
                              style={{
                                backgroundColor: i < currentStep ? "var(--accent)" : i === currentStep ? "rgba(249,115,22,0.4)" : "var(--border-subtle)",
                              }}
                            />
                            <span className="text-[8px] mt-0.5" style={{ color: i <= currentStep ? "var(--accent)" : "var(--text-muted)" }}>
                              {step.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Descrição</p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{incident.description}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Localização</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                          <MapPin className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                          {incident.location}
                        </p>
                      </div>
                      {incident.deadline && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Prazo</p>
                          <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#ef4444" }}>
                            <Clock className="h-3 w-3" />
                            {new Date(incident.deadline).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Tags</p>
                        <div className="flex gap-1 flex-wrap">
                          {incident.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Updates */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                        Histórico de Atualizações
                      </p>
                      {incident.updates.length === 0 ? (
                        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>Nenhuma atualização registrada</p>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                          {incident.updates
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((update) => (
                              <div
                                key={update.id}
                                className="p-2 rounded-lg text-xs"
                                style={{
                                  backgroundColor: update.type === "escalation" ? "rgba(239,68,68,0.08)" : update.type === "resource_update" ? "rgba(245,158,11,0.08)" : update.type === "status_change" ? "rgba(59,130,246,0.08)" : "var(--bg-elevated)",
                                  border: `1px solid ${update.type === "escalation" ? "rgba(239,68,68,0.2)" : update.type === "resource_update" ? "rgba(245,158,11,0.2)" : update.type === "status_change" ? "rgba(59,130,246,0.2)" : "var(--border-subtle)"}`,
                                }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{update.author}</span>
                                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{timeAgo(update.timestamp)}</span>
                                </div>
                                <p className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>{update.agency}</p>
                                <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{update.message}</p>
                              </div>
                            ))}
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
