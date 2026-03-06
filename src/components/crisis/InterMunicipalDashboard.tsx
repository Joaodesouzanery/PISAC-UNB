"use client";

import { municipalities, interMunicipalMetrics, crises, incidents } from "@/data/crisis-data";
import { cn, formatNumber } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  Globe2,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function InterMunicipalDashboard() {
  const totalPopulation = municipalities.reduce((s, m) => s + m.population, 0);
  const municipalitiesInCrisis = municipalities.filter((m) => m.status === "crisis").length;
  const municipalitiesInAlert = municipalities.filter((m) => m.status === "alert").length;
  const totalActiveIncidents = municipalities.reduce((s, m) => s + m.activeIncidents, 0);

  const readinessData = interMunicipalMetrics.map((m) => ({
    name: m.municipalityName.substring(0, 12),
    prontidao: m.overallReadiness,
    comunicacao: m.communicationScore,
    recursos: 100 - m.resourceUtilization,
  }));

  const responseTimeData = interMunicipalMetrics
    .sort((a, b) => a.responseTimeMinutes - b.responseTimeMinutes)
    .map((m) => ({
      name: m.municipalityName.substring(0, 12),
      tempo: m.responseTimeMinutes,
      incidentes: m.activeIncidents,
    }));

  const radarData = interMunicipalMetrics.slice(0, 4).map((m) => ({
    subject: m.municipalityName.substring(0, 10),
    prontidao: m.overallReadiness,
    comunicacao: m.communicationScore,
    resposta: Math.max(0, 100 - m.responseTimeMinutes * 3),
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Globe2 className="h-3 w-3" /> Municípios Monitorados
          </p>
          <p className="text-xl font-bold text-gray-900">
            {municipalities.length}
          </p>
          <p className="text-[10px] text-gray-400">
            Pop. total: {formatNumber(totalPopulation)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-danger-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Em Crise
          </p>
          <p className="text-xl font-bold text-danger-600">
            {municipalitiesInCrisis}
          </p>
          <p className="text-[10px] text-gray-400">
            + {municipalitiesInAlert} em alerta
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Activity className="h-3 w-3" /> Incidentes Ativos
          </p>
          <p className="text-xl font-bold text-warning-600">
            {totalActiveIncidents}
          </p>
          <p className="text-[10px] text-gray-400">
            Em {crises.filter((c) => c.status === "active").length} crises
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Prontidão Média
          </p>
          <p className="text-xl font-bold text-success-600">
            {Math.round(
              interMunicipalMetrics.reduce((s, m) => s + m.overallReadiness, 0) /
                interMunicipalMetrics.length
            )}
            %
          </p>
          <p className="text-[10px] text-gray-400">da rede regional</p>
        </div>
      </div>

      {/* Municipality Status Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary-600" />
          Situação Intermunicipal Consolidada
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {municipalities.map((m) => {
            const metrics = interMunicipalMetrics.find(
              (im) => im.municipalityId === m.id
            );

            return (
              <div
                key={m.id}
                className={cn(
                  "rounded-lg border-2 p-3 transition-all",
                  m.status === "crisis"
                    ? "border-danger-400 bg-danger-50/50"
                    : m.status === "alert"
                    ? "border-warning-400 bg-warning-50/50"
                    : m.status === "recovery"
                    ? "border-blue-300 bg-blue-50/50"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">
                    {m.name}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                      m.status === "crisis"
                        ? "bg-danger-500 text-white"
                        : m.status === "alert"
                        ? "bg-warning-500 text-white"
                        : m.status === "recovery"
                        ? "bg-blue-500 text-white"
                        : "bg-success-500 text-white"
                    )}
                  >
                    {m.status === "crisis"
                      ? "Crise"
                      : m.status === "alert"
                      ? "Alerta"
                      : m.status === "recovery"
                      ? "Recuperação"
                      : "Normal"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">População</span>
                    <span className="font-medium">{formatNumber(m.population)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Incidentes</span>
                    <span
                      className={cn(
                        "font-bold",
                        m.activeIncidents > 5
                          ? "text-danger-600"
                          : m.activeIncidents > 0
                          ? "text-warning-600"
                          : "text-success-600"
                      )}
                    >
                      {m.activeIncidents}
                    </span>
                  </div>
                  <ProgressBar
                    value={m.resourcesAvailable}
                    label="Recursos"
                    size="sm"
                    showPercentage={true}
                    color={
                      m.resourcesAvailable < 40
                        ? "danger"
                        : m.resourcesAvailable < 60
                        ? "warning"
                        : "success"
                    }
                  />
                  {metrics && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Prontidão</span>
                      <span
                        className={cn(
                          "font-bold",
                          metrics.overallReadiness > 75
                            ? "text-success-600"
                            : metrics.overallReadiness > 50
                            ? "text-warning-600"
                            : "text-danger-600"
                        )}
                      >
                        {metrics.overallReadiness}%
                      </span>
                    </div>
                  )}
                  {metrics && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Tempo Resposta</span>
                      <span className="font-medium">
                        {metrics.responseTimeMinutes} min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Comparativo de Prontidão
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={readinessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar
                dataKey="prontidao"
                fill="#3b82f6"
                name="Prontidão Geral (%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="comunicacao"
                fill="#22c55e"
                name="Comunicação (%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="recursos"
                fill="#f59e0b"
                name="Recursos Livres (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Ranking */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Tempo de Resposta e Carga de Incidentes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10 }}
                width={90}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar
                dataKey="tempo"
                fill="#3b82f6"
                name="Tempo Resposta (min)"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="incidentes"
                fill="#ef4444"
                name="Incidentes Ativos"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Crises Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Crises Ativas na Região
        </h3>
        <div className="space-y-3">
          {crises.map((crisis) => {
            const crisisIncidents = incidents.filter(
              (i) => i.crisisId === crisis.id
            );
            const resolvedCount = crisisIncidents.filter(
              (i) => i.status === "resolved"
            ).length;
            const escalatedCount = crisisIncidents.filter(
              (i) => i.status === "escalated"
            ).length;

            return (
              <div
                key={crisis.id}
                className={cn(
                  "p-4 rounded-lg border-2",
                  crisis.status === "active"
                    ? "border-danger-300 bg-danger-50/30"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {crisis.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {crisis.description}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-full font-bold",
                        crisis.status === "active"
                          ? "bg-danger-500 text-white"
                          : crisis.status === "monitoring"
                          ? "bg-warning-200 text-warning-800"
                          : "bg-success-200 text-success-800"
                      )}
                    >
                      {crisis.status === "active"
                        ? "ATIVA"
                        : crisis.status === "monitoring"
                        ? "MONITORANDO"
                        : "RESOLVIDA"}
                    </span>
                    <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      Nível{" "}
                      {crisis.level.replace("level_", "")}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  <div className="text-xs">
                    <p className="text-gray-500">Agência Líder</p>
                    <p className="font-medium text-gray-900">{crisis.leadAgency}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-500">Municípios Afetados</p>
                    <p className="font-bold text-gray-900">
                      {crisis.affectedMunicipalities.length}
                    </p>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-500">Incidentes</p>
                    <p className="font-bold text-gray-900">
                      {crisisIncidents.length}
                    </p>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-500">Escalados</p>
                    <p className={cn("font-bold", escalatedCount > 0 ? "text-danger-600" : "text-gray-900")}>
                      {escalatedCount}
                    </p>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-500">Resolvidos</p>
                    <p className="font-bold text-success-600">
                      {resolvedCount}/{crisisIncidents.length}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={resolvedCount}
                    max={crisisIncidents.length}
                    label="Progresso de resolução"
                    size="sm"
                    color="success"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
