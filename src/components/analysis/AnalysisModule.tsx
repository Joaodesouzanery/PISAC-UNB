"use client";

import { useState } from "react";
import {
  vulnerabilityAssessments,
  historicalEvents,
  rainfallHistory,
  sensors,
} from "@/data/mock-data";
import { formatCurrency, formatNumber, getRiskColor } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MapPin,
  History,
  Brain,
  Target,
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
} from "recharts";

export default function AnalysisModule() {
  const [selectedArea, setSelectedArea] = useState(vulnerabilityAssessments[0]);
  const [view, setView] = useState<"vulnerability" | "historical" | "patterns">(
    "vulnerability"
  );

  const trendIcon = {
    improving: <TrendingDown className="h-4 w-4 text-success-500" />,
    stable: <Minus className="h-4 w-4 text-gray-400" />,
    worsening: <TrendingUp className="h-4 w-4 text-danger-500" />,
  };

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

  // Correlation data: vulnerability score vs historical cost
  const correlationData = vulnerabilityAssessments.map((va) => ({
    name: va.areaName,
    vulnerabilidade: va.overallScore,
    risco: va.factors.environmental * 0.3 + va.factors.structural * 0.3 + va.factors.social * 0.2 + va.factors.economic * 0.2,
    z: 200,
  }));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "vulnerability" as const, label: "Vulnerabilidade", icon: Target },
          { key: "historical" as const, label: "Histórico de Eventos", icon: History },
          { key: "patterns" as const, label: "Padrões e Correlações", icon: Brain },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === key
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {view === "vulnerability" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-600" />
              Regiões Monitoradas
            </h3>
            <div className="space-y-2">
              {vulnerabilityAssessments
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((va) => (
                  <button
                    key={va.areaId}
                    onClick={() => setSelectedArea(va)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedArea.areaId === va.areaId
                        ? "border-primary-300 bg-primary-50"
                        : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {va.areaName}
                      </span>
                      <div className="flex items-center gap-1">
                        {trendIcon[va.trend]}
                        <span
                          className={`text-sm font-bold ${getRiskColor(
                            va.overallScore
                          )}`}
                        >
                          {va.overallScore}
                        </span>
                      </div>
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
                      className="mt-2"
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Perfil de Vulnerabilidade - {selectedArea.areaName}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Vulnerabilidade"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Tendência:</span>
              {trendIcon[selectedArea.trend]}
              <span className="text-xs font-medium capitalize">
                {selectedArea.trend === "improving"
                  ? "Melhorando"
                  : selectedArea.trend === "stable"
                  ? "Estável"
                  : "Piorando"}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-500" />
              Recomendações - {selectedArea.areaName}
            </h3>
            <div className="space-y-2">
              {selectedArea.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs ${
                    rec.toLowerCase().includes("urgente") ||
                    rec.toLowerCase().includes("crítico")
                      ? "bg-danger-50 border-danger-200 text-danger-800"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <span className="font-medium mr-1">{i + 1}.</span>
                  {rec}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-xs font-medium text-primary-800">
                Score geral: {selectedArea.overallScore}/100
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-primary-600">
                <span>Ambiental: {selectedArea.factors.environmental}</span>
                <span>Estrutural: {selectedArea.factors.structural}</span>
                <span>Social: {selectedArea.factors.social}</span>
                <span>Econômico: {selectedArea.factors.economic}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "historical" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Custos de Eventos Históricos (R$ milhões)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`R$ ${value}M`, ""]} />
                <Bar dataKey="custo" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Custo (R$ M)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Events Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Linha do Tempo de Eventos
            </h3>
            <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin">
              {historicalEvents
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          event.severity === "critical"
                            ? "bg-danger-500"
                            : "bg-warning-500"
                        }`}
                      />
                      <div className="w-px h-full bg-gray-200 mt-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">
                          {event.date}
                        </span>
                        <StatusBadge label={event.severity} variant="severity" />
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {event.description}
                      </p>
                      <div className="flex gap-3 text-[10px] text-gray-500">
                        <span>Custo: {formatCurrency(event.cost)}</span>
                        <span>
                          Pop. afetada: {formatNumber(event.affectedPopulation)}
                        </span>
                      </div>
                      {event.lessonsLearned.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                          <p className="text-[10px] font-medium text-blue-700 mb-1">
                            Lições aprendidas:
                          </p>
                          {event.lessonsLearned.map((lesson, i) => (
                            <p
                              key={i}
                              className="text-[10px] text-blue-600"
                            >
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

      {view === "patterns" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Correlation Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Correlação Vulnerabilidade x Risco Composto
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="vulnerabilidade"
                  name="Vulnerabilidade"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Vulnerabilidade", position: "bottom", fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="risco"
                  name="Risco"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Risco", angle: -90, position: "left", fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 400]} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(1), ""]}
                  labelFormatter={(label) => {
                    const item = correlationData.find(
                      (d) => d.vulnerabilidade === label
                    );
                    return item?.name || "";
                  }}
                />
                <Scatter data={correlationData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Sensor Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Distribuição de Sensores por Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Online",
                    count: sensors.filter((s) => s.status === "online").length,
                  },
                  {
                    name: "Atenção",
                    count: sensors.filter((s) => s.status === "warning").length,
                  },
                  {
                    name: "Crítico",
                    count: sensors.filter((s) => s.status === "critical").length,
                  },
                  {
                    name: "Offline",
                    count: sensors.filter((s) => s.status === "offline").length,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Sensores" radius={[4, 4, 0, 0]}>
                  {[
                    { fill: "#22c55e" },
                    { fill: "#f59e0b" },
                    { fill: "#ef4444" },
                    { fill: "#94a3b8" },
                  ].map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Insights da IA:
              </p>
              <ul className="space-y-1 text-[10px] text-gray-600">
                <li>
                  • Região de Ceilândia apresenta maior concentração de fatores
                  de risco convergentes
                </li>
                <li>
                  • Correlação forte (0.87) entre vulnerabilidade social e
                  impacto financeiro de desastres
                </li>
                <li>
                  • Padrão sazonal detectado: 73% dos eventos ocorrem entre
                  Nov-Mar
                </li>
                <li>
                  • Previsão: probabilidade de 40% de evento significativo nos
                  próximos 30 dias
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
