"use client";

import { useState, useMemo, useCallback } from "react";
import { riskScenarios, financialImpacts } from "@/data/mock-data";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import {
  runHydrologicalSimulation,
  calculateSocialImpact,
  calculateEconomicImpact,
  whatIfParameters,
  whatIfScenarios,
  type WhatIfParameter,
  type SimulationResult,
  type SocialImpact,
  type EconomicImpact,
} from "@/lib/simulation-engine";
import type { RiskScenario } from "@/types";
import {
  PlayCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Zap,
  MapPin,
  ChevronDown,
  ChevronUp,
  Droplets,
  Building2,
  HeartPulse,
  GraduationCap,
  Gauge,
  Waves,
  SlidersHorizontal,
  ArrowRight,
  TrendingDown,
  Shield,
  RotateCcw,
  Activity,
  Loader2,
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
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  ComposedChart,
  ReferenceLine,
} from "recharts";

type SimView = "scenario" | "hydro" | "whatif";

export default function SimulationModule() {
  const [simView, setSimView] = useState<SimView>("scenario");
  const [selectedScenario, setSelectedScenario] = useState<RiskScenario>(riskScenarios[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("impact");

  // Hydro simulation state
  const [hydroParams, setHydroParams] = useState<WhatIfParameter[]>(
    whatIfParameters.map((p) => ({ ...p }))
  );
  const [hydroResult, setHydroResult] = useState<SimulationResult | null>(null);
  const [socialResult, setSocialResult] = useState<SocialImpact | null>(null);
  const [economicResult, setEconomicResult] = useState<EconomicImpact | null>(null);
  const [hydroRunning, setHydroRunning] = useState(false);

  // What-if state
  const [selectedWhatIf, setSelectedWhatIf] = useState(whatIfScenarios[0]);
  const [baselineResult, setBaselineResult] = useState<SimulationResult | null>(null);
  const [modifiedResult, setModifiedResult] = useState<SimulationResult | null>(null);
  const [whatIfRunning, setWhatIfRunning] = useState(false);

  const financialImpact = financialImpacts.find((fi) => fi.scenarioId === selectedScenario.id);

  const runLegacySimulation = () => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 1500);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateParam = useCallback((id: string, value: number) => {
    setHydroParams((prev) => prev.map((p) => (p.id === id ? { ...p, currentValue: value } : p)));
  }, []);

  const resetParams = useCallback(() => {
    setHydroParams(whatIfParameters.map((p) => ({ ...p })));
    setHydroResult(null);
    setSocialResult(null);
    setEconomicResult(null);
  }, []);

  const runHydroSim = useCallback(() => {
    setHydroRunning(true);
    setTimeout(() => {
      const params = {
        rainfall: hydroParams.find((p) => p.id === "p1")?.currentValue || 60,
        duration: hydroParams.find((p) => p.id === "p2")?.currentValue || 6,
        soilSaturation: hydroParams.find((p) => p.id === "p3")?.currentValue || 70,
        drainageCapacity: hydroParams.find((p) => p.id === "p4")?.currentValue || 65,
        urbanImpermeability: hydroParams.find((p) => p.id === "p5")?.currentValue || 55,
      };
      const evac = hydroParams.find((p) => p.id === "p8")?.currentValue || 0;
      const result = runHydrologicalSimulation(params);
      const social = calculateSocialImpact(result, evac);
      const economic = calculateEconomicImpact(result, social);
      setHydroResult(result);
      setSocialResult(social);
      setEconomicResult(economic);
      setHydroRunning(false);
    }, 800);
  }, [hydroParams]);

  const runWhatIfSim = useCallback(() => {
    setWhatIfRunning(true);
    setTimeout(() => {
      // Baseline
      const baseResult = runHydrologicalSimulation({});
      // Modified
      const overrides = selectedWhatIf.paramOverrides;
      const modParams: Record<string, number> = {};
      if (overrides.p1) modParams.rainfall = overrides.p1;
      if (overrides.p2) modParams.duration = overrides.p2;
      if (overrides.p3) modParams.soilSaturation = overrides.p3;
      if (overrides.p4) modParams.drainageCapacity = overrides.p4;
      if (overrides.p5) modParams.urbanImpermeability = overrides.p5;
      const modResult = runHydrologicalSimulation(modParams);
      setBaselineResult(baseResult);
      setModifiedResult(modResult);
      setWhatIfRunning(false);
    }, 1000);
  }, [selectedWhatIf]);

  const riskMatrixData = riskScenarios.map((s) => ({
    name: s.name.substring(0, 20),
    probabilidade: s.probability * 100,
    severidade: s.severity * 10,
    custo: s.estimatedCost / 1000000,
  }));

  const categoryColors: Record<string, string> = {
    mitigation: "#22c55e",
    adaptation: "#3b82f6",
    response: "#f59e0b",
    prevention: "#ef4444",
  };

  const tabs = [
    { key: "scenario" as const, label: "Cenários", icon: AlertTriangle },
    { key: "hydro" as const, label: "Modelo Hidrológico", icon: Droplets },
    { key: "whatif" as const, label: "What-If", icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSimView(key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: simView === key ? "var(--accent-muted)" : "var(--bg-card)",
              color: simView === key ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${simView === key ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ========== SCENARIO VIEW ========== */}
      {simView === "scenario" && (
        <div className="space-y-4">
          {/* Scenario Selector */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <PlayCircle className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              Cenários de Risco
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {riskScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => { setSelectedScenario(scenario); setSimulationComplete(false); }}
                  className="text-left p-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: selectedScenario.id === scenario.id ? "var(--accent-muted)" : "var(--bg-elevated)",
                    border: `1px solid ${selectedScenario.id === scenario.id ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: scenario.severity >= 8 ? "rgba(239,68,68,0.15)" : scenario.severity >= 6 ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)",
                        color: scenario.severity >= 8 ? "#ef4444" : scenario.severity >= 6 ? "#f59e0b" : "#3b82f6",
                      }}
                    >
                      Sev: {scenario.severity}/10
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {(scenario.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-tight" style={{ color: "var(--text-primary)" }}>
                    {scenario.name}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={runLegacySimulation}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: isSimulating ? "var(--bg-elevated)" : "var(--accent)",
                  color: isSimulating ? "var(--text-muted)" : "white",
                  opacity: isSimulating ? 0.6 : 1,
                }}
              >
                {isSimulating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                {isSimulating ? "Simulando..." : "Executar Simulação"}
              </button>
              {isSimulating && (
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Processando modelo...
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Scenario Detail */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {selectedScenario.name}
                </p>
                <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>
                  {selectedScenario.description}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Users, value: formatNumber(selectedScenario.estimatedPopulationAffected), label: "Pop. Afetada", color: "#3b82f6" },
                    { icon: DollarSign, value: formatCurrency(selectedScenario.estimatedCost), label: "Custo Estimado", color: "#f59e0b" },
                    { icon: AlertTriangle, value: selectedScenario.affectedAreas.length.toString(), label: "Áreas Impactadas", color: "#ef4444" },
                  ].map(({ icon: Icon, value, label, color }) => (
                    <div key={label} className="rounded-lg p-3 text-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} />
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collapsible: Affected Areas */}
              <div className="rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <button onClick={() => toggleSection("areas")} className="w-full flex items-center justify-between p-4">
                  <span className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <MapPin className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                    Áreas Afetadas ({selectedScenario.affectedAreas.length})
                  </span>
                  {expandedSection === "areas" ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                </button>
                {expandedSection === "areas" && (
                  <div className="px-4 pb-4 space-y-2">
                    {selectedScenario.affectedAreas.map((area) => (
                      <div key={area.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{area.name}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Densidade: {formatNumber(area.populationDensity)} hab/km²</p>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                          backgroundColor: area.impactLevel === "extreme" ? "rgba(239,68,68,0.15)" : area.impactLevel === "high" ? "rgba(249,115,22,0.15)" : "rgba(245,158,11,0.15)",
                          color: area.impactLevel === "extreme" ? "#ef4444" : area.impactLevel === "high" ? "#f97316" : "#f59e0b",
                        }}>
                          {area.impactLevel.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources chart */}
              <div className="rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <button onClick={() => toggleSection("resources")} className="w-full flex items-center justify-between p-4">
                  <span className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Shield className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                    Recursos Necessários
                  </span>
                  {expandedSection === "resources" ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                </button>
                {expandedSection === "resources" && (
                  <div className="px-4 pb-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={selectedScenario.requiredResources.map((r) => ({ name: r.type, necessario: r.quantity, disponivel: r.available }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="necessario" fill="#ef4444" name="Necessário" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="disponivel" fill="#22c55e" name="Disponível" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    {selectedScenario.requiredResources.some((r) => r.available < r.quantity) && (
                      <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <p className="text-[10px] font-medium" style={{ color: "#ef4444" }}>
                          Déficit de recursos detectado!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Impact + Risk Matrix */}
            <div className="space-y-4">
              {financialImpact && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <DollarSign className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
                    Impacto Financeiro
                  </p>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Custo Direto", value: financialImpact.directCost, color: "#ef4444" },
                      { label: "Custo Indireto", value: financialImpact.indirectCost, color: "#f97316" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-bold" style={{ color }}>{formatCurrency(value)}</span>
                      </div>
                    ))}
                    <div className="pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Total</span>
                        <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                          {formatCurrency(financialImpact.directCost + financialImpact.indirectCost)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 space-y-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <div className="flex justify-between items-center">
                        <span style={{ color: "var(--text-muted)" }}>Seguro</span>
                        <span className="font-medium" style={{ color: "#3b82f6" }}>{formatCurrency(financialImpact.insuranceCoverage)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: "var(--text-muted)" }}>Auxílio Federal</span>
                        <span className="font-medium" style={{ color: "#3b82f6" }}>{formatCurrency(financialImpact.federalAid)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Déficit</span>
                        <span className="font-bold" style={{ color: "#ef4444" }}>
                          {formatCurrency(financialImpact.directCost + financialImpact.indirectCost - financialImpact.insuranceCoverage - financialImpact.federalAid)}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Recuperação</p>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{financialImpact.recoveryTime} meses</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Matrix */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Matriz de Risco
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={riskMatrixData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: "var(--text-muted)" }} angle={-15} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="probabilidade" fill="#3b82f6" name="Prob. (%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="severidade" fill="#ef4444" name="Sev. (%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {simulationComplete && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#22c55e" }}>Simulação Concluída</p>
                  <div className="space-y-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    <p>Tempo de resposta: <strong>{selectedScenario.evacuationRoutes[0]?.estimatedTime || 60} min</strong></p>
                    <p>Cobertura de evacuação: <strong>{Math.min(100, Math.round(((selectedScenario.evacuationRoutes.reduce((s, r) => s + r.capacity, 0) || selectedScenario.estimatedPopulationAffected * 0.7) / selectedScenario.estimatedPopulationAffected) * 100))}%</strong></p>
                    <p>Preparação: <strong>{selectedScenario.requiredResources.every((r) => r.available >= r.quantity) ? "Adequado" : "Insuficiente"}</strong></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== HYDROLOGICAL MODEL ========== */}
      {simView === "hydro" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Parameters */}
            <div className="lg:col-span-4 rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Parâmetros da Simulação
                </p>
                <button onClick={resetParams} className="p-1 rounded" style={{ color: "var(--text-muted)" }} title="Resetar">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {hydroParams.map((param) => (
                  <div key={param.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {param.name}
                      </span>
                      <span className="text-[11px] font-bold font-mono" style={{ color: "var(--accent)" }}>
                        {param.currentValue}{param.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={param.currentValue}
                      onChange={(e) => updateParam(param.id, parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((param.currentValue - param.min) / (param.max - param.min)) * 100}%, var(--bg-elevated) ${((param.currentValue - param.min) / (param.max - param.min)) * 100}%, var(--bg-elevated) 100%)`,
                      }}
                    />
                    <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {param.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={runHydroSim}
                disabled={hydroRunning}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: hydroRunning ? "var(--bg-elevated)" : "var(--accent)",
                  color: hydroRunning ? "var(--text-muted)" : "white",
                }}
              >
                {hydroRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Waves className="h-3.5 w-3.5" />}
                {hydroRunning ? "Calculando..." : "Executar Modelo Hidrológico"}
              </button>
            </div>

            {/* Results */}
            <div className="lg:col-span-8 space-y-4">
              {!hydroResult ? (
                <div
                  className="rounded-xl p-8 flex flex-col items-center justify-center"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", minHeight: 300 }}
                >
                  <Waves className="h-12 w-12 mb-3" style={{ color: "var(--border-subtle)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                    Ajuste os parâmetros e execute o modelo
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                    Modelo hidrológico baseado no Método Racional Modificado
                  </p>
                </div>
              ) : (
                <>
                  {/* KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: "Vazão Máx.", value: `${hydroResult.peakFlow} m³/s`, color: "#f97316" },
                      { label: "Nível Máx.", value: `${hydroResult.peakLevel} m`, color: hydroResult.peakLevel > 5 ? "#ef4444" : "#f59e0b" },
                      { label: "Área Inundada", value: `${hydroResult.floodedArea} km²`, color: "#3b82f6" },
                      { label: "Duração Cheia", value: `${hydroResult.floodDuration}h`, color: "#8b5cf6" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                        <p className="text-lg font-bold" style={{ color }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Hydrograph */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                      Hidrograma — Nível do Rio vs Precipitação
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart data={hydroResult.timeSteps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--text-muted)" }} label={{ value: "Hora", position: "bottom", fontSize: 10, fill: "var(--text-muted)" }} />
                        <YAxis yAxisId="level" tick={{ fontSize: 10, fill: "var(--text-muted)" }} label={{ value: "Nível (m)", angle: -90, position: "left", fontSize: 10, fill: "var(--text-muted)" }} />
                        <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 10, fill: "var(--text-muted)" }} label={{ value: "Chuva (mm)", angle: 90, position: "right", fontSize: 10, fill: "var(--text-muted)" }} reversed />
                        <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <ReferenceLine yAxisId="level" y={5.0} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Alerta", fill: "#ef4444", fontSize: 10 }} />
                        <Bar yAxisId="rain" dataKey="rainfall" fill="#3b82f6" fillOpacity={0.4} name="Precipitação (mm)" />
                        <Area yAxisId="level" type="monotone" dataKey="riverLevel" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} name="Nível (m)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Social + Economic Impact */}
                  {socialResult && economicResult && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Social */}
                      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                          <Users className="h-3.5 w-3.5" />
                          Impacto Social
                        </p>
                        <div className="space-y-2">
                          {[
                            { icon: Users, label: "População afetada", value: formatNumber(socialResult.populationAffected) },
                            { icon: Building2, label: "Domicílios deslocados", value: formatNumber(socialResult.householdsDisplaced) },
                            { icon: GraduationCap, label: "Escolas fechadas", value: socialResult.schoolsClosed.toString() },
                            { icon: HeartPulse, label: "Hospitais impactados", value: socialResult.hospitalsBurdened.toString() },
                            { icon: Users, label: "Pop. vulnerável", value: formatNumber(socialResult.vulnerablePopulation) },
                            { icon: Shield, label: `Abrigos: ${formatNumber(socialResult.shelterDemand)}/${formatNumber(socialResult.shelterCapacity)}`, value: socialResult.shelterDemand > socialResult.shelterCapacity ? "DÉFICIT" : "OK" },
                          ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                              </div>
                              <span className="text-[11px] font-bold" style={{ color: value === "DÉFICIT" ? "#ef4444" : "var(--text-primary)" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Economic */}
                      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                          <DollarSign className="h-3.5 w-3.5" />
                          Impacto Econômico
                        </p>
                        <div className="space-y-1.5">
                          {[
                            { label: "Infraestrutura", value: economicResult.directInfraDamage },
                            { label: "Residencial", value: economicResult.residentialDamage },
                            { label: "Comércio", value: economicResult.commercialLoss },
                            { label: "Indústria", value: economicResult.industrialLoss },
                            { label: "Transporte", value: economicResult.transportDisruption },
                            { label: "Emergência", value: economicResult.emergencyResponseCost },
                            { label: "Produtividade", value: economicResult.productivityLoss },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between text-[11px]">
                              <span style={{ color: "var(--text-muted)" }}>{label}</span>
                              <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatCurrency(value)}</span>
                            </div>
                          ))}
                          <div className="pt-2 mt-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Total</span>
                              <span className="text-xs font-bold" style={{ color: "#ef4444" }}>{formatCurrency(economicResult.totalCost)}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[10px]">
                              <span style={{ color: "var(--text-muted)" }}>Impacto no PIB</span>
                              <span style={{ color: "var(--text-primary)" }}>{economicResult.gdpImpactPercent}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span style={{ color: "var(--text-muted)" }}>Recuperação</span>
                              <span style={{ color: "var(--text-primary)" }}>{economicResult.recoveryMonths} meses</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== WHAT-IF SCENARIOS ========== */}
      {simView === "whatif" && (
        <div className="space-y-4">
          {/* Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {whatIfScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => { setSelectedWhatIf(scenario); setBaselineResult(null); setModifiedResult(null); }}
                className="text-left p-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: selectedWhatIf.id === scenario.id ? "var(--accent-muted)" : "var(--bg-card)",
                  border: `1px solid ${selectedWhatIf.id === scenario.id ? "rgba(249,115,22,0.3)" : "var(--border-primary)"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{
                      backgroundColor: `${categoryColors[scenario.category]}20`,
                      color: categoryColors[scenario.category],
                    }}
                  >
                    {scenario.category}
                  </span>
                </div>
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{scenario.name}</p>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{scenario.description}</p>
              </button>
            ))}
          </div>

          {/* Run Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={runWhatIfSim}
              disabled={whatIfRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: whatIfRunning ? "var(--bg-elevated)" : "var(--accent)",
                color: whatIfRunning ? "var(--text-muted)" : "white",
              }}
            >
              {whatIfRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
              {whatIfRunning ? "Comparando..." : `Comparar: ${selectedWhatIf.name}`}
            </button>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Parâmetros alterados: {Object.keys(selectedWhatIf.paramOverrides).map((k) => {
                const param = whatIfParameters.find((p) => p.id === k);
                return param ? `${param.name}: ${selectedWhatIf.paramOverrides[k]}${param.unit}` : k;
              }).join(", ")}
            </p>
          </div>

          {/* Comparison Results */}
          {baselineResult && modifiedResult && (
            <div className="space-y-4">
              {/* Comparison KPIs */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Comparação: Baseline vs {selectedWhatIf.name}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Nível Máximo", base: `${baselineResult.peakLevel}m`, mod: `${modifiedResult.peakLevel}m`, diff: ((modifiedResult.peakLevel - baselineResult.peakLevel) / baselineResult.peakLevel * 100) },
                    { label: "Área Inundada", base: `${baselineResult.floodedArea}km²`, mod: `${modifiedResult.floodedArea}km²`, diff: baselineResult.floodedArea > 0 ? ((modifiedResult.floodedArea - baselineResult.floodedArea) / baselineResult.floodedArea * 100) : 0 },
                    { label: "Duração Cheia", base: `${baselineResult.floodDuration}h`, mod: `${modifiedResult.floodDuration}h`, diff: baselineResult.floodDuration > 0 ? ((modifiedResult.floodDuration - baselineResult.floodDuration) / baselineResult.floodDuration * 100) : 0 },
                    { label: "Profund. Máx.", base: `${baselineResult.maxDepth}m`, mod: `${modifiedResult.maxDepth}m`, diff: baselineResult.maxDepth > 0 ? ((modifiedResult.maxDepth - baselineResult.maxDepth) / baselineResult.maxDepth * 100) : 0 },
                  ].map(({ label, base, mod, diff }) => (
                    <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{base}</span>
                        <ArrowRight className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{mod}</span>
                      </div>
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: diff < 0 ? "#22c55e" : diff > 0 ? "#ef4444" : "var(--text-muted)" }}
                      >
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Comparação de Hidrogramas
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      type="number"
                      domain={[0, Math.max(baselineResult.timeSteps.length, modifiedResult.timeSteps.length) - 1]}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="5 5" />
                    <Line data={baselineResult.timeSteps} type="monotone" dataKey="riverLevel" stroke="#ef4444" strokeWidth={2} dot={false} name="Baseline" />
                    <Line data={modifiedResult.timeSteps} type="monotone" dataKey="riverLevel" stroke="#22c55e" strokeWidth={2} dot={false} name={selectedWhatIf.name} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Social Impact Comparison */}
              {(() => {
                const baseSocial = calculateSocialImpact(baselineResult, 0);
                const modEvac = selectedWhatIf.paramOverrides.p8 || 0;
                const modSocial = calculateSocialImpact(modifiedResult, modEvac);
                const baseEcon = calculateEconomicImpact(baselineResult, baseSocial);
                const modEcon = calculateEconomicImpact(modifiedResult, modSocial);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                        Redução de Impacto Social
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: "População afetada", base: baseSocial.populationAffected, mod: modSocial.populationAffected },
                          { label: "Domicílios deslocados", base: baseSocial.householdsDisplaced, mod: modSocial.householdsDisplaced },
                          { label: "Pop. vulnerável", base: baseSocial.vulnerablePopulation, mod: modSocial.vulnerablePopulation },
                        ].map(({ label, base, mod }) => {
                          const reduction = base > 0 ? ((base - mod) / base * 100) : 0;
                          return (
                            <div key={label} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatNumber(base)}</span>
                                <ArrowRight className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                                <span className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{formatNumber(mod)}</span>
                                {reduction > 0 && (
                                  <span className="text-[10px] font-bold flex items-center" style={{ color: "#22c55e" }}>
                                    <TrendingDown className="h-3 w-3" />
                                    {reduction.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                        Redução de Impacto Econômico
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Custo Total</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatCurrency(baseEcon.totalCost)}</span>
                            <ArrowRight className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                            <span className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{formatCurrency(modEcon.totalCost)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Economia</span>
                          <span className="text-[11px] font-bold" style={{ color: "#22c55e" }}>
                            {formatCurrency(Math.max(0, baseEcon.totalCost - modEcon.totalCost))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Tempo de Recuperação</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{baseEcon.recoveryMonths}m</span>
                            <ArrowRight className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                            <span className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{modEcon.recoveryMonths}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
