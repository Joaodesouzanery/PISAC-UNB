"use client";

import { microserviceNodes } from "@/data/governance-data";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Globe,
  Shield,
  Database,
  Layers,
  Cloud,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const tierConfig: Record<string, { label: string; icon: typeof Globe; color: string; bg: string }> = {
  frontend: { label: "Frontend", icon: Globe, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  api_gateway: { label: "API Gateway", icon: Shield, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  service: { label: "Serviços", icon: Layers, color: "text-green-700", bg: "bg-green-50 border-green-200" },
  data: { label: "Dados", icon: Database, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  infrastructure: { label: "Infraestrutura", icon: Server, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
};

const statusColors: Record<string, { label: string; color: string }> = {
  running: { label: "Rodando", color: "bg-success-500" },
  degraded: { label: "Degradado", color: "bg-warning-500" },
  offline: { label: "Offline", color: "bg-danger-500" },
  maintenance: { label: "Manutenção", color: "bg-blue-500" },
};

export default function ArchitectureView() {
  const totalInstances = microserviceNodes.reduce((s, n) => s + n.instances, 0);
  const totalRequests = microserviceNodes.reduce((s, n) => s + n.requestsPerMin, 0);
  const avgCpu = Math.round(microserviceNodes.reduce((s, n) => s + n.cpu, 0) / microserviceNodes.length);
  const avgMemory = Math.round(microserviceNodes.reduce((s, n) => s + n.memory, 0) / microserviceNodes.length);
  const runningNodes = microserviceNodes.filter((n) => n.status === "running").length;

  const resourceData = microserviceNodes
    .filter((n) => n.tier === "service")
    .map((n) => ({
      name: n.name.substring(0, 15),
      cpu: n.cpu,
      memoria: n.memory,
      erros: n.errorRate * 100,
    }));

  const tiers = ["frontend", "api_gateway", "service", "data", "infrastructure"] as const;

  const healthRadar = microserviceNodes.slice(0, 6).map((n) => ({
    subject: n.name.substring(0, 12),
    disponibilidade: 100 - n.errorRate * 100,
    cpu: 100 - n.cpu,
    memoria: 100 - n.memory,
  }));

  return (
    <div className="space-y-6">
      {/* Infrastructure Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Server className="h-3 w-3" /> Microsserviços
          </p>
          <p className="text-xl font-bold text-gray-900">{microserviceNodes.length}</p>
          <p className="text-[10px] text-gray-400">{runningNodes} rodando</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Cloud className="h-3 w-3" /> Instâncias
          </p>
          <p className="text-xl font-bold text-success-600">{totalInstances}</p>
          <p className="text-[10px] text-gray-400">containers ativos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Zap className="h-3 w-3" /> Requisições/min
          </p>
          <p className="text-xl font-bold text-warning-600">{totalRequests.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-gray-400">throughput total</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-cyan-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Cpu className="h-3 w-3" /> CPU Média
          </p>
          <p className="text-xl font-bold text-cyan-600">{avgCpu}%</p>
          <p className="text-[10px] text-gray-400">uso do cluster</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-purple-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <HardDrive className="h-3 w-3" /> Memória Média
          </p>
          <p className="text-xl font-bold text-purple-600">{avgMemory}%</p>
          <p className="text-[10px] text-gray-400">uso do cluster</p>
        </div>
      </div>

      {/* Architecture Diagram - Tiered View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary-600" />
          Arquitetura de Microsserviços
        </h3>

        <div className="space-y-4">
          {tiers.map((tier, tierIndex) => {
            const config = tierConfig[tier];
            const Icon = config.icon;
            const nodes = microserviceNodes.filter((n) => n.tier === tier);

            return (
              <div key={tier}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-1 rounded", `bg-${tier === "frontend" ? "blue" : tier === "api_gateway" ? "purple" : tier === "service" ? "green" : tier === "data" ? "orange" : "gray"}-100`)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <h4 className={cn("text-xs font-bold", config.color)}>{config.label}</h4>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                  {nodes.map((node) => {
                    const statusInfo = statusColors[node.status];

                    return (
                      <div key={node.id} className={cn("rounded-lg border-2 p-3", config.bg)}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
                            <span className="text-xs font-bold text-gray-900">{node.name}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-mono">
                            x{node.instances}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 mb-2 leading-relaxed">{node.description}</p>
                        <p className="text-[9px] font-mono text-gray-500 mb-2">{node.technology}</p>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <ProgressBar
                              value={node.cpu}
                              label="CPU"
                              size="sm"
                              color={node.cpu > 70 ? "danger" : node.cpu > 50 ? "warning" : "success"}
                              showPercentage
                            />
                          </div>
                          <div>
                            <ProgressBar
                              value={node.memory}
                              label="Mem"
                              size="sm"
                              color={node.memory > 70 ? "danger" : node.memory > 50 ? "warning" : "success"}
                              showPercentage
                            />
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-[9px] text-gray-500">
                          <span>{node.requestsPerMin.toLocaleString("pt-BR")} req/min</span>
                          <span className={cn(node.errorRate > 0.05 ? "text-danger-600 font-bold" : "text-gray-500")}>
                            Erros: {(node.errorRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {tierIndex < tiers.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="flex flex-col items-center text-gray-300">
                      <div className="w-px h-4 bg-gray-300" />
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Uso de Recursos por Serviço
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="cpu" fill="#3b82f6" name="CPU (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="memoria" fill="#8b5cf6" name="Memória (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Radar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Saúde dos Serviços
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={healthRadar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
              <Radar name="Disponibilidade" dataKey="disponibilidade" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
              <Radar name="CPU Livre" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Memória Livre" dataKey="memoria" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Architecture Principles */}
      <div className="bg-primary-50 rounded-lg border border-primary-200 p-4">
        <h3 className="text-sm font-bold text-primary-900 mb-3 flex items-center gap-2">
          <Server className="h-4 w-4" />
          Princípios Arquiteturais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs font-bold text-primary-900 mb-1">Escalabilidade Horizontal</p>
            <p className="text-[10px] text-primary-800">Cada microsserviço escala independentemente via Kubernetes HPA baseado em CPU e requisições.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs font-bold text-primary-900 mb-1">Resiliência</p>
            <p className="text-[10px] text-primary-800">Circuit breakers, retry policies e fallbacks garantem disponibilidade mesmo com falhas parciais.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs font-bold text-primary-900 mb-1">Observabilidade</p>
            <p className="text-[10px] text-primary-800">Métricas (Prometheus), logs (Loki), traces (Jaeger) e alertas (Alertmanager) em stack unificado.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs font-bold text-primary-900 mb-1">Segurança Zero Trust</p>
            <p className="text-[10px] text-primary-800">mTLS entre serviços, autenticação em cada camada e criptografia em trânsito e repouso.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
