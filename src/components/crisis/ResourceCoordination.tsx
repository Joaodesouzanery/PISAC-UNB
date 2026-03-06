"use client";

import { crisisResources, municipalities } from "@/data/crisis-data";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  Package,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Truck,
  Wrench,
  Satellite,
  Radio,
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

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof Package }
> = {
  available: { label: "Disponível", color: "#22c55e", icon: CheckCircle },
  deployed: { label: "Implantado", color: "#3b82f6", icon: Package },
  in_transit: { label: "Em Trânsito", color: "#f59e0b", icon: Truck },
  maintenance: { label: "Manutenção", color: "#94a3b8", icon: Wrench },
};

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#94a3b8"];

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-primary)",
  borderRadius: 8,
  fontSize: 11,
  color: "var(--text-primary)",
};

export default function ResourceCoordination() {
  const resourcesByType = crisisResources.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {} as Record<string, typeof crisisResources>
  );

  const summaryByType = Object.entries(resourcesByType).map(([type, resources]) => ({
    type,
    total: resources.reduce((s, r) => s + r.quantity, 0),
    available: resources.reduce((s, r) => s + r.available, 0),
    allocated: resources.reduce((s, r) => s + r.allocated, 0),
  }));

  const statusDistribution = [
    { name: "Disponível", value: crisisResources.filter((r) => r.status === "available").length },
    { name: "Implantado", value: crisisResources.filter((r) => r.status === "deployed").length },
    { name: "Em Trânsito", value: crisisResources.filter((r) => r.status === "in_transit").length },
    { name: "Manutenção", value: crisisResources.filter((r) => r.status === "maintenance").length },
  ];

  const criticalResources = crisisResources.filter(
    (r) => r.available / r.quantity < 0.25
  );

  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };

  return (
    <div className="space-y-6">
      {/* Real-Time Tracking Banner */}
      <div className="rounded-xl p-3 flex items-center gap-3 flex-wrap" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)" }}>
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>Rastreamento em Tempo Real</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>
            GPS Ativo
          </span>
          <span className="flex items-center gap-1"><Radio className="h-3 w-3" /> IoT Sensores Conectados</span>
          <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {crisisResources.filter(r => r.status === "in_transit").length} veículos em trânsito</span>
          <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {crisisResources.reduce((s, r) => s + r.quantity, 0)} itens monitorados</span>
        </div>
      </div>

      {/* Critical Alert */}
      {criticalResources.length > 0 && (
        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12 }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b" }} />
            <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>
              Recursos em Nível Crítico ({criticalResources.length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {criticalResources.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg p-2" style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{r.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: "#ef4444" }}>{r.available}/{r.quantity}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>disponíveis</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Summary Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Alocação de Recursos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summaryByType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={130} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="allocated" fill="#3b82f6" name="Alocado" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="available" fill="#22c55e" name="Disponível" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="p-4 rounded-xl" style={cardStyle}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Distribuição por Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={true}
              >
                {statusDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Total: <strong style={{ color: "var(--text-primary)" }}>{crisisResources.length}</strong> categorias de recurso
            </p>
          </div>
        </div>
      </div>

      {/* Resource Table */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Package className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Rastreamento de Recursos em Tempo Real
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                {["Recurso", "Tipo", "Total", "Disp.", "Alocado", "Utilização", "Status", "Localização", "Atualização"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crisisResources.map((resource) => {
                const status = statusConfig[resource.status];
                const utilization = ((resource.quantity - resource.available) / resource.quantity) * 100;
                const isCritical = resource.available / resource.quantity < 0.25;

                return (
                  <tr
                    key={resource.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      backgroundColor: isCritical ? "rgba(239,68,68,0.05)" : "transparent",
                    }}
                  >
                    <td className="py-2 px-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: status.color }} />
                          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: status.color }} />
                        </span>
                        {resource.name}
                      </div>
                    </td>
                    <td className="py-2 px-3" style={{ color: "var(--text-muted)" }}>{resource.type}</td>
                    <td className="py-2 px-3 text-center font-medium" style={{ color: "var(--text-primary)" }}>{resource.quantity}</td>
                    <td className="py-2 px-3 text-center font-bold" style={{ color: isCritical ? "#ef4444" : "#22c55e" }}>{resource.available}</td>
                    <td className="py-2 px-3 text-center" style={{ color: "#3b82f6" }}>{resource.allocated}</td>
                    <td className="py-2 px-3">
                      <ProgressBar
                        value={utilization}
                        showPercentage={false}
                        size="sm"
                        color={utilization > 80 ? "danger" : utilization > 60 ? "warning" : "primary"}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                        <status.icon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-2 px-3 max-w-[150px] truncate" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        {resource.location}
                      </span>
                    </td>
                    <td className="py-2 px-3" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(resource.lastUpdate)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Municipality Resource Summary */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Disponibilidade de Recursos por Município
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {municipalities
            .filter((m) => m.status !== "normal")
            .map((m) => (
              <div
                key={m.id}
                className="rounded-lg p-3"
                style={{
                  border: `1px solid ${m.status === "crisis" ? "rgba(239,68,68,0.3)" : m.status === "alert" ? "rgba(245,158,11,0.3)" : "var(--border-primary)"}`,
                  backgroundColor: m.status === "crisis" ? "rgba(239,68,68,0.05)" : m.status === "alert" ? "rgba(245,158,11,0.05)" : "var(--bg-elevated)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: m.status === "crisis" ? "rgba(239,68,68,0.15)" : m.status === "alert" ? "rgba(245,158,11,0.15)" : "var(--bg-elevated)",
                      color: m.status === "crisis" ? "#ef4444" : m.status === "alert" ? "#f59e0b" : "var(--text-muted)",
                    }}
                  >
                    {m.status === "crisis" ? "EM CRISE" : m.status === "alert" ? "ALERTA" : m.status.toUpperCase()}
                  </span>
                </div>
                <ProgressBar
                  value={m.resourcesAvailable}
                  label="Recursos disponíveis"
                  size="sm"
                  color={m.resourcesAvailable < 40 ? "danger" : m.resourcesAvailable < 60 ? "warning" : "success"}
                />
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{m.activeIncidents} incidentes ativos</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
