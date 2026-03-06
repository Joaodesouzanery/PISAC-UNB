"use client";

import { useState, useMemo } from "react";
import {
  budgetCategories,
  mitigationInvestments,
  financialImpacts,
  riskScenarios,
  budgetExecutionTimeline,
} from "@/data/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  Shield,
  ArrowUpRight,
  PiggyBank,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Brain,
  Calendar,
  Target,
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  ReferenceLine,
} from "recharts";

const PIE_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

type BudgetView = "overview" | "investments" | "impact" | "predictive";

export default function BudgetModule() {
  const [view, setView] = useState<BudgetView>("overview");
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionReady, setPredictionReady] = useState(false);

  const totalAllocated = budgetCategories.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetCategories.reduce((s, b) => s + b.spent, 0);
  const totalCommitted = budgetCategories.reduce((s, b) => s + b.committed, 0);
  const totalAvailable = totalAllocated - totalSpent - totalCommitted;

  const pieData = budgetCategories.map((bc) => ({ name: bc.name, value: bc.allocated }));
  const totalInvestmentCost = mitigationInvestments.reduce((s, i) => s + i.estimatedCost, 0);

  const impactComparison = financialImpacts.map((fi) => {
    const scenario = riskScenarios.find((rs) => rs.id === fi.scenarioId);
    const relatedInvestments = mitigationInvestments.filter((mi) => mi.relatedScenarios.includes(fi.scenarioId));
    const mitigationCost = relatedInvestments.reduce((s, mi) => s + mi.estimatedCost, 0);
    const avgRiskReduction = relatedInvestments.length > 0
      ? relatedInvestments.reduce((s, mi) => s + mi.expectedRiskReduction, 0) / relatedInvestments.length
      : 0;
    const mitigatedCost = (fi.directCost + fi.indirectCost) * (1 - avgRiskReduction / 100);

    return {
      name: scenario?.name.substring(0, 25) || fi.scenarioId,
      custoSemMitigacao: (fi.directCost + fi.indirectCost) / 1000000,
      custoComMitigacao: mitigatedCost / 1000000,
      investimento: mitigationCost / 1000000,
      economia: (fi.directCost + fi.indirectCost - mitigatedCost) / 1000000,
    };
  });

  // Predictive maintenance cost data (simulated AI/ML output)
  const predictiveData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return months.map((m, i) => ({
      month: m,
      manutencaoReal: Math.round((8 + Math.sin(i * 0.5) * 3 + Math.random() * 2) * 100) / 100,
      manutencaoPrevista: Math.round((8 + Math.sin(i * 0.5) * 3 + i * 0.3) * 100) / 100,
      desastrePrevisto: Math.round(Math.max(0, (Math.sin((i - 2) * 0.8) * 15 + 5 + i * 0.5)) * 100) / 100,
      roiAcumulado: Math.round((1 + i * 0.25) * 100) / 100,
    }));
  }, []);

  const runPrediction = () => {
    setIsPredicting(true);
    setTimeout(() => { setIsPredicting(false); setPredictionReady(true); }, 1500);
  };

  const tabs = [
    { key: "overview" as const, label: "Visão Geral", icon: Wallet },
    { key: "investments" as const, label: "Investimentos", icon: Shield },
    { key: "impact" as const, label: "Impacto", icon: BarChart3 },
    { key: "predictive" as const, label: "Previsão IA", icon: Brain },
  ];

  return (
    <div className="space-y-4">
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

      {/* ========== OVERVIEW ========== */}
      {view === "overview" && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Orçamento Total", value: formatCurrency(totalAllocated), sub: "Exercício 2026", color: "#3b82f6" },
              { label: "Executado", value: formatCurrency(totalSpent), sub: `${((totalSpent / totalAllocated) * 100).toFixed(1)}% do total`, color: "#22c55e" },
              { label: "Empenhado", value: formatCurrency(totalCommitted), sub: `${((totalCommitted / totalAllocated) * 100).toFixed(1)}% do total`, color: "#f59e0b" },
              { label: "Disponível", value: formatCurrency(totalAvailable), sub: `${((totalAvailable / totalAllocated) * 100).toFixed(1)}% do total`, color: "#f97316" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", borderLeft: `3px solid ${color}`, border: "1px solid var(--border-primary)" }}>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Execution Timeline */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                Execução Orçamentária Acumulada (%)
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={budgetExecutionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="planned" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={1} name="Planejado" />
                  <Line type="monotone" dataKey="executed" stroke="#f97316" strokeWidth={2} name="Executado" dot={{ r: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Pie */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <PiggyBank className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                Distribuição por Categoria
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value"
                    label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Table */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Detalhamento por Categoria
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {["Categoria", "Alocado", "Executado", "Empenhado", "Disponível", "Execução"].map((h) => (
                      <th key={h} className={`py-2 px-3 font-medium ${h === "Categoria" ? "text-left" : "text-right"}`} style={{ color: "var(--text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budgetCategories.map((bc) => (
                    <tr key={bc.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td className="py-2 px-3 font-medium" style={{ color: "var(--text-primary)" }}>{bc.name}</td>
                      <td className="py-2 px-3 text-right" style={{ color: "var(--text-secondary)" }}>{formatCurrency(bc.allocated)}</td>
                      <td className="py-2 px-3 text-right font-medium" style={{ color: "#22c55e" }}>{formatCurrency(bc.spent)}</td>
                      <td className="py-2 px-3 text-right" style={{ color: "#f59e0b" }}>{formatCurrency(bc.committed)}</td>
                      <td className="py-2 px-3 text-right" style={{ color: "#3b82f6" }}>{formatCurrency(bc.allocated - bc.spent - bc.committed)}</td>
                      <td className="py-2 px-3">
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: `${(bc.spent / bc.allocated) * 100}%`, backgroundColor: "var(--accent)" }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--border-primary)" }}>
                    <td className="py-2 px-3 font-bold" style={{ color: "var(--text-primary)" }}>TOTAL</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: "var(--text-primary)" }}>{formatCurrency(totalAllocated)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: "#22c55e" }}>{formatCurrency(totalSpent)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: "#f59e0b" }}>{formatCurrency(totalCommitted)}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: "#3b82f6" }}>{formatCurrency(totalAvailable)}</td>
                    <td className="py-2 px-3">
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                        <div className="h-full rounded-full" style={{ width: `${(totalSpent / totalAllocated) * 100}%`, backgroundColor: "var(--accent)" }} />
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========== INVESTMENTS ========== */}
      {view === "investments" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Propostos", value: mitigationInvestments.filter((i) => i.status === "proposed").length, icon: FileText, color: "var(--text-muted)" },
              { label: "Aprovados", value: mitigationInvestments.filter((i) => i.status === "approved").length, icon: CheckCircle, color: "#3b82f6" },
              { label: "Em Execução", value: mitigationInvestments.filter((i) => i.status === "in_progress").length, icon: Clock, color: "#f59e0b" },
              { label: "Investimento Total", value: formatCurrency(totalInvestmentCost), icon: Wallet, color: "var(--accent)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="h-3 w-3" style={{ color }} />
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</span>
                </div>
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {mitigationInvestments.sort((a, b) => {
              const po = { critical: 0, high: 1, medium: 2, low: 3 };
              return po[a.priority] - po[b.priority];
            }).map((inv) => (
              <div key={inv.id} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{inv.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{inv.description}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                      backgroundColor: inv.priority === "critical" ? "rgba(239,68,68,0.15)" : inv.priority === "high" ? "rgba(249,115,22,0.15)" : "rgba(245,158,11,0.15)",
                      color: inv.priority === "critical" ? "#ef4444" : inv.priority === "high" ? "#f97316" : "#f59e0b",
                    }}>{inv.priority.toUpperCase()}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>{inv.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Custo", value: formatCurrency(inv.estimatedCost), color: "var(--text-primary)" },
                    { label: "Redução Risco", value: `${inv.expectedRiskReduction}%`, color: "#22c55e" },
                    { label: "ROI", value: `${inv.roi}x`, color: "#3b82f6" },
                    { label: "Cenários", value: inv.relatedScenarios.length.toString(), color: "var(--text-primary)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg p-2 text-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="text-xs font-bold" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== IMPACT ========== */}
      {view === "impact" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                Custo: Sem vs Com Mitigação (R$ Mi)
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={impactComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} angle={-15} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`R$ ${v.toFixed(0)}M`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="custoSemMitigacao" fill="#ef4444" name="Sem Mitigação" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="custoComMitigacao" fill="#22c55e" name="Com Mitigação" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                ROI por Investimento
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mitigationInvestments.map((i) => ({ name: i.name.substring(0, 18), roi: i.roi, reducao: i.expectedRiskReduction }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} angle={-15} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="left" dataKey="roi" fill="#3b82f6" name="ROI (x)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="reducao" fill="#22c55e" name="Red. Risco (%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Custo Total Potencial", value: formatCurrency(financialImpacts.reduce((s, fi) => s + fi.directCost + fi.indirectCost, 0)), sub: "sem mitigação", color: "#ef4444" },
              { label: "Investimento em Mitigação", value: formatCurrency(totalInvestmentCost), sub: `${mitigationInvestments.length} projetos`, color: "#22c55e" },
              { label: "Economia Estimada", value: formatCurrency(impactComparison.reduce((s, ic) => s + ic.economia * 1000000, 0)), sub: "com investimentos", color: "#3b82f6" },
              { label: "ROI Médio", value: `${(mitigationInvestments.reduce((s, i) => s + i.roi, 0) / mitigationInvestments.length).toFixed(1)}x`, sub: "retorno por R$ investido", color: "#f97316" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== PREDICTIVE ========== */}
      {view === "predictive" && (
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Modelagem Financeira Preditiva</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Previsão de custos de manutenção, impacto de desastres e ROI usando modelos de IA/ML
                </p>
              </div>
              <button
                onClick={runPrediction}
                disabled={isPredicting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: isPredicting ? "var(--bg-elevated)" : "var(--accent)", color: isPredicting ? "var(--text-muted)" : "white" }}
              >
                {isPredicting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                {isPredicting ? "Processando modelo..." : "Executar Previsão"}
              </button>
            </div>

            {/* Integration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { name: "SIAFI / SICONV", desc: "Sistema Integrado de Administração Financeira", status: "Integrado" },
                { name: "Portal da Transparência", desc: "Dados de execução orçamentária em tempo real", status: "Conectado" },
                { name: "e-SFINGE (TCU)", desc: "Sistema de Fiscalização de Gestão", status: "Configurado" },
              ].map((sys) => (
                <div key={sys.name} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#22c55e" }} />
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>{sys.name}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{sys.desc}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-medium" style={{ color: "#22c55e" }}>{sys.status}</span>
                </div>
              ))}
            </div>
          </div>

          {predictionReady && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Maintenance Cost Prediction */}
                <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                    Previsão de Custos de Manutenção (R$ Mi)
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={predictiveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="manutencaoReal" fill="#3b82f6" name="Real" radius={[4, 4, 0, 0]} fillOpacity={0.6} />
                      <Line type="monotone" dataKey="manutencaoPrevista" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" name="Previsto (IA)" dot={{ r: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Disaster Financial Impact */}
                <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                    Impacto Financeiro Previsto de Desastres (R$ Mi)
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={predictiveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="desastrePrevisto" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Custo previsto" />
                      <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Limite orçamentário", fill: "#f59e0b", fontSize: 9 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ROI Projection */}
              <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Projeção de ROI Acumulado dos Investimentos em Resiliência
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={predictiveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 }} />
                    <ReferenceLine y={1} stroke="var(--border-subtle)" label={{ value: "Break-even", fill: "var(--text-muted)", fontSize: 9 }} />
                    <Line type="monotone" dataKey="roiAcumulado" stroke="#22c55e" strokeWidth={2} name="ROI acumulado (x)" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <p className="text-[10px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>Insights do Modelo Preditivo:</p>
                  <ul className="space-y-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <li>• Custos de manutenção tendem a aumentar 12% nos próximos 6 meses (sazonalidade + desgaste)</li>
                    <li>• Break-even dos investimentos em resiliência previsto para o mês 4 (Abril/2026)</li>
                    <li>• Risco financeiro de desastres concentrado entre Nov-Mar (período chuvoso)</li>
                    <li>• Recomendação: antecipar R$ 15M em obras de drenagem antes de outubro</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {!predictionReady && !isPredicting && (
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <Brain className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--border-subtle)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Execute o modelo preditivo para gerar projeções financeiras</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>Utiliza dados históricos de execução, sensores e previsão climática</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
