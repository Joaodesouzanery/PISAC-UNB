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
  Handshake,
  Share2,
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

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-primary)",
  borderRadius: 8,
  fontSize: 11,
  color: "var(--text-primary)",
};

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

  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };
  const avgReadiness = Math.round(interMunicipalMetrics.reduce((s, m) => s + m.overallReadiness, 0) / interMunicipalMetrics.length);
  const sharedResources = municipalities.reduce((s, m) => s + Math.round(m.resourcesAvailable * 0.3), 0);

  return (
    <div className="space-y-6">
      {/* Regional Coordination Banner */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)" }}>
        <div className="flex items-center gap-3 mb-2">
          <Handshake className="h-5 w-5" style={{ color: "var(--accent)" }} />
          <h3 className="text-sm font-bold" style={{ color: "var(--accent)" }}>
            Coordenação Regional Integrada — Associação Intermunicipal
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-secondary)" }}>
            <Share2 className="h-3 w-3" style={{ color: "var(--accent)" }} />
            <span><strong>{municipalities.length}</strong> municípios integrados</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-secondary)" }}>
            <Shield className="h-3 w-3" style={{ color: "var(--accent)" }} />
            <span>Protocolo de cooperação ativo</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-secondary)" }}>
            <Users className="h-3 w-3" style={{ color: "var(--accent)" }} />
            <span>Pop. total: <strong>{formatNumber(totalPopulation)}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-secondary)" }}>
            <Activity className="h-3 w-3" style={{ color: "var(--accent)" }} />
            <span>Pool compartilhado: <strong>{sharedResources}%</strong> recursos</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Municípios Monitorados", value: municipalities.length, sub: `Pop. total: ${formatNumber(totalPopulation)}`, icon: Globe2, color: "var(--accent)" },
          { label: "Em Crise", value: municipalitiesInCrisis, sub: `+ ${municipalitiesInAlert} em alerta`, icon: AlertTriangle, color: "#ef4444" },
          { label: "Incidentes Ativos", value: totalActiveIncidents, sub: `Em ${crises.filter((c) => c.status === "active").length} crises`, icon: Activity, color: "#f59e0b" },
          { label: "Prontidão Média", value: `${avgReadiness}%`, sub: "da rede regional", icon: Shield, color: "#22c55e" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl" style={{ ...cardStyle, borderLeft: `4px solid ${color}` }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Icon className="h-3 w-3" /> {label}
            </p>
            <p className="text-xl font-bold" style={{ color: typeof value === "string" ? color : "var(--text-primary)" }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Municipality Status Grid */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Globe2 className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Situação Intermunicipal Consolidada
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {municipalities.map((m) => {
            const metrics = interMunicipalMetrics.find((im) => im.municipalityId === m.id);
            const statusColor = m.status === "crisis" ? "#ef4444" : m.status === "alert" ? "#f59e0b" : m.status === "recovery" ? "#3b82f6" : "#22c55e";

            return (
              <div
                key={m.id}
                className="rounded-lg p-3 transition-all"
                style={{
                  border: `2px solid ${statusColor}40`,
                  backgroundColor: `${statusColor}08`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                    style={{ backgroundColor: statusColor, color: "#fff" }}
                  >
                    {m.status === "crisis" ? "Crise" : m.status === "alert" ? "Alerta" : m.status === "recovery" ? "Recuperação" : "Normal"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: "var(--text-muted)" }}>População</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatNumber(m.population)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: "var(--text-muted)" }}>Incidentes</span>
                    <span className="font-bold" style={{ color: m.activeIncidents > 5 ? "#ef4444" : m.activeIncidents > 0 ? "#f59e0b" : "#22c55e" }}>
                      {m.activeIncidents}
                    </span>
                  </div>
                  <ProgressBar
                    value={m.resourcesAvailable}
                    label="Recursos"
                    size="sm"
                    showPercentage={true}
                    color={m.resourcesAvailable < 40 ? "danger" : m.resourcesAvailable < 60 ? "warning" : "success"}
                  />
                  {metrics && (
                    <>
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: "var(--text-muted)" }}>Prontidão</span>
                        <span className="font-bold" style={{ color: metrics.overallReadiness > 75 ? "#22c55e" : metrics.overallReadiness > 50 ? "#f59e0b" : "#ef4444" }}>
                          {metrics.overallReadiness}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: "var(--text-muted)" }}>Tempo Resposta</span>
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{metrics.responseTimeMinutes} min</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Comparison */}
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Comparativo de Prontidão</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={readinessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} angle={-15} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="prontidao" fill="#3b82f6" name="Prontidão Geral (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comunicacao" fill="#22c55e" name="Comunicação (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recursos" fill="#f59e0b" name="Recursos Livres (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Ranking */}
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Tempo de Resposta e Carga de Incidentes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="tempo" fill="#3b82f6" name="Tempo Resposta (min)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="incidentes" fill="#ef4444" name="Incidentes Ativos" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Crises Summary */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Crises Ativas na Região</h3>
        <div className="space-y-3">
          {crises.map((crisis) => {
            const crisisIncidents = incidents.filter((i) => i.crisisId === crisis.id);
            const resolvedCount = crisisIncidents.filter((i) => i.status === "resolved").length;
            const escalatedCount = crisisIncidents.filter((i) => i.status === "escalated").length;
            const crisisColor = crisis.status === "active" ? "#ef4444" : crisis.status === "monitoring" ? "#f59e0b" : "#22c55e";

            return (
              <div
                key={crisis.id}
                className="p-4 rounded-lg"
                style={{
                  border: `2px solid ${crisisColor}30`,
                  backgroundColor: `${crisisColor}05`,
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{crisis.title}</h4>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{crisis.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span
                      className="text-[10px] px-2 py-1 rounded-full font-bold"
                      style={{ backgroundColor: crisisColor, color: "#fff" }}
                    >
                      {crisis.status === "active" ? "ATIVA" : crisis.status === "monitoring" ? "MONITORANDO" : "RESOLVIDA"}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      Nível {crisis.level.replace("level_", "")}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  {[
                    { label: "Agência Líder", value: crisis.leadAgency },
                    { label: "Municípios Afetados", value: crisis.affectedMunicipalities.length },
                    { label: "Incidentes", value: crisisIncidents.length },
                    { label: "Escalados", value: escalatedCount, danger: escalatedCount > 0 },
                    { label: "Resolvidos", value: `${resolvedCount}/${crisisIncidents.length}`, success: true },
                  ].map(({ label, value, danger, success }) => (
                    <div key={label} className="text-xs">
                      <p style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="font-bold" style={{ color: danger ? "#ef4444" : success ? "#22c55e" : "var(--text-primary)" }}>{value}</p>
                    </div>
                  ))}
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
