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
  available: { label: "Disponível", color: "text-success-600 bg-success-50", icon: CheckCircle },
  deployed: { label: "Implantado", color: "text-primary-600 bg-primary-50", icon: Package },
  in_transit: { label: "Em Trânsito", color: "text-warning-600 bg-warning-50", icon: Truck },
  maintenance: { label: "Manutenção", color: "text-gray-600 bg-gray-100", icon: Wrench },
};

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#94a3b8"];

export default function ResourceCoordination() {
  // Group resources by type
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

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      {criticalResources.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning-600" />
            <span className="text-sm font-bold text-warning-800">
              Recursos em Nível Crítico ({criticalResources.length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {criticalResources.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white rounded-lg p-2 border border-warning-200"
              >
                <div>
                  <p className="text-xs font-medium text-gray-900">{r.name}</p>
                  <p className="text-[10px] text-gray-500">{r.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-danger-600">
                    {r.available}/{r.quantity}
                  </p>
                  <p className="text-[10px] text-gray-400">disponíveis</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Summary Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Alocação de Recursos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summaryByType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="type"
                type="category"
                tick={{ fontSize: 10 }}
                width={130}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar
                dataKey="allocated"
                fill="#3b82f6"
                name="Alocado"
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="available"
                fill="#22c55e"
                name="Disponível"
                stackId="a"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
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
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Total: <strong>{crisisResources.length}</strong> categorias de
              recurso
            </p>
          </div>
        </div>
      </div>

      {/* Resource Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-primary-600" />
          Rastreamento de Recursos em Tempo Real
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">
                  Recurso
                </th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">
                  Tipo
                </th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">
                  Total
                </th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">
                  Disp.
                </th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">
                  Alocado
                </th>
                <th className="py-2 px-3 text-gray-500 font-medium w-24">
                  Utilização
                </th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">
                  Localização
                </th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">
                  Atualização
                </th>
              </tr>
            </thead>
            <tbody>
              {crisisResources.map((resource) => {
                const status = statusConfig[resource.status];
                const utilization =
                  ((resource.quantity - resource.available) / resource.quantity) *
                  100;

                return (
                  <tr
                    key={resource.id}
                    className={cn(
                      "border-b border-gray-100 hover:bg-gray-50",
                      resource.available / resource.quantity < 0.25 &&
                        "bg-danger-50/50"
                    )}
                  >
                    <td className="py-2 px-3 font-medium text-gray-900">
                      {resource.name}
                    </td>
                    <td className="py-2 px-3 text-gray-600">{resource.type}</td>
                    <td className="py-2 px-3 text-center font-medium">
                      {resource.quantity}
                    </td>
                    <td
                      className={cn(
                        "py-2 px-3 text-center font-bold",
                        resource.available / resource.quantity < 0.25
                          ? "text-danger-600"
                          : "text-success-600"
                      )}
                    >
                      {resource.available}
                    </td>
                    <td className="py-2 px-3 text-center text-primary-600">
                      {resource.allocated}
                    </td>
                    <td className="py-2 px-3">
                      <ProgressBar
                        value={utilization}
                        showPercentage={false}
                        size="sm"
                        color={
                          utilization > 80
                            ? "danger"
                            : utilization > 60
                            ? "warning"
                            : "primary"
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                          status.color
                        )}
                      >
                        <status.icon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600 max-w-[150px] truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        {resource.location}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-400">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Disponibilidade de Recursos por Município
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {municipalities
            .filter((m) => m.status !== "normal")
            .map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-lg border p-3",
                  m.status === "crisis"
                    ? "border-danger-200 bg-danger-50"
                    : m.status === "alert"
                    ? "border-warning-200 bg-warning-50"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">
                    {m.name}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium",
                      m.status === "crisis"
                        ? "bg-danger-200 text-danger-800"
                        : m.status === "alert"
                        ? "bg-warning-200 text-warning-800"
                        : "bg-gray-200 text-gray-700"
                    )}
                  >
                    {m.status === "crisis"
                      ? "EM CRISE"
                      : m.status === "alert"
                      ? "ALERTA"
                      : m.status.toUpperCase()}
                  </span>
                </div>
                <ProgressBar
                  value={m.resourcesAvailable}
                  label="Recursos disponíveis"
                  size="sm"
                  color={
                    m.resourcesAvailable < 40
                      ? "danger"
                      : m.resourcesAvailable < 60
                      ? "warning"
                      : "success"
                  }
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {m.activeIncidents} incidentes ativos
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
