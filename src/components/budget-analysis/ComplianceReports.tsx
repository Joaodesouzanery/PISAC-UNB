"use client";

import { useState, useMemo } from "react";
import { investmentPlans, costBenefitAnalyses } from "@/data/budget-analysis-data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Download,
  Send,
  RefreshCw,
  BarChart3,
  Loader2,
  ExternalLink,
  Scale,
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

interface ComplianceCheck {
  id: string;
  requirement: string;
  category: "fiscal" | "transparency" | "procurement" | "accountability" | "environmental";
  status: "compliant" | "partial" | "non_compliant" | "pending_review";
  tribunal: "TCU" | "TCE" | "CGU" | "MP";
  lastChecked: string;
  details: string;
  regulation: string;
}

interface AuditSubmission {
  id: string;
  title: string;
  tribunal: string;
  system: string;
  deadline: string;
  status: "submitted" | "pending" | "overdue" | "approved";
  completeness: number;
}

const statusIcons = {
  compliant: CheckCircle,
  partial: AlertTriangle,
  non_compliant: XCircle,
  pending_review: Clock,
};

const statusLabels: Record<string, { label: string; color: string }> = {
  compliant: { label: "Conforme", color: "#22c55e" },
  partial: { label: "Parcial", color: "#f59e0b" },
  non_compliant: { label: "Não Conforme", color: "#ef4444" },
  pending_review: { label: "Em Revisão", color: "#6b7280" },
};

const submissionStatusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: "Enviado", color: "#3b82f6" },
  pending: { label: "Pendente", color: "#f59e0b" },
  overdue: { label: "Atrasado", color: "#ef4444" },
  approved: { label: "Aprovado", color: "#22c55e" },
};

const CATEGORY_LABELS: Record<string, string> = {
  fiscal: "Responsabilidade Fiscal",
  transparency: "Transparência",
  procurement: "Licitações e Contratos",
  accountability: "Prestação de Contas",
  environmental: "Licenciamento Ambiental",
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#6b7280"];

export default function ComplianceReports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const complianceChecks: ComplianceCheck[] = useMemo(() => [
    {
      id: "cc1", requirement: "Lei de Responsabilidade Fiscal (LRF) - Art. 48",
      category: "fiscal", status: "compliant", tribunal: "TCU",
      lastChecked: "2026-03-01", regulation: "LC 101/2000",
      details: "Publicação tempestiva do RREO e RGF. Transparência fiscal ativa em todos os portais obrigatórios.",
    },
    {
      id: "cc2", requirement: "Portal da Transparência - Atualização em tempo real",
      category: "transparency", status: "compliant", tribunal: "CGU",
      lastChecked: "2026-03-05", regulation: "Lei 12.527/2011 (LAI)",
      details: "Dados de execução orçamentária atualizados diariamente. Portal acessível e em conformidade com LAI.",
    },
    {
      id: "cc3", requirement: "Prestação de Contas Anual - Exercício 2025",
      category: "accountability", status: "partial", tribunal: "TCE",
      lastChecked: "2026-02-28", regulation: "CF Art. 70-75",
      details: "Documentação do exercício 2025 em fase de consolidação. 85% dos anexos entregues. Pendente: Balanço Patrimonial consolidado.",
    },
    {
      id: "cc4", requirement: "Licitações - Pregão Eletrônico (Lei 14.133/2021)",
      category: "procurement", status: "compliant", tribunal: "TCU",
      lastChecked: "2026-03-03", regulation: "Lei 14.133/2021",
      details: "Todos os processos licitatórios realizados por pregão eletrônico via ComprasNet. Atas publicadas no DOU.",
    },
    {
      id: "cc5", requirement: "Licenciamento Ambiental - Obras de Infraestrutura",
      category: "environmental", status: "non_compliant", tribunal: "MP",
      lastChecked: "2026-02-20", regulation: "Res. CONAMA 237/97",
      details: "Pendente renovação de licença ambiental para 2 obras de contenção de encostas. Prazo expirado em 15/02/2026.",
    },
    {
      id: "cc6", requirement: "SIAFI - Conformidade Contábil Mensal",
      category: "fiscal", status: "compliant", tribunal: "TCU",
      lastChecked: "2026-03-04", regulation: "IN STN 06/2018",
      details: "Registros contábeis do SIAFI atualizados. Conformidade contábil atestada para fev/2026.",
    },
    {
      id: "cc7", requirement: "SICONV/Plataforma+Brasil - Convênios Federais",
      category: "accountability", status: "partial", tribunal: "CGU",
      lastChecked: "2026-03-02", regulation: "Decreto 6.170/2007",
      details: "3 convênios ativos com prestação de contas em dia. 1 convênio com pendência de documentação complementar.",
    },
    {
      id: "cc8", requirement: "e-SFINGE - Envio ao TCE",
      category: "accountability", status: "pending_review", tribunal: "TCE",
      lastChecked: "2026-03-01", regulation: "Resolução TCE 16/2014",
      details: "Dados do bimestre 1/2026 enviados via e-SFINGE. Aguardando análise técnica do tribunal.",
    },
  ], []);

  const auditSubmissions: AuditSubmission[] = useMemo(() => [
    { id: "as1", title: "RREO - 6º Bimestre 2025", tribunal: "TCU", system: "SIAFI", deadline: "2026-01-30", status: "approved", completeness: 100 },
    { id: "as2", title: "RGF - 3º Quadrimestre 2025", tribunal: "TCE", system: "e-SFINGE", deadline: "2026-01-30", status: "approved", completeness: 100 },
    { id: "as3", title: "Prestação de Contas Anual 2025", tribunal: "TCE", system: "e-SFINGE", deadline: "2026-03-31", status: "pending", completeness: 85 },
    { id: "as4", title: "RREO - 1º Bimestre 2026", tribunal: "TCU", system: "SIAFI", deadline: "2026-03-30", status: "pending", completeness: 72 },
    { id: "as5", title: "Relatório de Convênios Federais", tribunal: "CGU", system: "Plataforma+Brasil", deadline: "2026-02-28", status: "overdue", completeness: 60 },
    { id: "as6", title: "Parecer Prévio - Contas 2024", tribunal: "TCE", system: "e-SFINGE", deadline: "2025-12-15", status: "approved", completeness: 100 },
  ], []);

  const filteredChecks = selectedCategory === "all"
    ? complianceChecks
    : complianceChecks.filter((c) => c.category === selectedCategory);

  const complianceSummary = useMemo(() => {
    const total = complianceChecks.length;
    const compliant = complianceChecks.filter((c) => c.status === "compliant").length;
    const partial = complianceChecks.filter((c) => c.status === "partial").length;
    const nonCompliant = complianceChecks.filter((c) => c.status === "non_compliant").length;
    const pending = complianceChecks.filter((c) => c.status === "pending_review").length;
    return { total, compliant, partial, nonCompliant, pending, score: Math.round(((compliant + partial * 0.5) / total) * 100) };
  }, [complianceChecks]);

  const pieData = [
    { name: "Conforme", value: complianceSummary.compliant },
    { name: "Parcial", value: complianceSummary.partial },
    { name: "Não Conforme", value: complianceSummary.nonCompliant },
    { name: "Em Revisão", value: complianceSummary.pending },
  ];

  const byTribunal = useMemo(() => {
    const map: Record<string, { compliant: number; partial: number; nonCompliant: number }> = {};
    complianceChecks.forEach((c) => {
      if (!map[c.tribunal]) map[c.tribunal] = { compliant: 0, partial: 0, nonCompliant: 0 };
      if (c.status === "compliant") map[c.tribunal].compliant++;
      else if (c.status === "partial") map[c.tribunal].partial++;
      else if (c.status === "non_compliant") map[c.tribunal].nonCompliant++;
    });
    return Object.entries(map).map(([tribunal, counts]) => ({ tribunal, ...counts }));
  }, [complianceChecks]);

  const generateComplianceReport = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2500);
  };

  const cardStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" };
  const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 11 };

  return (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Score Geral", value: `${complianceSummary.score}%`, accent: complianceSummary.score >= 80 ? "#22c55e" : complianceSummary.score >= 60 ? "#f59e0b" : "#ef4444" },
          { label: "Conforme", value: String(complianceSummary.compliant), accent: "#22c55e" },
          { label: "Parcial", value: String(complianceSummary.partial), accent: "#f59e0b" },
          { label: "Não Conforme", value: String(complianceSummary.nonCompliant), accent: "#ef4444" },
          { label: "Em Revisão", value: String(complianceSummary.pending), accent: "#6b7280" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl p-4" style={{ ...cardStyle, borderLeft: `3px solid ${accent}` }}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-bold" style={{ color: accent }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Pie */}
        <div className="rounded-xl p-4" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Shield className="h-4 w-4" style={{ color: "var(--accent)" }} />
            Status de Conformidade
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Tribunal Chart */}
        <div className="lg:col-span-2 rounded-xl p-4" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Scale className="h-4 w-4" style={{ color: "var(--accent)" }} />
            Conformidade por Tribunal
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byTribunal}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="tribunal" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="compliant" fill="#22c55e" name="Conforme" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="partial" fill="#f59e0b" name="Parcial" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="nonCompliant" fill="#ef4444" name="Não Conforme" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generate Compliance Report */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
              <FileText className="h-4 w-4" />
              Gerar Relatório de Conformidade Automatizado
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Compila automaticamente dados de SIAFI, SICONV, e-SFINGE e Portal da Transparência
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateComplianceReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--accent)", color: "#fff", cursor: isGenerating ? "not-allowed" : "pointer", opacity: isGenerating ? 0.7 : 1 }}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isGenerating ? "Gerando..." : "Gerar Relatório TCU/TCE"}
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Filtrar por categoria:</span>
        {[{ key: "all", label: "Todas" }, ...Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label }))].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: selectedCategory === key ? "var(--accent-muted)" : "var(--bg-card)",
              color: selectedCategory === key ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${selectedCategory === key ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Compliance Checks */}
      <div className="space-y-3">
        {filteredChecks.map((check) => {
          const st = statusLabels[check.status];
          const Icon = statusIcons[check.status];
          return (
            <div key={check.id} className="rounded-xl p-4" style={cardStyle}>
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: st.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{check.requirement}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${st.color}20`, color: st.color }}>
                      {st.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      {check.tribunal}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      {CATEGORY_LABELS[check.category]}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{check.details}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {check.regulation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Verificado: {check.lastChecked}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Submissions Timeline */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Send className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Envios e Prazos dos Tribunais
        </h3>
        <div className="space-y-3">
          {auditSubmissions.map((sub) => {
            const st = submissionStatusLabels[sub.status];
            const isOverdue = sub.status === "overdue";
            return (
              <div key={sub.id} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: isOverdue ? "1px solid #ef4444" : undefined }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{sub.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${st.color}20`, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span>{sub.tribunal}</span>
                    <span>Sistema: {sub.system}</span>
                    <span className={isOverdue ? "text-danger-600 font-bold" : ""}>
                      Prazo: {sub.deadline}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: sub.completeness === 100 ? "#22c55e" : sub.completeness >= 70 ? "#f59e0b" : "#ef4444" }}>
                    {sub.completeness}%
                  </p>
                  <div className="w-24 h-1.5 rounded-full mt-1" style={{ backgroundColor: "var(--border-subtle)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sub.completeness}%`,
                        backgroundColor: sub.completeness === 100 ? "#22c55e" : sub.completeness >= 70 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Systems */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <ExternalLink className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Sistemas Integrados de Prestação de Contas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "SIAFI", desc: "Sistema Integrado de Administração Financeira", status: "Conectado", connected: true },
            { name: "SICONV / Plataforma+Brasil", desc: "Gestão de Convênios e Contratos de Repasse", status: "Conectado", connected: true },
            { name: "e-SFINGE", desc: "Sistema de Fiscalização Integrada de Gestão", status: "Conectado", connected: true },
            { name: "Portal da Transparência", desc: "Controladoria-Geral da União", status: "Sincronizado", connected: true },
          ].map((sys) => (
            <div key={sys.name} className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sys.connected ? "#22c55e" : "#ef4444" }} />
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{sys.name}</span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sys.desc}</p>
              <p className="text-[10px] mt-1 font-medium" style={{ color: "#22c55e" }}>{sys.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
