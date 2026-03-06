"use client";

import MetricCard from "@/components/shared/MetricCard";
import StatusBadge from "@/components/shared/StatusBadge";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  sensors,
  alerts,
  infrastructures,
  riskScenarios,
  budgetCategories,
  vulnerabilityAssessments,
  rainfallHistory,
} from "@/data/mock-data";
import { formatCurrency, formatNumber, timeAgo, getRiskColor } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Building2,
  CloudRain,
  Shield,
  TrendingUp,
  Droplets,
  Wind,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function DashboardOverview() {
  const activeSensors = sensors.filter((s) => s.status !== "offline").length;
  const criticalSensors = sensors.filter((s) => s.status === "critical").length;
  const activeAlerts = alerts.filter((a) => a.isActive).length;
  const emergencyAlerts = alerts.filter(
    (a) => a.isActive && a.severity === "emergency"
  ).length;
  const criticalInfra = infrastructures.filter(
    (i) => i.condition === "poor" || i.condition === "critical"
  ).length;
  const totalBudget = budgetCategories.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetCategories.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-6">
      {/* Emergency Banner */}
      {emergencyAlerts > 0 && (
        <div className="bg-gradient-danger text-white rounded-lg p-4 flex items-center gap-3 shadow-lg animate-pulse">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-bold">ALERTA DE EMERGÊNCIA ATIVO</p>
            <p className="text-sm text-red-100">
              {alerts.find((a) => a.severity === "emergency")?.title} -{" "}
              {alerts.find((a) => a.severity === "emergency")?.description}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sensores Ativos"
          value={`${activeSensors}/${sensors.length}`}
          subtitle={`${criticalSensors} em estado crítico`}
          icon={Activity}
          status={criticalSensors > 0 ? "warning" : "normal"}
          change={-5}
          changeLabel="vs. semana anterior"
        />
        <MetricCard
          title="Alertas Ativos"
          value={activeAlerts}
          subtitle={`${emergencyAlerts} emergência(s)`}
          icon={AlertTriangle}
          status={emergencyAlerts > 0 ? "critical" : activeAlerts > 3 ? "warning" : "normal"}
          change={15}
          changeLabel="vs. semana anterior"
        />
        <MetricCard
          title="Infraestruturas em Risco"
          value={criticalInfra}
          subtitle={`de ${infrastructures.length} monitoradas`}
          icon={Building2}
          status={criticalInfra > 2 ? "critical" : criticalInfra > 0 ? "warning" : "normal"}
        />
        <MetricCard
          title="Execução Orçamentária"
          value={`${Math.round((totalSpent / totalBudget) * 100)}%`}
          subtitle={formatCurrency(totalSpent) + " executado"}
          icon={TrendingUp}
          status="normal"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CloudRain className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Precipitação Mensal (mm)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={rainfallHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                fill="#bfdbfe"
                name="2026"
              />
              <Area
                type="monotone"
                dataKey="avg"
                stroke="#94a3b8"
                fill="transparent"
                strokeDasharray="5 5"
                name="Média histórica"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Scenarios Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Cenários de Risco Ativos
            </h3>
          </div>
          <div className="space-y-3">
            {riskScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div
                  className={`w-2 h-10 rounded-full ${
                    scenario.severity >= 8
                      ? "bg-danger-500"
                      : scenario.severity >= 6
                      ? "bg-warning-500"
                      : "bg-primary-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {scenario.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Prob: {(scenario.probability * 100).toFixed(0)}% | Pop:{" "}
                    {formatNumber(scenario.estimatedPopulationAffected)} | Custo:{" "}
                    {formatCurrency(scenario.estimatedCost)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${getRiskColor(
                      scenario.severity * 10
                    )}`}
                  >
                    {scenario.severity}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Alertas Recentes
          </h3>
          <div className="space-y-2">
            {alerts
              .filter((a) => a.isActive)
              .slice(0, 5)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      alert.severity === "emergency"
                        ? "bg-red-500 animate-pulse-dot"
                        : alert.severity === "critical"
                        ? "bg-orange-500"
                        : alert.severity === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {alert.title}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {alert.location} • {timeAgo(alert.timestamp)}
                    </p>
                  </div>
                  <StatusBadge label={alert.severity} variant="severity" />
                </div>
              ))}
          </div>
        </div>

        {/* Vulnerability Rankings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Vulnerabilidade por Região
          </h3>
          <div className="space-y-3">
            {vulnerabilityAssessments
              .sort((a, b) => b.overallScore - a.overallScore)
              .map((va) => (
                <div key={va.areaId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {va.areaName}
                    </span>
                    <span
                      className={`text-xs font-bold ${getRiskColor(
                        va.overallScore
                      )}`}
                    >
                      {va.overallScore}/100
                    </span>
                  </div>
                  <ProgressBar
                    value={va.overallScore}
                    showPercentage={false}
                    size="sm"
                    color={
                      va.overallScore > 70
                        ? "danger"
                        : va.overallScore > 50
                        ? "warning"
                        : "primary"
                    }
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Orçamento por Categoria
          </h3>
          <div className="space-y-3">
            {budgetCategories.slice(0, 5).map((bc) => (
              <div key={bc.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {bc.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(bc.spent)} / {formatCurrency(bc.allocated)}
                  </span>
                </div>
                <ProgressBar
                  value={bc.spent}
                  max={bc.allocated}
                  showPercentage={false}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
