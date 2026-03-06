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
} from "lucide-react";
import type { Incident, IncidentStatus, IncidentPriority } from "@/types";

const priorityConfig: Record<
  IncidentPriority,
  { label: string; color: string; sortOrder: number }
> = {
  critical: { label: "Crítico", color: "bg-danger-100 text-danger-700 border-danger-200", sortOrder: 0 },
  high: { label: "Alto", color: "bg-orange-100 text-orange-700 border-orange-200", sortOrder: 1 },
  medium: { label: "Médio", color: "bg-warning-100 text-warning-700 border-warning-200", sortOrder: 2 },
  low: { label: "Baixo", color: "bg-green-100 text-green-700 border-green-200", sortOrder: 3 },
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

  // Stats
  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    inProgress: incidents.filter((i) => i.status === "in_progress").length,
    escalated: incidents.filter((i) => i.status === "escalated").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "border-l-gray-400" },
          { label: "Abertos", value: stats.open, color: "border-l-blue-500" },
          { label: "Em Andamento", value: stats.inProgress, color: "border-l-warning-500" },
          { label: "Escalados", value: stats.escalated, color: "border-l-danger-500" },
          { label: "Resolvidos", value: stats.resolved, color: "border-l-success-500" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={cn(
              "bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 p-3",
              color
            )}
          >
            <p className="text-[10px] text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={filterCrisis}
          onChange={(e) => setFilterCrisis(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
        >
          <option value="all">Todas as crises</option>
          {crises.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title.substring(0, 40)}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | "all")}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
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
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
        >
          <option value="all">Todas as prioridades</option>
          <option value="critical">Crítico</option>
          <option value="high">Alto</option>
          <option value="medium">Médio</option>
          <option value="low">Baixo</option>
        </select>
        <span className="ml-auto text-[10px] text-gray-400">
          {filteredIncidents.length} incidentes
        </span>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          const isExpanded = expandedIncident === incident.id;
          const StatusIcon = statusIcons[incident.status];

          return (
            <div
              key={incident.id}
              className={cn(
                "bg-white rounded-lg shadow-sm border-2 transition-all",
                incident.status === "escalated"
                  ? "border-danger-300"
                  : incident.priority === "critical"
                  ? "border-orange-200"
                  : "border-gray-200"
              )}
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedIncident(isExpanded ? null : incident.id)
                }
                className="w-full text-left p-4 flex items-start gap-3"
              >
                <div
                  className={cn(
                    "mt-0.5 p-1.5 rounded-lg",
                    incident.status === "escalated"
                      ? "bg-danger-50 text-danger-600"
                      : incident.status === "resolved"
                      ? "bg-success-50 text-success-600"
                      : incident.status === "in_progress"
                      ? "bg-warning-50 text-warning-600"
                      : "bg-blue-50 text-blue-600"
                  )}
                >
                  <StatusIcon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">
                      {incident.title}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                        priorityConfig[incident.priority].color
                      )}
                    >
                      {priorityConfig[incident.priority].label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        incident.status === "escalated"
                          ? "bg-danger-100 text-danger-700"
                          : incident.status === "resolved"
                          ? "bg-success-100 text-success-700"
                          : incident.status === "in_progress"
                          ? "bg-warning-100 text-warning-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {statusLabels[incident.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {incident.assignedTo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {incident.assignedAgency}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {incident.municipality}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(incident.updatedAt)}
                    </span>
                    {incident.updates.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {incident.updates.length} atualizações
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                )}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Descrição
                        </p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {incident.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Localização
                        </p>
                        <p className="text-xs text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {incident.location}
                        </p>
                      </div>
                      {incident.deadline && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Prazo
                          </p>
                          <p className="text-xs text-danger-600 font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(incident.deadline).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Tags
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          {incident.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1"
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
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Histórico de Atualizações
                      </p>
                      {incident.updates.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">
                          Nenhuma atualização registrada
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                          {incident.updates
                            .sort(
                              (a, b) =>
                                new Date(b.timestamp).getTime() -
                                new Date(a.timestamp).getTime()
                            )
                            .map((update) => (
                              <div
                                key={update.id}
                                className={cn(
                                  "p-2 rounded-lg border text-xs",
                                  update.type === "escalation"
                                    ? "bg-danger-50 border-danger-200"
                                    : update.type === "resource_update"
                                    ? "bg-warning-50 border-warning-200"
                                    : update.type === "status_change"
                                    ? "bg-primary-50 border-primary-200"
                                    : "bg-gray-50 border-gray-200"
                                )}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900">
                                    {update.author}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {timeAgo(update.timestamp)}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mb-1">
                                  {update.agency}
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                  {update.message}
                                </p>
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
