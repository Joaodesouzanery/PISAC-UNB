"use client";

import { useState } from "react";
import { riskScenarios, financialImpacts } from "@/data/mock-data";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getRiskColor,
  cn,
} from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  PlayCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Route,
  Package,
  ChevronDown,
  ChevronUp,
  Zap,
  MapPin,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { RiskScenario } from "@/types";

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#3b82f6", "#22c55e"];

export default function SimulationModule() {
  const [selectedScenario, setSelectedScenario] = useState<RiskScenario>(
    riskScenarios[0]
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("impact");

  const financialImpact = financialImpacts.find(
    (fi) => fi.scenarioId === selectedScenario.id
  );

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const riskMatrixData = riskScenarios.map((s) => ({
    name: s.name.substring(0, 20),
    probabilidade: s.probability * 100,
    severidade: s.severity * 10,
    custo: s.estimatedCost / 1000000,
  }));

  const resourceData = selectedScenario.requiredResources.map((r) => ({
    name: r.type,
    necessario: r.quantity,
    disponivel: r.available,
  }));

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-primary-600" />
          Selecione um Cenário de Risco
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {riskScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario);
                setSimulationComplete(false);
              }}
              className={cn(
                "text-left p-3 rounded-lg border-2 transition-all",
                selectedScenario.id === scenario.id
                  ? "border-primary-400 bg-primary-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded",
                    scenario.severity >= 8
                      ? "bg-danger-100 text-danger-700"
                      : scenario.severity >= 6
                      ? "bg-warning-100 text-warning-700"
                      : "bg-primary-100 text-primary-700"
                  )}
                >
                  Sev: {scenario.severity}/10
                </span>
                <span className="text-[10px] text-gray-400">
                  Prob: {(scenario.probability * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs font-medium text-gray-900 leading-tight">
                {scenario.name}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isSimulating
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            <Zap className="h-4 w-4" />
            {isSimulating ? "Simulando..." : "Executar Simulação"}
          </button>
          {isSimulating && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">
                Processando modelo de simulação...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scenario Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scenario Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              {selectedScenario.name}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {selectedScenario.description}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Users className="h-4 w-4 mx-auto text-primary-600 mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {formatNumber(selectedScenario.estimatedPopulationAffected)}
                </p>
                <p className="text-[10px] text-gray-500">Pop. Afetada</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <DollarSign className="h-4 w-4 mx-auto text-warning-600 mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(selectedScenario.estimatedCost)}
                </p>
                <p className="text-[10px] text-gray-500">Custo Estimado</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <AlertTriangle className="h-4 w-4 mx-auto text-danger-600 mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {selectedScenario.affectedAreas.length}
                </p>
                <p className="text-[10px] text-gray-500">Áreas Impactadas</p>
              </div>
            </div>
          </div>

          {/* Collapsible Sections */}
          {/* Affected Areas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection("areas")}
              className="w-full flex items-center justify-between p-4"
            >
              <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" />
                Áreas Afetadas
              </span>
              {expandedSection === "areas" ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expandedSection === "areas" && (
              <div className="px-4 pb-4 space-y-2">
                {selectedScenario.affectedAreas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {area.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Densidade: {formatNumber(area.populationDensity)}{" "}
                        hab/km²
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-1 rounded",
                        area.impactLevel === "extreme"
                          ? "bg-red-100 text-red-700"
                          : area.impactLevel === "high"
                          ? "bg-orange-100 text-orange-700"
                          : area.impactLevel === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      )}
                    >
                      {area.impactLevel.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSection("resources")}
              className="w-full flex items-center justify-between p-4"
            >
              <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary-600" />
                Recursos Necessários
              </span>
              {expandedSection === "resources" ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expandedSection === "resources" && (
              <div className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={resourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="necessario" fill="#ef4444" name="Necessário" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="disponivel" fill="#22c55e" name="Disponível" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {selectedScenario.requiredResources.some(
                  (r) => r.available < r.quantity
                ) && (
                  <div className="mt-3 p-2 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-[10px] text-danger-700 font-medium">
                      Déficit de recursos detectado! Recursos insuficientes
                      para cobertura total do cenário.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Evacuation Routes */}
          {selectedScenario.evacuationRoutes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection("evacuation")}
                className="w-full flex items-center justify-between p-4"
              >
                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary-600" />
                  Rotas de Evacuação
                </span>
                {expandedSection === "evacuation" ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {expandedSection === "evacuation" && (
                <div className="px-4 pb-4 space-y-2">
                  {selectedScenario.evacuationRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <p className="text-xs font-medium text-gray-900">
                        {route.name}
                      </p>
                      <div className="flex gap-4 mt-1 text-[10px] text-gray-500">
                        <span>
                          Capacidade: {formatNumber(route.capacity)} pessoas
                        </span>
                        <span>Tempo estimado: {route.estimatedTime} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Financial & Risk Matrix */}
        <div className="space-y-4">
          {/* Financial Impact */}
          {financialImpact && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-warning-600" />
                Impacto Financeiro
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Custo Direto</span>
                  <span className="font-bold text-danger-600">
                    {formatCurrency(financialImpact.directCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Custo Indireto</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(financialImpact.indirectCost)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center text-xs">
                  <span className="text-gray-700 font-medium">
                    Custo Total
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(
                      financialImpact.directCost +
                        financialImpact.indirectCost
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Cobertura Seguro</span>
                    <span className="font-medium text-primary-600">
                      {formatCurrency(financialImpact.insuranceCoverage)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Auxílio Federal</span>
                    <span className="font-medium text-primary-600">
                      {formatCurrency(financialImpact.federalAid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t pt-2">
                    <span className="text-gray-700 font-medium">
                      Déficit Municipal
                    </span>
                    <span className="font-bold text-danger-600">
                      {formatCurrency(
                        financialImpact.directCost +
                          financialImpact.indirectCost -
                          financialImpact.insuranceCoverage -
                          financialImpact.federalAid
                      )}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-xs text-center">
                  <p className="text-gray-500">Tempo de Recuperação</p>
                  <p className="font-bold text-gray-900">
                    {financialImpact.recoveryTime} meses
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Risk Matrix */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Matriz de Risco
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskMatrixData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-20} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="probabilidade"
                  fill="#3b82f6"
                  name="Prob. (%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="severidade"
                  fill="#ef4444"
                  name="Sev. (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Simulation Result */}
          {simulationComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-green-800 mb-2">
                Simulação Concluída
              </h3>
              <div className="space-y-2 text-xs text-green-700">
                <p>
                  Tempo de resposta estimado:{" "}
                  <strong>
                    {selectedScenario.evacuationRoutes[0]?.estimatedTime || 60}{" "}
                    min
                  </strong>
                </p>
                <p>
                  Cobertura de evacuação:{" "}
                  <strong>
                    {Math.min(
                      100,
                      Math.round(
                        ((selectedScenario.evacuationRoutes.reduce(
                          (s, r) => s + r.capacity,
                          0
                        ) || selectedScenario.estimatedPopulationAffected * 0.7) /
                          selectedScenario.estimatedPopulationAffected) *
                          100
                      )
                    )}
                    %
                  </strong>
                </p>
                <p>
                  Nível de preparação:{" "}
                  <strong>
                    {selectedScenario.requiredResources.every(
                      (r) => r.available >= r.quantity
                    )
                      ? "Adequado"
                      : "Insuficiente - requer ação"}
                  </strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
