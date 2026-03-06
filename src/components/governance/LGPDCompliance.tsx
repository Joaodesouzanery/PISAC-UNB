"use client";

import { lgpdRecords, complianceMetrics } from "@/data/governance-data";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  User,
  Database,
  Fingerprint,
  Scale,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  compliant: { label: "Conforme", color: "bg-success-100 text-success-700", icon: CheckCircle },
  partial: { label: "Parcial", color: "bg-warning-100 text-warning-700", icon: AlertTriangle },
  non_compliant: { label: "Não Conforme", color: "bg-danger-100 text-danger-700", icon: AlertTriangle },
  under_review: { label: "Em Revisão", color: "bg-blue-100 text-blue-700", icon: Clock },
};

const classificationConfig: Record<string, { label: string; color: string }> = {
  public: { label: "Público", color: "bg-green-100 text-green-700" },
  internal: { label: "Interno", color: "bg-blue-100 text-blue-700" },
  confidential: { label: "Confidencial", color: "bg-orange-100 text-orange-700" },
  restricted: { label: "Restrito", color: "bg-red-100 text-red-700" },
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

export default function LGPDCompliance() {
  const compliantCount = lgpdRecords.filter((r) => r.status === "compliant").length;
  const partialCount = lgpdRecords.filter((r) => r.status === "partial").length;
  const underReviewCount = lgpdRecords.filter((r) => r.status === "under_review").length;
  const anonymizedCount = lgpdRecords.filter((r) => r.anonymized).length;
  const dpiaCount = lgpdRecords.filter((r) => r.dpia).length;

  const compliancePieData = [
    { name: "Conforme", value: compliantCount },
    { name: "Parcial", value: partialCount },
    { name: "Não Conforme", value: lgpdRecords.filter((r) => r.status === "non_compliant").length },
    { name: "Em Revisão", value: underReviewCount },
  ].filter((d) => d.value > 0);

  const frameworkData = complianceMetrics.map((m) => ({
    name: m.category.split(" - ")[0],
    conforme: m.compliant,
    parcial: m.partial,
    naoConforme: m.nonCompliant,
  }));

  return (
    <div className="space-y-6">
      {/* LGPD Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Conformes
          </p>
          <p className="text-xl font-bold text-success-600">{compliantCount}/{lgpdRecords.length}</p>
          <p className="text-[10px] text-gray-400">
            {((compliantCount / lgpdRecords.length) * 100).toFixed(0)}% do total
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Parciais
          </p>
          <p className="text-xl font-bold text-warning-600">{partialCount}</p>
          <p className="text-[10px] text-gray-400">requerem adequação</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Fingerprint className="h-3 w-3" /> Anonimizados
          </p>
          <p className="text-xl font-bold text-primary-600">{anonymizedCount}</p>
          <p className="text-[10px] text-gray-400">datasets com proteção</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-purple-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Scale className="h-3 w-3" /> DPIA Realizados
          </p>
          <p className="text-xl font-bold text-purple-600">{dpiaCount}</p>
          <p className="text-[10px] text-gray-400">avaliações de impacto</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-cyan-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <User className="h-3 w-3" /> DPO
          </p>
          <p className="text-sm font-bold text-gray-900">Maria Helena Souza</p>
          <p className="text-[10px] text-gray-400">Encarregada de Dados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary-600" />
            Status de Conformidade LGPD
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={compliancePieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {compliancePieData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Framework Compliance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary-600" />
            Conformidade por Framework
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={frameworkData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="conforme" fill="#22c55e" name="Conforme" stackId="stack" />
              <Bar dataKey="parcial" fill="#f59e0b" name="Parcial" stackId="stack" />
              <Bar dataKey="naoConforme" fill="#ef4444" name="Não Conforme" stackId="stack" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LGPD Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-primary-600" />
          Mapeamento de Dados Pessoais (ROPA)
        </h3>

        <div className="space-y-3">
          {lgpdRecords.map((record) => {
            const status = statusConfig[record.status];
            const StatusIcon = status.icon;
            const classification = classificationConfig[record.classification];

            return (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-bold text-gray-900">{record.category}</h4>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5", status.color)}>
                        <StatusIcon className="h-2.5 w-2.5" />
                        {status.label}
                      </span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", classification.color)}>
                        {classification.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{record.dataType}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {record.anonymized && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium flex items-center gap-0.5">
                        <Fingerprint className="h-2.5 w-2.5" /> Anonimizado
                      </span>
                    )}
                    {record.dpia && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium flex items-center gap-0.5">
                        <Scale className="h-2.5 w-2.5" /> DPIA
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] mt-3 bg-gray-50 rounded-lg p-2">
                  <div>
                    <p className="text-gray-500">Finalidade</p>
                    <p className="font-medium text-gray-800">{record.purpose}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Base Legal</p>
                    <p className="font-medium text-gray-800">{record.legalBasis}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Retenção</p>
                    <p className="font-medium text-gray-800">{record.retentionPeriod}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Última Auditoria</p>
                    <p className="font-medium text-gray-800">{record.lastAudit}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LGPD Rights */}
      <div className="bg-primary-50 rounded-lg border border-primary-200 p-4">
        <h3 className="text-sm font-bold text-primary-900 mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Direitos do Titular (Art. 18, LGPD)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-primary-800">
          <div className="bg-white/60 rounded-lg p-3">
            <p className="font-bold mb-1">Confirmação e Acesso</p>
            <p>Canal de atendimento via Gov.br para confirmação de tratamento e acesso aos dados pessoais.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="font-bold mb-1">Correção e Eliminação</p>
            <p>Procedimento implementado para correção de dados incompletos e eliminação de dados desnecessários.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="font-bold mb-1">Portabilidade</p>
            <p>Exportação de dados em formatos abertos (JSON, CSV) conforme padrões e-PING.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
