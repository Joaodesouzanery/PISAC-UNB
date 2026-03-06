"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { sensors, alerts } from "@/data/mock-data";
import { generateSensorTimeSeries } from "@/data/map-data";
import { cn, timeAgo, formatNumber } from "@/lib/utils";
import {
  Activity,
  Bell,
  Radio,
  Waves,
  CloudRain,
  Wind,
  Thermometer,
  Car,
  Building,
  Eye,
  Filter,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Trash2,
  Check,
  Mail,
  Smartphone,
  BellRing,
  Clock,
  Cpu,
  Server,
  Gauge,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  Brush,
  ComposedChart,
  Bar,
} from "recharts";
import type { Sensor, SensorType } from "@/types";

const sensorTypeIcons: Record<SensorType, typeof Radio> = {
  river_level: Waves,
  rain_gauge: CloudRain,
  air_quality: Wind,
  traffic: Car,
  structural: Building,
  temperature: Thermometer,
  humidity: Waves,
  seismic: Activity,
};

const sensorTypeLabels: Record<SensorType, string> = {
  river_level: "Nível de Rio",
  rain_gauge: "Pluviômetro",
  air_quality: "Qualidade do Ar",
  traffic: "Tráfego",
  structural: "Estrutural",
  temperature: "Temperatura",
  humidity: "Umidade",
  seismic: "Sísmico",
};

interface AlertRule {
  id: string;
  sensorType: SensorType | "all";
  condition: "above" | "below";
  threshold: number;
  channels: ("email" | "sms" | "push")[];
  label: string;
  enabled: boolean;
}

const defaultAlertRules: AlertRule[] = [
  { id: "ar1", sensorType: "river_level", condition: "above", threshold: 4.5, channels: ["email", "push"], label: "Nível crítico do rio", enabled: true },
  { id: "ar2", sensorType: "rain_gauge", condition: "above", threshold: 60, channels: ["email", "sms", "push"], label: "Precipitação intensa", enabled: true },
  { id: "ar3", sensorType: "structural", condition: "above", threshold: 0.3, channels: ["email", "sms"], label: "Deformação estrutural", enabled: true },
  { id: "ar4", sensorType: "traffic", condition: "above", threshold: 90, channels: ["push"], label: "Congestionamento severo", enabled: false },
];

type MonitorView = "live" | "timeseries" | "alerts_config" | "iot_status";
type TimeRange = "1h" | "6h" | "24h" | "48h" | "7d";

export default function MonitoringModule() {
  const [view, setView] = useState<MonitorView>("live");
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [filterType, setFilterType] = useState<SensorType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [alertRules, setAlertRules] = useState<AlertRule[]>(defaultAlertRules);
  const [showAddRule, setShowAddRule] = useState(false);

  // Simulated real-time sensor values
  const [liveSensors, setLiveSensors] = useState(sensors);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLiveSensors((prev) =>
        prev.map((s) => ({
          ...s,
          value: Math.max(0, s.value + (Math.random() - 0.5) * s.value * 0.05),
          lastUpdate: new Date().toISOString(),
        }))
      );
      setLastRefresh(new Date());
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const filteredSensors = useMemo(() => {
    return liveSensors.filter((s) => {
      if (filterType !== "all" && s.type !== filterType) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      return true;
    });
  }, [liveSensors, filterType, filterStatus]);

  const activeAlerts = alerts.filter((a) => a.isActive);
  const sensorTypes = Array.from(new Set(sensors.map((s) => s.type)));

  const sensorStats = useMemo(() => ({
    total: liveSensors.length,
    online: liveSensors.filter((s) => s.status === "online").length,
    warning: liveSensors.filter((s) => s.status === "warning").length,
    critical: liveSensors.filter((s) => s.status === "critical").length,
    offline: liveSensors.filter((s) => s.status === "offline").length,
  }), [liveSensors]);

  const toggleAlertRule = useCallback((id: string) => {
    setAlertRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const deleteAlertRule = useCallback((id: string) => {
    setAlertRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const timeRangeHours: Record<TimeRange, number> = { "1h": 1, "6h": 6, "24h": 24, "48h": 48, "7d": 168 };

  const tabs = [
    { key: "live" as const, label: "Monitoramento Live", icon: Activity },
    { key: "timeseries" as const, label: "Séries Temporais", icon: TrendingUp },
    { key: "alerts_config" as const, label: "Alertas", icon: BellRing },
    { key: "iot_status" as const, label: "IoT Status", icon: Server },
  ];

  return (
    <div className="space-y-4">
      {/* Active Alerts Banner */}
      {activeAlerts.filter((a) => a.severity === "emergency" || a.severity === "critical").length > 0 && (
        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4" style={{ color: "#ef4444" }} />
            <span className="text-xs font-bold" style={{ color: "#ef4444" }}>
              {activeAlerts.filter((a) => a.severity === "emergency" || a.severity === "critical").length} alertas críticos ativos
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {activeAlerts
              .filter((a) => a.severity === "emergency" || a.severity === "critical")
              .map((alert) => (
                <div key={alert.id} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: alert.severity === "emergency" ? "#ef4444" : "#f97316" }} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{alert.title}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{alert.location} • {timeAgo(alert.timestamp)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tabs + Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? "animate-pulse" : ""}`} style={{ backgroundColor: autoRefresh ? "#22c55e" : "#94a3b8" }} />
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="text-[10px] bg-transparent"
              style={{ color: "var(--text-muted)", outline: "none" }}
            >
              <option value={3}>3s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
            </select>
            <button onClick={() => setAutoRefresh(!autoRefresh)}>
              {autoRefresh ? <Wifi className="h-3 w-3" style={{ color: "#22c55e" }} /> : <WifiOff className="h-3 w-3" style={{ color: "#94a3b8" }} />}
            </button>
          </div>
          <button
            onClick={() => setLastRefresh(new Date())}
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ========== LIVE MONITORING ========== */}
      {view === "live" && (
        <div className="space-y-4">
          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: "Total", value: sensorStats.total, color: "var(--text-primary)" },
              { label: "Online", value: sensorStats.online, color: "#22c55e" },
              { label: "Atenção", value: sensorStats.warning, color: "#f59e0b" },
              { label: "Crítico", value: sensorStats.critical, color: "#ef4444" },
              { label: "Offline", value: sensorStats.offline, color: "#94a3b8" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as SensorType | "all")}
              className="text-[11px] px-2 py-1 rounded-lg"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
            >
              <option value="all">Todos os tipos</option>
              {sensorTypes.map((type) => (
                <option key={type} value={type}>{sensorTypeLabels[type]}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-[11px] px-2 py-1 rounded-lg"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
            >
              <option value="all">Todos os status</option>
              <option value="online">Online</option>
              <option value="warning">Atenção</option>
              <option value="critical">Crítico</option>
              <option value="offline">Offline</option>
            </select>
            <span className="ml-auto text-[10px]" style={{ color: "var(--text-muted)" }}>
              {filteredSensors.length} sensores • Atualizado: {lastRefresh.toLocaleTimeString("pt-BR")}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sensor Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredSensors.map((sensor) => {
                const Icon = sensorTypeIcons[sensor.type];
                const isOverWarning = sensor.value >= sensor.thresholds.warning;
                const isOverCritical = sensor.value >= sensor.thresholds.critical;
                const pct = Math.min(100, (sensor.value / sensor.thresholds.critical) * 100);

                return (
                  <button
                    key={sensor.id}
                    onClick={() => setSelectedSensor(sensor)}
                    className="text-left p-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: `2px solid ${selectedSensor?.id === sensor.id ? "var(--accent)" : isOverCritical ? "rgba(239,68,68,0.4)" : isOverWarning ? "rgba(245,158,11,0.3)" : "var(--border-primary)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{
                          backgroundColor: isOverCritical ? "rgba(239,68,68,0.1)" : isOverWarning ? "rgba(245,158,11,0.1)" : "var(--bg-elevated)",
                        }}>
                          <Icon className="h-4 w-4" style={{ color: isOverCritical ? "#ef4444" : isOverWarning ? "#f59e0b" : "var(--accent)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>{sensor.name}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sensorTypeLabels[sensor.type]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${sensor.status === "online" ? "animate-pulse" : ""}`}
                          style={{ backgroundColor: sensor.status === "online" ? "#22c55e" : sensor.status === "warning" ? "#f59e0b" : sensor.status === "critical" ? "#ef4444" : "#94a3b8" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <p className="text-xl font-bold" style={{ color: isOverCritical ? "#ef4444" : isOverWarning ? "#f59e0b" : "var(--text-primary)" }}>
                        {typeof sensor.value === "number" ? sensor.value.toFixed(sensor.value < 1 ? 3 : 1) : sensor.value}
                        <span className="text-[10px] font-normal ml-1" style={{ color: "var(--text-muted)" }}>{sensor.unit}</span>
                      </p>
                      <div className="text-right text-[9px]" style={{ color: "var(--text-muted)" }}>
                        <p>⚠ {sensor.thresholds.warning} {sensor.unit}</p>
                        <p>🔴 {sensor.thresholds.critical} {sensor.unit}</p>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isOverCritical ? "#ef4444" : isOverWarning ? "#f59e0b" : "#22c55e",
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[9px]" style={{ color: "var(--text-muted)" }}>{timeAgo(sensor.lastUpdate)}</p>
                  </button>
                );
              })}
            </div>

            {/* Detail Panel */}
            <div className="space-y-4">
              {selectedSensor ? (
                <>
                  <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" style={{ color: "var(--accent)" }} />
                        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{selectedSensor.name}</span>
                      </div>
                      <button onClick={() => setSelectedSensor(null)}>
                        <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: "Valor Atual", value: `${selectedSensor.value.toFixed(selectedSensor.value < 1 ? 3 : 1)} ${selectedSensor.unit}`, color: "var(--text-primary)" },
                        { label: "Status", value: selectedSensor.status.toUpperCase(), color: selectedSensor.status === "critical" ? "#ef4444" : selectedSensor.status === "warning" ? "#f59e0b" : "#22c55e" },
                        { label: "Limiar Atenção", value: `${selectedSensor.thresholds.warning} ${selectedSensor.unit}`, color: "#f59e0b" },
                        { label: "Limiar Crítico", value: `${selectedSensor.thresholds.critical} ${selectedSensor.unit}`, color: "#ef4444" },
                      ].map((item, i) => (
                        <div key={i} className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                          <p className="font-bold" style={{ color: item.color }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini Time Series */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                      Últimas 24h
                    </p>
                    <SensorMiniChart sensor={selectedSensor} />
                  </div>
                </>
              ) : (
                <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                  <Radio className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border-subtle)" }} />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Selecione um sensor para ver detalhes
                  </p>
                </div>
              )}

              {/* Network Summary */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                  Resumo da Rede
                </p>
                <div className="space-y-1.5">
                  {Object.entries(liveSensors.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {} as Record<string, number>))
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{
                            backgroundColor: status === "online" ? "#22c55e" : status === "warning" ? "#f59e0b" : status === "critical" ? "#ef4444" : "#94a3b8",
                          }} />
                          <span className="capitalize" style={{ color: "var(--text-secondary)" }}>{status}</span>
                        </div>
                        <span className="font-bold" style={{ color: "var(--text-primary)" }}>{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== TIME SERIES ========== */}
      {view === "timeseries" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <select
              value={selectedSensor?.id || ""}
              onChange={(e) => setSelectedSensor(liveSensors.find((s) => s.id === e.target.value) || null)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
            >
              <option value="">Selecionar sensor...</option>
              {liveSensors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="flex gap-1">
              {(["1h", "6h", "24h", "48h", "7d"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium"
                  style={{
                    backgroundColor: timeRange === range ? "var(--accent-muted)" : "var(--bg-card)",
                    color: timeRange === range ? "var(--accent)" : "var(--text-muted)",
                    border: `1px solid ${timeRange === range ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {selectedSensor ? (
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{selectedSensor.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {sensorTypeLabels[selectedSensor.type]} • Período: {timeRange} • Arraste para zoom
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#f59e0b" }} /> Atenção</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "#ef4444" }} /> Crítico</span>
                </div>
              </div>
              <SensorFullChart sensor={selectedSensor} hours={timeRangeHours[timeRange]} />
            </div>
          ) : (
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <TrendingUp className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--border-subtle)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Selecione um sensor para visualizar sua série temporal</p>
            </div>
          )}

          {/* Multi-sensor comparison */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Visão Geral — Todos os Sensores (Últimas 24h)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveSensors.slice(0, 6).map((sensor) => (
                <div key={sensor.id} className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{sensor.name}</p>
                    <span className="text-[10px] font-bold" style={{ color: sensor.status === "critical" ? "#ef4444" : sensor.status === "warning" ? "#f59e0b" : "#22c55e" }}>
                      {sensor.value.toFixed(sensor.value < 1 ? 3 : 1)} {sensor.unit}
                    </span>
                  </div>
                  <SensorSparkline sensor={sensor} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== CONFIGURABLE ALERTS ========== */}
      {view === "alerts_config" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Regras de Alerta ({alertRules.length} configuradas)
            </p>
            <button
              onClick={() => setShowAddRule(!showAddRule)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)", border: "1px solid rgba(249,115,22,0.3)" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Regra
            </button>
          </div>

          {showAddRule && <NewAlertRuleForm onAdd={(rule) => { setAlertRules((prev) => [...prev, rule]); setShowAddRule(false); }} onCancel={() => setShowAddRule(false)} />}

          <div className="space-y-2">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: `1px solid ${rule.enabled ? "var(--border-primary)" : "var(--border-subtle)"}`,
                  opacity: rule.enabled ? 1 : 0.6,
                }}
              >
                <button onClick={() => toggleAlertRule(rule.id)} className="flex-shrink-0">
                  <div className="w-10 h-5 rounded-full relative transition-colors" style={{ backgroundColor: rule.enabled ? "#22c55e" : "var(--bg-elevated)" }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{
                      left: rule.enabled ? 21 : 2,
                      backgroundColor: rule.enabled ? "white" : "var(--text-muted)",
                    }} />
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{rule.label}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {rule.sensorType === "all" ? "Todos os sensores" : sensorTypeLabels[rule.sensorType]} •
                    {rule.condition === "above" ? " Acima de " : " Abaixo de "}{rule.threshold}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {rule.channels.includes("email") && <Mail className="h-3.5 w-3.5" style={{ color: "#3b82f6" }} />}
                  {rule.channels.includes("sms") && <Smartphone className="h-3.5 w-3.5" style={{ color: "#22c55e" }} />}
                  {rule.channels.includes("push") && <Bell className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />}
                </div>
                <button onClick={() => deleteAlertRule(rule.id)} className="p-1 rounded" style={{ color: "var(--text-muted)" }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Active alerts list */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Alertas Ativos ({activeAlerts.length})
            </p>
            <div className="space-y-2">
              {activeAlerts.sort((a, b) => {
                const order = { emergency: 0, critical: 1, warning: 2, info: 3 };
                return order[a.severity] - order[b.severity];
              }).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{
                    color: alert.severity === "emergency" ? "#ef4444" : alert.severity === "critical" ? "#f97316" : alert.severity === "warning" ? "#f59e0b" : "#3b82f6",
                  }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{alert.title}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                        backgroundColor: alert.severity === "emergency" ? "rgba(239,68,68,0.15)" : alert.severity === "critical" ? "rgba(249,115,22,0.15)" : "rgba(245,158,11,0.15)",
                        color: alert.severity === "emergency" ? "#ef4444" : alert.severity === "critical" ? "#f97316" : "#f59e0b",
                      }}>{alert.severity.toUpperCase()}</span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {alert.location} • {timeAgo(alert.timestamp)}
                      {alert.affectedPopulation && ` • ${formatNumber(alert.affectedPopulation)} afetados`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== IoT STATUS ========== */}
      {view === "iot_status" && (
        <div className="space-y-4">
          {/* Platform Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "AWS IoT Core", status: "connected", devices: 12, msgs: "1.2k/min", latency: "45ms", icon: Server },
              { name: "CEMADEN API", status: "connected", devices: 8, msgs: "120/min", latency: "230ms", icon: Cpu },
              { name: "INMET Feed", status: "connected", devices: 5, msgs: "60/min", latency: "180ms", icon: Gauge },
            ].map((platform) => (
              <div key={platform.name} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <platform.icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{platform.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#22c55e" }} />
                    <span className="text-[10px] font-medium" style={{ color: "#22c55e" }}>Conectado</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{platform.devices}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Devices</p>
                  </div>
                  <div className="text-center p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{platform.msgs}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Mensagens</p>
                  </div>
                  <div className="text-center p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{platform.latency}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Latência</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Pipeline */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Pipeline de Dados IoT
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { label: "Sensores", value: "12 ativos", color: "#22c55e" },
                { label: "Ingestão", value: "MQTT/HTTP", color: "#3b82f6" },
                { label: "Processamento", value: "Stream", color: "#8b5cf6" },
                { label: "Armazenamento", value: "TimescaleDB", color: "#f59e0b" },
                { label: "Alertas", value: "4 regras", color: "#ef4444" },
                { label: "Dashboard", value: "Tempo real", color: "#f97316" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2 flex-shrink-0">
                  <div className="rounded-lg p-3 text-center min-w-[100px]" style={{ backgroundColor: "var(--bg-elevated)", border: `1px solid ${step.color}30` }}>
                    <p className="text-[10px] font-bold" style={{ color: step.color }}>{step.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{step.value}</p>
                  </div>
                  {i < 5 && <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: "var(--border-subtle)" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Device List */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Dispositivos Registrados ({liveSensors.length})
            </p>
            <div className="space-y-1.5">
              {liveSensors.map((sensor) => {
                const Icon = sensorTypeIcons[sensor.type];
                return (
                  <div key={sensor.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="text-[11px] flex-1 truncate" style={{ color: "var(--text-primary)" }}>{sensor.name}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sensor.type}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{timeAgo(sensor.lastUpdate)}</span>
                    <div className="w-2 h-2 rounded-full" style={{
                      backgroundColor: sensor.status === "online" ? "#22c55e" : sensor.status === "warning" ? "#f59e0b" : sensor.status === "critical" ? "#ef4444" : "#94a3b8",
                    }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Sub Components ----

function SensorMiniChart({ sensor }: { sensor: Sensor }) {
  const data = useMemo(
    () => generateSensorTimeSeries(sensor.id, sensor.value, sensor.value * 0.08, sensor.thresholds.warning, 24),
    [sensor.id, sensor.value, sensor.thresholds.warning]
  );

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="time" tick={{ fontSize: 8, fill: "var(--text-muted)" }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 8, fill: "var(--text-muted)" }} />
        <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
        <ReferenceLine y={sensor.thresholds.warning} stroke="#f59e0b" strokeDasharray="3 3" />
        <ReferenceLine y={sensor.thresholds.critical} stroke="#ef4444" strokeDasharray="3 3" />
        <Area type="monotone" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function SensorFullChart({ sensor, hours }: { sensor: Sensor; hours: number }) {
  const data = useMemo(
    () => generateSensorTimeSeries(sensor.id, sensor.value, sensor.value * 0.1, sensor.thresholds.warning, hours),
    [sensor.id, sensor.value, sensor.thresholds.warning, hours]
  );

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
        <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
        <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
        <ReferenceLine y={sensor.thresholds.warning} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Atenção", fill: "#f59e0b", fontSize: 10 }} />
        <ReferenceLine y={sensor.thresholds.critical} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Crítico", fill: "#ef4444", fontSize: 10 }} />
        <Area type="monotone" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.08} strokeWidth={2} dot={false} name="Valor" />
        <Brush dataKey="time" height={25} stroke="var(--border-subtle)" fill="var(--bg-elevated)" travellerWidth={8} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SensorSparkline({ sensor }: { sensor: Sensor }) {
  const data = useMemo(
    () => generateSensorTimeSeries(sensor.id, sensor.value, sensor.value * 0.06, sensor.thresholds.warning, 24).filter((_, i) => i % 4 === 0),
    [sensor.id, sensor.value, sensor.thresholds.warning]
  );

  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke="#f97316" dot={false} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function NewAlertRuleForm({ onAdd, onCancel }: { onAdd: (rule: AlertRule) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [sensorType, setSensorType] = useState<SensorType | "all">("all");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState(0);
  const [channels, setChannels] = useState<("email" | "sms" | "push")[]>(["push"]);

  const toggleChannel = (ch: "email" | "sms" | "push") => {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(249,115,22,0.3)" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Nome da Regra</label>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Nível crítico do rio"
            className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Tipo de Sensor</label>
          <select value={sensorType} onChange={(e) => setSensorType(e.target.value as SensorType | "all")}
            className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
          >
            <option value="all">Todos</option>
            {Object.entries(sensorTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Condição</label>
          <div className="flex gap-2 mt-1">
            <select value={condition} onChange={(e) => setCondition(e.target.value as "above" | "below")}
              className="px-3 py-1.5 rounded-lg text-xs"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
            >
              <option value="above">Acima de</option>
              <option value="below">Abaixo de</option>
            </select>
            <input type="number" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="flex-1 px-3 py-1.5 rounded-lg text-xs"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", outline: "none" }}
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Canais de Notificação</label>
          <div className="flex gap-2 mt-1">
            {([["email", Mail, "E-mail"], ["sms", Smartphone, "SMS"], ["push", Bell, "Push"]] as const).map(([ch, Icon, lbl]) => (
              <button key={ch} onClick={() => toggleChannel(ch)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                style={{
                  backgroundColor: channels.includes(ch) ? "var(--accent-muted)" : "var(--bg-elevated)",
                  color: channels.includes(ch) ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${channels.includes(ch) ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                }}
              >
                <Icon className="h-3 w-3" /> {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "var(--text-muted)" }}>Cancelar</button>
        <button
          onClick={() => { if (label) onAdd({ id: `ar${Date.now()}`, sensorType, condition, threshold, channels, label, enabled: true }); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "var(--accent)", color: "white" }}
        >
          <Check className="h-3 w-3" /> Criar Regra
        </button>
      </div>
    </div>
  );
}
