"use client";

import { useState, useEffect, useCallback } from "react";
import MetricCard from "@/components/shared/MetricCard";
import StatusBadge from "@/components/shared/StatusBadge";
import ProgressBar from "@/components/shared/ProgressBar";
import { useTheme } from "@/components/ThemeProvider";
import {
  sensors as baseSensors,
  alerts as baseAlerts,
  infrastructures,
  riskScenarios,
  budgetCategories,
  vulnerabilityAssessments,
  rainfallHistory,
} from "@/data/mock-data";
import {
  getRealtimeSensors,
  detectAnomalies,
  generateDynamicAlerts,
  generateFloodPrediction,
  generateWeatherForecast,
  generateRiskTimeline,
  type FloodPrediction,
  type WeatherForecast,
  type RiskTimelinePoint,
} from "@/lib/realtime-service";
import { formatCurrency, formatNumber, timeAgo, getRiskColor } from "@/lib/utils";
import type { Sensor, Alert } from "@/types";
import {
  Activity,
  AlertTriangle,
  Building2,
  CloudRain,
  Shield,
  TrendingUp,
  Droplets,
  Zap,
  Radio,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Cloud,
  CloudLightning,
  Sun,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";

// Weather icon helper
function WeatherIcon({ condition }: { condition: WeatherForecast["condition"] }) {
  switch (condition) {
    case "heavy_storm": return <CloudLightning className="h-4 w-4 text-danger-500" />;
    case "storm": return <CloudLightning className="h-4 w-4 text-warning-500" />;
    case "rain": return <CloudRain className="h-4 w-4 text-primary-500" />;
    case "cloudy": return <Cloud className="h-4 w-4" style={{ color: "var(--text-muted)" }} />;
    default: return <Sun className="h-4 w-4 text-warning-400" />;
  }
}

export default function DashboardOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Chart colors based on theme
  const chartGrid = isDark ? "#1e1f2e" : "#e2e8f0";
  const chartText = isDark ? "#7c7c98" : "#64748b";
  const tooltipBg = isDark ? "#14151f" : "#ffffff";
  const tooltipBorder = isDark ? "#26273a" : "#e2e8f0";
  const tooltipText = isDark ? "#e6e6f0" : "#0f172a";

  // Real-time state
  const [liveSensors, setLiveSensors] = useState<Sensor[]>(baseSensors);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>(baseAlerts);
  const [floodPredictions, setFloodPredictions] = useState<FloodPrediction[]>([]);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [riskTimeline, setRiskTimeline] = useState<RiskTimelinePoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);

  // Initialize predictions
  useEffect(() => {
    setFloodPredictions(generateFloodPrediction());
    setWeatherForecast(generateWeatherForecast());
    setRiskTimeline(generateRiskTimeline());
  }, []);

  // Real-time sensor updates
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setLiveSensors((prev) => {
        const updated = getRealtimeSensors(prev);
        const anomalies = detectAnomalies(updated);
        if (anomalies.length > 0) {
          setLiveAlerts((prevAlerts) => {
            const newAlerts = generateDynamicAlerts(anomalies, prevAlerts);
            return [...newAlerts, ...prevAlerts].slice(0, 20);
          });
        }
        return updated;
      });
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Refresh predictions every 30s
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setFloodPredictions(generateFloodPrediction());
      setRiskTimeline(generateRiskTimeline());
    }, 30000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Computed metrics
  const activeSensors = liveSensors.filter((s) => s.status !== "offline").length;
  const criticalSensors = liveSensors.filter((s) => s.status === "critical").length;
  const activeAlerts = liveAlerts.filter((a) => a.isActive).length;
  const emergencyAlerts = liveAlerts.filter((a) => a.isActive && a.severity === "emergency").length;
  const criticalInfra = infrastructures.filter((i) => i.condition === "poor" || i.condition === "critical").length;
  const totalBudget = budgetCategories.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetCategories.reduce((s, b) => s + b.spent, 0);

  const maxFloodRisk = floodPredictions.length > 0
    ? Math.max(...floodPredictions.map((p) => p.probability))
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Live indicator + Emergency Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          onClick={() => setIsLive(!isLive)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{
            backgroundColor: isLive ? "rgba(239, 68, 68, 0.1)" : "var(--bg-elevated)",
            color: isLive ? "#ef4444" : "var(--text-muted)",
            border: `1px solid ${isLive ? "rgba(239, 68, 68, 0.3)" : "var(--border-primary)"}`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isLive ? "#ef4444" : "var(--text-muted)",
              boxShadow: isLive ? "0 0 0 0 rgba(239,68,68,0.4)" : "none",
              animation: isLive ? "live-pulse 2s infinite" : "none",
            }}
          />
          {isLive ? "AO VIVO" : "PAUSADO"}
        </button>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          <Clock className="inline h-3 w-3 mr-1" />
          Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
        </span>
        {emergencyAlerts > 0 && (
          <div className="flex-1 bg-gradient-danger text-white rounded-lg px-4 py-2 flex items-center gap-2 animate-pulse">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm">EMERGÊNCIA ATIVA</p>
              <p className="text-xs text-red-100 truncate">
                {liveAlerts.find((a) => a.severity === "emergency")?.title}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Sensores Ativos"
          value={`${activeSensors}/${liveSensors.length}`}
          subtitle={`${criticalSensors} em estado crítico`}
          icon={Activity}
          status={criticalSensors > 0 ? "warning" : "normal"}
          change={-5}
          changeLabel="vs. semana"
        />
        <MetricCard
          title="Alertas Ativos"
          value={activeAlerts}
          subtitle={`${emergencyAlerts} emergência(s)`}
          icon={AlertTriangle}
          status={emergencyAlerts > 0 ? "critical" : activeAlerts > 3 ? "warning" : "normal"}
          change={15}
          changeLabel="vs. semana"
        />
        <MetricCard
          title="Infra em Risco"
          value={criticalInfra}
          subtitle={`de ${infrastructures.length} monitoradas`}
          icon={Building2}
          status={criticalInfra > 2 ? "critical" : criticalInfra > 0 ? "warning" : "normal"}
        />
        <MetricCard
          title="Execução Orçamentária"
          value={`${Math.round((totalSpent / totalBudget) * 100)}%`}
          subtitle={formatCurrency(totalSpent)}
          icon={TrendingUp}
          status="normal"
        />
      </div>

      {/* Predictive Section: Flood Forecast + Risk Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Flood Prediction Card */}
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5" style={{ color: "var(--accent)" }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                Previsão de Inundação (24h)
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              color: isDark ? "#a78bfa" : "#7c3aed",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}>
              IA/ML
            </span>
          </div>
          <div className="space-y-3">
            {floodPredictions.map((prediction) => (
              <div key={prediction.region} className="p-3 rounded-lg" style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {prediction.region}
                  </span>
                  <div className="flex items-center gap-2">
                    {prediction.trend === "rising" ? (
                      <ArrowUpRight className="h-4 w-4 text-danger-500" />
                    ) : prediction.trend === "falling" ? (
                      <ArrowDownRight className="h-4 w-4 text-success-500" />
                    ) : (
                      <Minus className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                    )}
                    <span className={`text-sm font-bold ${
                      prediction.probability > 0.5 ? "text-danger-500" :
                      prediction.probability > 0.3 ? "text-warning-500" : "text-success-500"
                    }`}>
                      {(prediction.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <span>Pico: {prediction.nextPeak} ({prediction.estimatedLevel}m / {prediction.threshold}m)</span>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={prediction.probability * 100}
                    showPercentage={false}
                    size="sm"
                    color={prediction.probability > 0.5 ? "danger" : prediction.probability > 0.3 ? "warning" : "primary"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Timeline Chart */}
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: "var(--accent)" }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                Tendência de Risco (24h)
              </h3>
            </div>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" /> Inundação</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning-500" /> Deslizamento</span>
              <span className="flex items-center gap-1 hidden sm:flex"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} /> Geral</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={riskTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: chartText }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: chartText }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "8px",
                  color: tooltipText,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--accent)" }}
              />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label="" />
              <Line type="monotone" dataKey="flood" stroke="#3b82f6" dot={false} strokeWidth={2} name="Inundação" />
              <Line type="monotone" dataKey="landslide" stroke="#f59e0b" dot={false} strokeWidth={2} name="Deslizamento" />
              <Line type="monotone" dataKey="overall" stroke="#f97316" dot={false} strokeWidth={2.5} name="Geral" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather Forecast Strip */}
      {weatherForecast.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Previsão Meteorológica (INMET/CEMADEN)
            </h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {weatherForecast.filter((_, i) => i % 2 === 0).slice(0, 12).map((wf, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px]"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{wf.hour}</span>
                <WeatherIcon condition={wf.condition} />
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {wf.precipitation.toFixed(0)}mm
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {wf.temperature.toFixed(0)}°C
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Sensors + Rainfall Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Live Sensor Grid */}
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Sensores em Tempo Real
            </h3>
            <span className="text-[10px] ml-auto" style={{ color: isLive ? "#ef4444" : "var(--text-muted)" }}>
              {isLive ? "● LIVE" : "○ PAUSED"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {liveSensors.slice(0, 8).map((sensor) => (
              <div
                key={sensor.id}
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: `1px solid ${
                    sensor.status === "critical" ? "rgba(239, 68, 68, 0.3)" :
                    sensor.status === "warning" ? "rgba(245, 158, 11, 0.3)" :
                    "var(--border-subtle)"
                  }`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      sensor.status === "critical" ? "#ef4444" :
                      sensor.status === "warning" ? "#f59e0b" :
                      sensor.status === "offline" ? "#606080" : "#22c55e",
                    animation: sensor.status === "critical" ? "live-pulse 2s infinite" : "none",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {sensor.name.replace(" - ", " · ")}
                  </p>
                </div>
                <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{
                  color: sensor.status === "critical" ? "#ef4444" :
                         sensor.status === "warning" ? "#f59e0b" : "var(--text-primary)",
                }}>
                  {sensor.value} {sensor.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rainfall Chart */}
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CloudRain className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Precipitação Mensal (mm)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={rainfallHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartText }} />
              <YAxis tick={{ fontSize: 11, fill: chartText }} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "8px", color: tooltipText }}
                labelStyle={{ color: "#f97316" }}
              />
              <Area type="monotone" dataKey="value" stroke="#f97316" fill="rgba(249, 115, 22, 0.15)" name="2026" />
              <Area type="monotone" dataKey="avg" stroke={chartText} fill="transparent" strokeDasharray="5 5" name="Média histórica" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Alerts + Vulnerability + Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Alerts with dynamic data */}
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Alertas Recentes
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
              backgroundColor: activeAlerts > 3 ? "rgba(239, 68, 68, 0.1)" : "var(--bg-elevated)",
              color: activeAlerts > 3 ? "#ef4444" : "var(--text-muted)",
            }}>
              {activeAlerts} ativos
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {liveAlerts
              .filter((a) => a.isActive)
              .slice(0, 6)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <div
                    className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        alert.severity === "emergency" ? "#ef4444" :
                        alert.severity === "critical" ? "#f97316" :
                        alert.severity === "warning" ? "#f59e0b" : "#3b82f6",
                      animation: alert.severity === "emergency" ? "pulse-dot 2s infinite" : "none",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {alert.title}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {alert.location} • {timeAgo(alert.timestamp)}
                    </p>
                  </div>
                  <StatusBadge label={alert.severity} variant="severity" />
                </div>
              ))}
          </div>
        </div>

        {/* Vulnerability Rankings */}
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
            Vulnerabilidade por Região
          </h3>
          <div className="space-y-3">
            {vulnerabilityAssessments
              .sort((a, b) => b.overallScore - a.overallScore)
              .map((va) => (
                <div key={va.areaId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                      {va.areaName}
                    </span>
                    <span className={`text-xs font-bold ${getRiskColor(va.overallScore)}`}>
                      {va.overallScore}/100
                    </span>
                  </div>
                  <ProgressBar
                    value={va.overallScore}
                    showPercentage={false}
                    size="sm"
                    color={va.overallScore > 70 ? "danger" : va.overallScore > 50 ? "warning" : "primary"}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Budget Overview */}
        <div
          className="rounded-lg p-4 md:col-span-2 lg:col-span-1"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
            Orçamento por Categoria
          </h3>
          <div className="space-y-3">
            {budgetCategories.slice(0, 5).map((bc) => (
              <div key={bc.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {bc.name}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {formatCurrency(bc.spent)} / {formatCurrency(bc.allocated)}
                  </span>
                </div>
                <ProgressBar value={bc.spent} max={bc.allocated} showPercentage={false} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
