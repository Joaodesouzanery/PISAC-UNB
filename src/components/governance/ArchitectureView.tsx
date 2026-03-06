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
  GitBranch,
  ArrowDown,
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

const tierConfig: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  frontend: { label: "Frontend", icon: Globe, color: "#3b82f6" },
  api_gateway: { label: "API Gateway", icon: Shield, color: "#8b5cf6" },
  service: { label: "Serviços", icon: Layers, color: "#22c55e" },
  data: { label: "Dados", icon: Database, color: "#f97316" },
  infrastructure: { label: "Infraestrutura", icon: Server, color: "#94a3b8" },
};

const statusColors: Record<string, { label: string; color: string }> = {
  running: { label: "Rodando", color: "#22c55e" },
  degraded: { label: "Degradado", color: "#f59e0b" },
  offline: { label: "Offline", color: "#ef4444" },
  maintenance: { label: "Manutenção", color: "#3b82f6" },
};

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-primary)",
  borderRadius: 8,
  fontSize: 11,
  color: "var(--text-primary)",
};

const serviceDependencies = [
  { from: "Frontend (Next.js)", to: "API Gateway", protocol: "HTTPS/REST" },
  { from: "API Gateway", to: "Auth Service", protocol: "gRPC" },
  { from: "API Gateway", to: "Crisis Service", protocol: "REST" },
  { from: "API Gateway", to: "Monitoring Service", protocol: "REST" },
  { from: "API Gateway", to: "Governance Service", protocol: "REST" },
  { from: "Crisis Service", to: "PostgreSQL", protocol: "TCP/SQL" },
  { from: "Crisis Service", to: "Redis Cache", protocol: "TCP" },
  { from: "Monitoring Service", to: "TimescaleDB", protocol: "TCP/SQL" },
  { from: "Monitoring Service", to: "Message Queue", protocol: "AMQP" },
  { from: "Auth Service", to: "Gov.br OIDC", protocol: "HTTPS/OIDC" },
  { from: "All Services", to: "Prometheus/Grafana", protocol: "HTTP/Metrics" },
];

const serviceResponsibilities = [
  { service: "API Gateway", responsibility: "Roteamento, autenticação, rate limiting, CORS", port: "443", tech: "Kong / Nginx" },
  { service: "Auth Service", responsibility: "Login Gov.br, MFA, JWT, sessões, ICP-Brasil", port: "3001", tech: "Node.js" },
  { service: "Crisis Service", responsibility: "Gestão de crises, incidentes, comunicação, CAP", port: "3002", tech: "Node.js" },
  { service: "Monitoring Service", responsibility: "IoT, sensores, alertas em tempo real, geolocalização", port: "3003", tech: "Python/FastAPI" },
  { service: "Governance Service", responsibility: "RBAC, auditoria, LGPD, conformidade", port: "3004", tech: "Node.js" },
  { service: "Budget Service", responsibility: "Orçamento participativo, execução, convênios", port: "3005", tech: "Node.js" },
  { service: "Simulation Service", responsibility: "Simulações Monte Carlo, cenários, projeções", port: "3006", tech: "Python/NumPy" },
  { service: "Notification Service", responsibility: "Push, email, SMS, alertas CAP, webhooks", port: "3007", tech: "Node.js" },
];

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

  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };

  return (
    <div className="space-y-6">
      {/* Infrastructure Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Microsserviços", value: microserviceNodes.length, sub: `${runningNodes} rodando`, icon: Server, color: "var(--accent)" },
          { label: "Instâncias", value: totalInstances, sub: "containers ativos", icon: Cloud, color: "#22c55e" },
          { label: "Requisições/min", value: totalRequests.toLocaleString("pt-BR"), sub: "throughput total", icon: Zap, color: "#f59e0b" },
          { label: "CPU Média", value: `${avgCpu}%`, sub: "uso do cluster", icon: Cpu, color: "#06b6d4" },
          { label: "Memória Média", value: `${avgMemory}%`, sub: "uso do cluster", icon: HardDrive, color: "#8b5cf6" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl" style={{ ...cardStyle, borderLeft: `4px solid ${color}` }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Icon className="h-3 w-3" /> {label}
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Service Responsibilities Table */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 12 }}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--accent)" }}>
          <Layers className="h-4 w-4" />
          Responsabilidades dos Microsserviços
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(249,115,22,0.2)" }}>
                {["Serviço", "Responsabilidade", "Porta", "Tecnologia"].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-bold text-[10px] uppercase tracking-wider" style={{ color: "var(--accent)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serviceResponsibilities.map((svc) => (
                <tr key={svc.service} style={{ borderBottom: "1px solid rgba(249,115,22,0.1)" }}>
                  <td className="py-2 px-3 font-bold" style={{ color: "var(--text-primary)" }}>{svc.service}</td>
                  <td className="py-2 px-3" style={{ color: "var(--text-secondary)" }}>{svc.responsibility}</td>
                  <td className="py-2 px-3 font-mono" style={{ color: "var(--text-muted)" }}>{svc.port}</td>
                  <td className="py-2 px-3 font-mono" style={{ color: "var(--text-muted)" }}>{svc.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Dependency Graph */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <GitBranch className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Grafo de Dependências entre Serviços
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {serviceDependencies.map((dep, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>{dep.from}</span>
              <ArrowRight className="h-3 w-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>{dep.to}</span>
              <span className="text-[8px] font-mono ml-auto" style={{ color: "var(--text-muted)" }}>{dep.protocol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Diagram - Tiered View */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Layers className="h-4 w-4" style={{ color: "var(--accent)" }} />
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
                  <div className="p-1 rounded" style={{ backgroundColor: `${config.color}15` }}>
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                  </div>
                  <h4 className="text-xs font-bold" style={{ color: config.color }}>{config.label}</h4>
                  <div className="flex-1" style={{ borderTop: "1px dashed var(--border-subtle)" }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                  {nodes.map((node) => {
                    const statusInfo = statusColors[node.status];

                    return (
                      <div key={node.id} className="rounded-lg p-3" style={{ backgroundColor: `${config.color}08`, border: `2px solid ${config.color}30` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusInfo.color }} />
                            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{node.name}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                            x{node.instances}
                          </span>
                        </div>
                        <p className="text-[10px] mb-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>{node.description}</p>
                        <p className="text-[9px] font-mono mb-2" style={{ color: "var(--text-muted)" }}>{node.technology}</p>

                        <div className="grid grid-cols-2 gap-2">
                          <ProgressBar value={node.cpu} label="CPU" size="sm" color={node.cpu > 70 ? "danger" : node.cpu > 50 ? "warning" : "success"} showPercentage />
                          <ProgressBar value={node.memory} label="Mem" size="sm" color={node.memory > 70 ? "danger" : node.memory > 50 ? "warning" : "success"} showPercentage />
                        </div>
                        <div className="flex justify-between mt-2 text-[9px]" style={{ color: "var(--text-muted)" }}>
                          <span>{node.requestsPerMin.toLocaleString("pt-BR")} req/min</span>
                          <span style={{ color: node.errorRate > 0.05 ? "#ef4444" : "var(--text-muted)", fontWeight: node.errorRate > 0.05 ? "bold" : "normal" }}>
                            Erros: {(node.errorRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {tierIndex < tiers.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="flex flex-col items-center" style={{ color: "var(--text-muted)" }}>
                      <div className="w-px h-4" style={{ backgroundColor: "var(--border-subtle)" }} />
                      <ArrowDown className="h-4 w-4" />
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
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Uso de Recursos por Serviço</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text-muted)" }} angle={-15} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="cpu" fill="#3b82f6" name="CPU (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="memoria" fill="#8b5cf6" name="Memória (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Radar */}
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Saúde dos Serviços</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={healthRadar}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: "var(--text-muted)" }} />
              <Radar name="Disponibilidade" dataKey="disponibilidade" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
              <Radar name="CPU Livre" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Memória Livre" dataKey="memoria" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Architecture Principles */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 12 }}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--accent)" }}>
          <Server className="h-4 w-4" />
          Princípios Arquiteturais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { title: "Escalabilidade Horizontal", desc: "Cada microsserviço escala independentemente via Kubernetes HPA baseado em CPU e requisições." },
            { title: "Resiliência", desc: "Circuit breakers, retry policies e fallbacks garantem disponibilidade mesmo com falhas parciais." },
            { title: "Observabilidade", desc: "Métricas (Prometheus), logs (Loki), traces (Jaeger) e alertas (Alertmanager) em stack unificado." },
            { title: "Segurança Zero Trust", desc: "mTLS entre serviços, autenticação em cada camada e criptografia em trânsito e repouso." },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "var(--text-primary)" }}>{title}</p>
              <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
