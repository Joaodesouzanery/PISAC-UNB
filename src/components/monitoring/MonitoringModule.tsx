"use client";

import { useState, useEffect } from "react";
import { sensors, alerts, riverLevelHistory } from "@/data/mock-data";
import StatusBadge from "@/components/shared/StatusBadge";
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
  Area,
  AreaChart,
} from "recharts";
import type { Sensor, SensorType, Alert } from "@/types";

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

export default function MonitoringModule() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [filterType, setFilterType] = useState<SensorType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredSensors = sensors.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const activeAlerts = alerts.filter((a) => a.isActive);

  const sensorTypes = Array.from(new Set(sensors.map((s) => s.type)));

  return (
    <div className="space-y-6">
      {/* Alerts Panel */}
      {activeAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-danger-600" />
            Alertas Ativos ({activeAlerts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAlerts
              .sort((a, b) => {
                const order = { emergency: 0, critical: 1, warning: 2, info: 3 };
                return order[a.severity] - order[b.severity];
              })
              .map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    alert.severity === "emergency"
                      ? "bg-red-50 border-red-500"
                      : alert.severity === "critical"
                      ? "bg-orange-50 border-orange-500"
                      : alert.severity === "warning"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-blue-50 border-blue-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {alert.title}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">
                        {alert.description}
                      </p>
                    </div>
                    <StatusBadge label={alert.severity} variant="severity" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                    <span>{alert.location}</span>
                    <span>{timeAgo(alert.timestamp)}</span>
                    {alert.affectedPopulation && (
                      <span>{formatNumber(alert.affectedPopulation)} afetados</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as SensorType | "all")}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="all">Todos os tipos</option>
            {sensorTypes.map((type) => (
              <option key={type} value={type}>
                {sensorTypeLabels[type]}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="all">Todos os status</option>
            <option value="online">Online</option>
            <option value="warning">Atenção</option>
            <option value="critical">Crítico</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => setLastRefresh(new Date())}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar
          </button>
          <span className="text-[10px] text-gray-400">
            Última: {lastRefresh.toLocaleTimeString("pt-BR")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSensors.map((sensor) => {
              const Icon = sensorTypeIcons[sensor.type];
              const isOverWarning = sensor.value >= sensor.thresholds.warning;
              const isOverCritical = sensor.value >= sensor.thresholds.critical;

              return (
                <button
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor)}
                  className={cn(
                    "text-left bg-white rounded-lg shadow-sm border-2 p-3 transition-all hover:shadow-md",
                    selectedSensor?.id === sensor.id
                      ? "border-primary-400 ring-2 ring-primary-100"
                      : isOverCritical
                      ? "border-danger-300"
                      : isOverWarning
                      ? "border-warning-300"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "p-1.5 rounded-lg",
                          isOverCritical
                            ? "bg-danger-50 text-danger-600"
                            : isOverWarning
                            ? "bg-warning-50 text-warning-600"
                            : "bg-primary-50 text-primary-600"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 truncate max-w-[180px]">
                          {sensor.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {sensorTypeLabels[sensor.type]}
                        </p>
                      </div>
                    </div>
                    <StatusBadge label={sensor.status} />
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p
                        className={cn(
                          "text-xl font-bold",
                          isOverCritical
                            ? "text-danger-600"
                            : isOverWarning
                            ? "text-warning-600"
                            : "text-gray-900"
                        )}
                      >
                        {sensor.value}
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          {sensor.unit}
                        </span>
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-gray-400">
                      <p>
                        Atenção: {sensor.thresholds.warning} {sensor.unit}
                      </p>
                      <p>
                        Crítico: {sensor.thresholds.critical} {sensor.unit}
                      </p>
                    </div>
                  </div>

                  {/* Mini progress bar showing value relative to critical */}
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isOverCritical
                          ? "bg-danger-500"
                          : isOverWarning
                          ? "bg-warning-500"
                          : "bg-success-500"
                      )}
                      style={{
                        width: `${Math.min(
                          100,
                          (sensor.value / sensor.thresholds.critical) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] text-gray-400">
                    {timeAgo(sensor.lastUpdate)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selectedSensor ? (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-primary-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    {selectedSensor.name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-500">Valor Atual</p>
                    <p className="font-bold text-lg text-gray-900">
                      {selectedSensor.value} {selectedSensor.unit}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-500">Status</p>
                    <div className="mt-1">
                      <StatusBadge label={selectedSensor.status} />
                    </div>
                  </div>
                  <div className="bg-warning-50 rounded-lg p-2">
                    <p className="text-warning-700">Limiar Atenção</p>
                    <p className="font-bold text-warning-800">
                      {selectedSensor.thresholds.warning} {selectedSensor.unit}
                    </p>
                  </div>
                  <div className="bg-danger-50 rounded-lg p-2">
                    <p className="text-danger-700">Limiar Crítico</p>
                    <p className="font-bold text-danger-800">
                      {selectedSensor.thresholds.critical} {selectedSensor.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Series Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Série Temporal (Últimas 24h)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={riverLevelHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <ReferenceLine
                      y={selectedSensor.thresholds.warning}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      label={{
                        value: "Atenção",
                        fontSize: 9,
                        fill: "#f59e0b",
                      }}
                    />
                    <ReferenceLine
                      y={selectedSensor.thresholds.critical}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label={{
                        value: "Crítico",
                        fontSize: 9,
                        fill: "#ef4444",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="level"
                      stroke="#2563eb"
                      fill="#bfdbfe"
                      name="Nível"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Radio className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Selecione um sensor para ver detalhes e séries temporais
              </p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Resumo da Rede
            </h3>
            <div className="space-y-2">
              {Object.entries(
                sensors.reduce((acc, s) => {
                  acc[s.status] = (acc[s.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between text-xs"
                >
                  <StatusBadge label={status} />
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between text-xs">
                <span className="font-medium text-gray-700">Total</span>
                <span className="font-bold text-gray-900">{sensors.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
