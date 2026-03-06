"use client";

import { useState, useMemo, useCallback } from "react";
import {
  vulnerabilityAssessments,
  historicalEvents,
  sensors,
} from "@/data/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  rootCauseAnalyses,
  sensorCorrelationMatrix,
  availableWidgets,
  generateTrendData,
  type RootCauseAnalysis,
  type DashboardWidget,
} from "@/lib/analysis-engine";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MapPin,
  History,
  Brain,
  Target,
  Search,
  GitBranch,
  LayoutDashboard,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  Shield,
  Zap,
  BarChart3,
  Activity,
  Eye,
  GripVertical,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area,
  Cell,
} from "recharts";

type ViewType = "rootcause" | "vulnerability" | "historical" | "patterns" | "dashboard";

export default function AnalysisModule() {
  const [selectedArea, setSelectedArea] = useState(vulnerabilityAssessments[0]);
  const [view, setView] = useState<ViewType>("rootcause");
  const [selectedRCA, setSelectedRCA] = useState<RootCauseAnalysis>(rootCauseAnalyses[0]);
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set(["f1"]));
  const [activeWidgets, setActiveWidgets] = useState<string[]>(["w1", "w2", "w3", "w4", "w5", "w6"]);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [trendVariable, setTrendVariable] = useState("precipitation");

  const trendData = useMemo(() => generateTrendData(trendVariable), [trendVariable]);

  const trendIcon = {
    improving: <TrendingDown className="h-4 w-4" style={{ color: "#22c55e" }} />,
    stable: <Minus className="h-4 w-4" style={{ color: "var(--text-muted)" }} />,
    worsening: <TrendingUp className="h-4 w-4" style={{ color: "#ef4444" }} />,
  };

  const toggleFactor = useCallback((id: string) => {
    setExpandedFactors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleWidget = useCallback((widgetId: string) => {
    setActiveWidgets((prev) =>
      prev.includes(widgetId) ? prev.filter((id) => id !== widgetId) : [...prev, widgetId]
    );
  }, []);

  const radarData = [
    { subject: "Ambiental", value: selectedArea.factors.environmental },
    { subject: "Estrutural", value: selectedArea.factors.structural },
    { subject: "Social", value: selectedArea.factors.social },
    { subject: "Econômico", value: selectedArea.factors.economic },
  ];

  const historicalCostData = historicalEvents.map((e) => ({
    name: e.date.substring(0, 7),
    custo: e.cost / 1000000,
    populacao: e.affectedPopulation / 1000,
    tipo: e.type,
  }));

  const correlationData = vulnerabilityAssessments.map((va) => ({
    name: va.areaName,
    vulnerabilidade: va.overallScore,
    risco:
      va.factors.environmental * 0.3 +
      va.factors.structural * 0.3 +
      va.factors.social * 0.2 +
      va.factors.economic * 0.2,
    z: 200,
  }));

  const urgencyColors: Record<string, string> = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#f59e0b",
    low: "#3b82f6",
  };

  const categoryIcons: Record<string, string> = {
    climate: "🌧️",
    infrastructure: "🏗️",
    social: "👥",
    environmental: "🌿",
    operational: "⚙️",
  };

  const tabs = [
    { key: "rootcause" as const, label: "Causa Raiz", icon: GitBranch },
    { key: "vulnerability" as const, label: "Vulnerabilidade", icon: Target },
    { key: "historical" as const, label: "Histórico", icon: History },
    { key: "patterns" as const, label: "Padrões", icon: Brain },
    { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: view === key ? "var(--accent-muted)" : "var(--bg-card)",
              color: view === key ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${view === key ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ========== ROOT CAUSE ANALYSIS ========== */}
      {view === "rootcause" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* RCA List */}
          <div
            className="lg:col-span-4 rounded-xl p-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Análises de Causa Raiz
            </p>
            <div className="space-y-2">
              {rootCauseAnalyses.map((rca) => (
                <button
                  key={rca.id}
                  onClick={() => setSelectedRCA(rca)}
                  className="w-full text-left p-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: selectedRCA.id === rca.id ? "var(--accent-muted)" : "var(--bg-elevated)",
                    border: `1px solid ${selectedRCA.id === rca.id ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {rca.incidentType}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${urgencyColors[rca.urgency]}20`,
                        color: urgencyColors[rca.urgency],
                      }}
                    >
                      {rca.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {rca.region}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-base)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${rca.correlationStrength * 100}%`,
                          backgroundColor: urgencyColors[rca.urgency],
                        }}
                      />
                    </div>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      r={rca.correlationStrength.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RCA Detail */}
          <div className="lg:col-span-8 space-y-4">
            {/* Causal Tree */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Árvore de Causalidade
                  </p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
                    {selectedRCA.incidentType} — {selectedRCA.region}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Período: {selectedRCA.timeWindow}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Correlação: <span style={{ color: "var(--accent)" }}>{(selectedRCA.correlationStrength * 100).toFixed(0)}%</span>
                  </p>
                </div>
              </div>

              {/* Primary Cause */}
              <div
                className="p-3 rounded-lg mb-3"
                style={{
                  backgroundColor: "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                <button
                  onClick={() => toggleFactor(selectedRCA.primaryCause.id)}
                  className="w-full flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                        CAUSA PRINCIPAL: {selectedRCA.primaryCause.name}
                      </span>
                      <span className="text-[10px]">{categoryIcons[selectedRCA.primaryCause.category]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        Peso: {(selectedRCA.primaryCause.weight * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        Confiança: {selectedRCA.primaryCause.confidence}%
                      </span>
                    </div>
                  </div>
                  {expandedFactors.has(selectedRCA.primaryCause.id) ? (
                    <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  ) : (
                    <ChevronRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  )}
                </button>

                {expandedFactors.has(selectedRCA.primaryCause.id) && (
                  <div className="mt-3 space-y-2">
                    <div className="pl-6 space-y-1">
                      {selectedRCA.primaryCause.evidence.map((e, i) => (
                        <p key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--accent)" }}>•</span> {e}
                        </p>
                      ))}
                    </div>
                    {selectedRCA.primaryCause.subFactors && (
                      <div className="pl-6 mt-2 space-y-2">
                        {selectedRCA.primaryCause.subFactors.map((sf) => (
                          <div
                            key={sf.id}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
                                {categoryIcons[sf.category]} {sf.name}
                              </span>
                              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                {(sf.weight * 100).toFixed(0)}% | {sf.confidence}%
                              </span>
                            </div>
                            {sf.evidence.map((e, i) => (
                              <p key={i} className="text-[10px] mt-1 pl-3" style={{ color: "var(--text-muted)" }}>
                                ↳ {e}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contributing Factors */}
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Fatores Contribuintes
              </p>
              <div className="space-y-2">
                {selectedRCA.contributingFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                  >
                    <button
                      onClick={() => toggleFactor(factor.id)}
                      className="w-full flex items-center gap-2"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-base)" }}
                      >
                        {categoryIcons[factor.category]}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {factor.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: "var(--bg-base)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${factor.weight * 100}%`,
                                backgroundColor: "var(--accent)",
                                opacity: 0.7,
                              }}
                            />
                          </div>
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {(factor.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-base)", color: "var(--text-muted)" }}
                      >
                        {factor.confidence}%
                      </span>
                      {expandedFactors.has(factor.id) ? (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                      )}
                    </button>
                    {expandedFactors.has(factor.id) && (
                      <div className="mt-2 pl-10 space-y-1">
                        {factor.evidence.map((e, i) => (
                          <p key={i} className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            • {e}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div
                className="mt-4 p-3 rounded-lg"
                style={{
                  backgroundColor: `${urgencyColors[selectedRCA.urgency]}10`,
                  border: `1px solid ${urgencyColors[selectedRCA.urgency]}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5" style={{ color: urgencyColors[selectedRCA.urgency] }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: urgencyColors[selectedRCA.urgency] }}>
                    Recomendação
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                  {selectedRCA.recommendation}
                </p>
              </div>
            </div>

            {/* Factor Weight Chart */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                Distribuição de Peso dos Fatores
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: selectedRCA.primaryCause.name.substring(0, 20), peso: selectedRCA.primaryCause.weight * 100, tipo: "Primário" },
                    ...selectedRCA.contributingFactors.map((f) => ({
                      name: f.name.substring(0, 20),
                      peso: f.weight * 100,
                      tipo: "Contribuinte",
                    })),
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={150} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "var(--text-primary)" }}
                    itemStyle={{ color: "var(--text-secondary)" }}
                  />
                  <Bar dataKey="peso" name="Peso (%)" radius={[0, 4, 4, 0]}>
                    {[selectedRCA.primaryCause, ...selectedRCA.contributingFactors].map((f, i) => (
                      <Cell key={i} fill={i === 0 ? "#f97316" : "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========== VULNERABILITY ========== */}
      {view === "vulnerability" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area List */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <MapPin className="h-3.5 w-3.5" />
              Regiões Monitoradas
            </p>
            <div className="space-y-2">
              {vulnerabilityAssessments
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((va) => (
                  <button
                    key={va.areaId}
                    onClick={() => setSelectedArea(va)}
                    className="w-full text-left p-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: selectedArea.areaId === va.areaId ? "var(--accent-muted)" : "var(--bg-elevated)",
                      border: `1px solid ${selectedArea.areaId === va.areaId ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                        {va.areaName}
                      </span>
                      <div className="flex items-center gap-1">
                        {trendIcon[va.trend]}
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: va.overallScore > 70 ? "#ef4444" : va.overallScore > 50 ? "#f59e0b" : "#22c55e",
                          }}
                        >
                          {va.overallScore}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-base)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${va.overallScore}%`,
                          backgroundColor: va.overallScore > 70 ? "#ef4444" : va.overallScore > 50 ? "#f59e0b" : "#22c55e",
                        }}
                      />
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Radar */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Perfil de Vulnerabilidade — {selectedArea.areaName}
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-subtle)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                <Radar name="Vulnerabilidade" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Tendência:</span>
              {trendIcon[selectedArea.trend]}
              <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
                {selectedArea.trend === "improving" ? "Melhorando" : selectedArea.trend === "stable" ? "Estável" : "Piorando"}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
              Recomendações — {selectedArea.areaName}
            </p>
            <div className="space-y-2">
              {selectedArea.recommendations.map((rec, i) => {
                const isUrgent = rec.toLowerCase().includes("urgente") || rec.toLowerCase().includes("crítico");
                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg text-[11px]"
                    style={{
                      backgroundColor: isUrgent ? "rgba(239,68,68,0.08)" : "var(--bg-elevated)",
                      border: `1px solid ${isUrgent ? "rgba(239,68,68,0.2)" : "var(--border-subtle)"}`,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span className="font-medium mr-1" style={{ color: isUrgent ? "#ef4444" : "var(--accent)" }}>
                      {i + 1}.
                    </span>
                    {rec}
                  </div>
                );
              })}
            </div>
            <div
              className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <p className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>
                Score: {selectedArea.overallScore}/100
              </p>
              <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span>Ambiental: {selectedArea.factors.environmental}</span>
                <span>Estrutural: {selectedArea.factors.structural}</span>
                <span>Social: {selectedArea.factors.social}</span>
                <span>Econômico: {selectedArea.factors.economic}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== HISTORICAL ========== */}
      {view === "historical" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Custos de Eventos Históricos (R$ milhões)
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "var(--text-primary)" }}
                  formatter={(value: number) => [`R$ ${value}M`, ""]}
                />
                <Bar dataKey="custo" fill="#f97316" radius={[4, 4, 0, 0]} name="Custo (R$ M)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Linha do Tempo de Eventos
            </p>
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto scrollbar-thin">
              {historicalEvents
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.severity === "critical" ? "#ef4444" : "#f59e0b" }}
                      />
                      <div className="w-px h-full mt-1" style={{ backgroundColor: "var(--border-subtle)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                          {event.date}
                        </span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: event.severity === "critical" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                            color: event.severity === "critical" ? "#ef4444" : "#f59e0b",
                          }}
                        >
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] mb-2" style={{ color: "var(--text-secondary)" }}>
                        {event.description}
                      </p>
                      <div className="flex gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <span>Custo: {formatCurrency(event.cost)}</span>
                        <span>Pop. afetada: {formatNumber(event.affectedPopulation)}</span>
                      </div>
                      {event.lessonsLearned.length > 0 && (
                        <div
                          className="mt-2 p-2 rounded"
                          style={{ backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
                        >
                          <p className="text-[10px] font-medium mb-1" style={{ color: "#3b82f6" }}>
                            Lições aprendidas:
                          </p>
                          {event.lessonsLearned.map((lesson, i) => (
                            <p key={i} className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                              • {lesson}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== PATTERNS & CORRELATIONS ========== */}
      {view === "patterns" && (
        <div className="space-y-4">
          {/* Correlation Matrix Heatmap */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Matriz de Correlação — Variáveis Sensoriais
            </p>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 500 }}>
                <thead>
                  <tr>
                    <th className="p-1.5 text-[10px] text-left" style={{ color: "var(--text-muted)" }} />
                    {sensorCorrelationMatrix.variables.map((v) => (
                      <th key={v} className="p-1.5 text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
                        {v}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensorCorrelationMatrix.variables.map((row, ri) => (
                    <tr key={row}>
                      <td className="p-1.5 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                        {row}
                      </td>
                      {sensorCorrelationMatrix.values[ri].map((val, ci) => {
                        const abs = Math.abs(val);
                        const color = val > 0
                          ? `rgba(249,115,22,${abs * 0.7})`
                          : `rgba(59,130,246,${abs * 0.7})`;
                        return (
                          <td
                            key={ci}
                            className="p-1.5 text-center text-[10px] font-mono font-medium"
                            style={{
                              backgroundColor: ri === ci ? "var(--bg-elevated)" : color,
                              color: abs > 0.5 ? "white" : "var(--text-muted)",
                              borderRadius: 4,
                            }}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(59,130,246,0.6)" }} />
                Correlação negativa
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--bg-elevated)" }} />
                Neutro
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(249,115,22,0.6)" }} />
                Correlação positiva
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Trend Analysis */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Análise de Tendência com Previsão
                </p>
                <select
                  value={trendVariable}
                  onChange={(e) => setTrendVariable(e.target.value)}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <option value="precipitation">Precipitação</option>
                  <option value="river_level">Nível do Rio</option>
                  <option value="temperature">Temperatura</option>
                  <option value="risk_index">Índice de Risco</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={[
                    ...trendData.data.map((d) => ({ ...d, lower: undefined, upper: undefined })),
                    ...trendData.forecast.map((d) => ({
                      date: d.date,
                      value: undefined,
                      predicted: d.value,
                      lower: d.lower,
                      upper: d.upper,
                    })),
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="#f97316" fillOpacity={0.1} name="Limite Superior" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" name="Limite Inferior" />
                  <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} name="Observado" />
                  <Line type="monotone" dataKey="predicted" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} name="Previsão" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span>Tendência: <strong style={{ color: "var(--text-primary)" }}>{trendData.trend}</strong></span>
                <span>R²: <strong style={{ color: "var(--text-primary)" }}>{trendData.r2.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Scatter */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                Vulnerabilidade x Risco Composto
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis type="number" dataKey="vulnerabilidade" name="Vulnerabilidade" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis type="number" dataKey="risco" name="Risco" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <ZAxis type="number" dataKey="z" range={[100, 400]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "var(--text-primary)" }}
                    formatter={(value: number) => [value.toFixed(1), ""]}
                    labelFormatter={(label) => {
                      const item = correlationData.find((d) => d.vulnerabilidade === label);
                      return item?.name || "";
                    }}
                  />
                  <Scatter data={correlationData} fill="#f97316" />
                </ScatterChart>
              </ResponsiveContainer>

              <div
                className="mt-3 p-3 rounded-lg"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
              >
                <p className="text-[10px] font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                  Insights da IA:
                </p>
                <ul className="space-y-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <li>• Ceilândia: maior concentração de fatores de risco convergentes</li>
                  <li>• Correlação forte (0.87) entre vulnerabilidade social e impacto financeiro</li>
                  <li>• Padrão sazonal detectado: 73% dos eventos entre Nov-Mar</li>
                  <li>• Previsão: 40% de probabilidade de evento significativo em 30 dias</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== CUSTOMIZABLE DASHBOARD ========== */}
      {view === "dashboard" && (
        <div className="space-y-4">
          {/* Dashboard Controls */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Dashboard Personalizado ({activeWidgets.length} widgets)
            </p>
            <button
              onClick={() => setShowWidgetPicker(!showWidgetPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: "var(--accent-muted)",
                color: "var(--accent)",
                border: "1px solid rgba(249,115,22,0.3)",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Widget
            </button>
          </div>

          {/* Widget Picker */}
          {showWidgetPicker && (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                  Selecionar Widgets
                </p>
                <button onClick={() => setShowWidgetPicker(false)}>
                  <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableWidgets.map((widget) => {
                  const isActive = activeWidgets.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => toggleWidget(widget.id)}
                      className="p-2.5 rounded-lg text-left transition-colors"
                      style={{
                        backgroundColor: isActive ? "var(--accent-muted)" : "var(--bg-elevated)",
                        border: `1px solid ${isActive ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: "var(--bg-base)", color: "var(--text-muted)" }}
                        >
                          {widget.category}
                        </span>
                        {isActive && <Eye className="h-3 w-3" style={{ color: "var(--accent)" }} />}
                      </div>
                      <p className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {widget.title}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {widget.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWidgets.map((widgetId) => {
              const widget = availableWidgets.find((w) => w.id === widgetId);
              if (!widget) return null;

              const colSpan = widget.size === "lg" ? "md:col-span-2" : "";

              return (
                <div
                  key={widget.id}
                  className={`rounded-xl p-4 ${colSpan}`}
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3.5 w-3.5" style={{ color: "var(--border-subtle)" }} />
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                        {widget.title}
                      </p>
                    </div>
                    <button onClick={() => toggleWidget(widget.id)}>
                      <X className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                  <DashboardWidgetRenderer widget={widget} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Widget renderer for customizable dashboard
function DashboardWidgetRenderer({ widget }: { widget: DashboardWidget }) {
  switch (widget.dataKey) {
    case "overall_risk": {
      const avgScore = Math.round(
        vulnerabilityAssessments.reduce((s, v) => s + v.overallScore, 0) / vulnerabilityAssessments.length
      );
      return (
        <div className="flex flex-col items-center py-4">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={avgScore > 60 ? "#ef4444" : avgScore > 40 ? "#f59e0b" : "#22c55e"}
                strokeWidth="8"
                strokeDasharray={`${avgScore * 2.51} 251`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{avgScore}</span>
            </div>
          </div>
          <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>Score médio de risco</p>
        </div>
      );
    }

    case "critical_sensors": {
      const critical = sensors.filter((s) => s.status === "critical").length;
      const warning = sensors.filter((s) => s.status === "warning").length;
      return (
        <div className="flex flex-col items-center py-4">
          <span className="text-3xl font-bold" style={{ color: "#ef4444" }}>{critical}</span>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Sensores críticos</p>
          <span className="text-lg font-bold mt-2" style={{ color: "#f59e0b" }}>{warning}</span>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Em alerta</p>
        </div>
      );
    }

    case "population_at_risk": {
      const total = vulnerabilityAssessments
        .filter((v) => v.overallScore > 50)
        .reduce((s) => s + 45000, 0);
      return (
        <div className="flex flex-col items-center py-4">
          <span className="text-3xl font-bold" style={{ color: "var(--accent)" }}>{formatNumber(total)}</span>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Pessoas em áreas de risco alto</p>
        </div>
      );
    }

    case "infra_condition": {
      const data = [
        { name: "Excelente", count: 1, fill: "#22c55e" },
        { name: "Bom", count: 3, fill: "#3b82f6" },
        { name: "Regular", count: 2, fill: "#f59e0b" },
        { name: "Ruim", count: 1, fill: "#f97316" },
        { name: "Crítico", count: 0, fill: "#ef4444" },
      ];
      return (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="count" name="Infraestruturas" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    case "precipitation_trend":
    case "river_levels":
    case "temp_trend": {
      const variable = widget.dataKey === "precipitation_trend" ? "precipitation" : widget.dataKey === "river_levels" ? "river_level" : "temperature";
      const trend = generateTrendData(variable);
      return (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trend.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    case "vulnerability_radar": {
      const data = vulnerabilityAssessments.slice(0, 3).flatMap((va) => [
        { subject: va.areaName, Ambiental: va.factors.environmental, Estrutural: va.factors.structural, Social: va.factors.social },
      ]);
      const radarData = [
        { subject: "Ambiental", value: 60 },
        { subject: "Estrutural", value: 55 },
        { subject: "Social", value: 70 },
        { subject: "Econômico", value: 65 },
      ];
      return (
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border-subtle)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    case "correlation_matrix": {
      const matrix = sensorCorrelationMatrix;
      return (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 400 }}>
            <thead>
              <tr>
                <th className="p-1 text-[9px]" style={{ color: "var(--text-muted)" }} />
                {matrix.variables.map((v) => (
                  <th key={v} className="p-1 text-[9px] text-center" style={{ color: "var(--text-muted)" }}>
                    {v.substring(0, 6)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.variables.map((row, ri) => (
                <tr key={row}>
                  <td className="p-1 text-[9px]" style={{ color: "var(--text-muted)" }}>{row.substring(0, 8)}</td>
                  {matrix.values[ri].map((val, ci) => (
                    <td
                      key={ci}
                      className="p-1 text-center text-[9px] font-mono"
                      style={{
                        backgroundColor: ri === ci ? "transparent" : val > 0 ? `rgba(249,115,22,${Math.abs(val) * 0.5})` : `rgba(59,130,246,${Math.abs(val) * 0.5})`,
                        color: Math.abs(val) > 0.5 ? "white" : "var(--text-muted)",
                      }}
                    >
                      {val.toFixed(1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "vuln_vs_impact": {
      const data = vulnerabilityAssessments.map((va) => ({
        x: va.overallScore,
        y: va.factors.environmental * 0.3 + va.factors.structural * 0.3 + va.factors.social * 0.2 + va.factors.economic * 0.2,
        z: 200,
      }));
      return (
        <ResponsiveContainer width="100%" height={180}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis type="number" dataKey="x" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
            <YAxis type="number" dataKey="y" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
            <Scatter data={data} fill="#f97316" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    case "cost_by_event": {
      const data = historicalEvents.map((e) => ({
        name: e.date.substring(5, 7) + "/" + e.date.substring(2, 4),
        custo: e.cost / 1000000,
      }));
      return (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="custo" fill="#f97316" radius={[4, 4, 0, 0]} name="R$ M" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    case "region_ranking":
      return (
        <div className="space-y-1.5">
          {vulnerabilityAssessments
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((va, i) => (
              <div
                key={va.areaId}
                className="flex items-center gap-2 p-2 rounded"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <span
                  className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center"
                  style={{
                    backgroundColor: i < 2 ? "rgba(239,68,68,0.15)" : "var(--bg-base)",
                    color: i < 2 ? "#ef4444" : "var(--text-muted)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-[11px] flex-1" style={{ color: "var(--text-primary)" }}>
                  {va.areaName}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{
                    color: va.overallScore > 70 ? "#ef4444" : va.overallScore > 50 ? "#f59e0b" : "#22c55e",
                  }}
                >
                  {va.overallScore}
                </span>
              </div>
            ))}
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-32" style={{ color: "var(--text-muted)" }}>
          <p className="text-xs">Widget em desenvolvimento</p>
        </div>
      );
  }
}
