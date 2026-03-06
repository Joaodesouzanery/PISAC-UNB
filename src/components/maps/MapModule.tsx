"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { sensors, infrastructures, alerts } from "@/data/mock-data";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatNumber, timeAgo } from "@/lib/utils";
import {
  Layers,
  Radio,
  Building2,
  AlertTriangle,
  Eye,
  EyeOff,
  Info,
  MapPin,
} from "lucide-react";
import type { Sensor, Infrastructure, Alert } from "@/types";

// Dynamically import map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("./MapView"), { ssr: false });

type LayerType = "sensors" | "infrastructure" | "alerts";

export default function MapModule() {
  const [activeLayers, setActiveLayers] = useState<Set<LayerType>>(
    new Set<LayerType>(["sensors", "infrastructure", "alerts"])
  );
  const [selectedItem, setSelectedItem] = useState<
    | { type: "sensor"; data: Sensor }
    | { type: "infrastructure"; data: Infrastructure }
    | { type: "alert"; data: Alert }
    | null
  >(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const toggleLayer = (layer: LayerType) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const filteredSensors = useMemo(() => {
    if (filterStatus === "all") return sensors;
    return sensors.filter((s) => s.status === filterStatus);
  }, [filterStatus]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 flex-wrap">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Camadas:
        </span>
        {[
          { key: "sensors" as LayerType, icon: Radio, label: "Sensores IoT", count: sensors.length },
          { key: "infrastructure" as LayerType, icon: Building2, label: "Infraestrutura BIM", count: infrastructures.length },
          { key: "alerts" as LayerType, icon: AlertTriangle, label: "Alertas", count: alerts.filter((a) => a.isActive).length },
        ].map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeLayers.has(key)
                ? "bg-primary-50 text-primary-700 border-primary-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {activeLayers.has(key) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <Icon className="h-3 w-3" />
            {label} ({count})
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="all">Todos os status</option>
            <option value="online">Online</option>
            <option value="warning">Atenção</option>
            <option value="critical">Crítico</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            sensors={activeLayers.has("sensors") ? filteredSensors : []}
            infrastructures={activeLayers.has("infrastructure") ? infrastructures : []}
            alerts={activeLayers.has("alerts") ? alerts.filter((a) => a.isActive) : []}
            onSelectSensor={(s) => setSelectedItem({ type: "sensor", data: s })}
            onSelectInfrastructure={(i) => setSelectedItem({ type: "infrastructure", data: i })}
            onSelectAlert={(a) => setSelectedItem({ type: "alert", data: a })}
          />
        </div>

        {/* Detail Panel */}
        {selectedItem && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto scrollbar-thin p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Detalhes</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Fechar
              </button>
            </div>

            {selectedItem.type === "sensor" && (
              <SensorDetail sensor={selectedItem.data} />
            )}
            {selectedItem.type === "infrastructure" && (
              <InfrastructureDetail infra={selectedItem.data} />
            )}
            {selectedItem.type === "alert" && (
              <AlertDetail alert={selectedItem.data} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SensorDetail({ sensor }: { sensor: Sensor }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4 text-primary-600" />
        <span className="text-sm font-medium">{sensor.name}</span>
      </div>
      <StatusBadge label={sensor.status} />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Valor Atual</p>
          <p className="font-bold text-gray-900">
            {sensor.value} {sensor.unit}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Tipo</p>
          <p className="font-bold text-gray-900">{sensor.type.replace("_", " ")}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Limiar Atenção</p>
          <p className="font-bold text-warning-600">
            {sensor.thresholds.warning} {sensor.unit}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Limiar Crítico</p>
          <p className="font-bold text-danger-600">
            {sensor.thresholds.critical} {sensor.unit}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-gray-400">
        Última atualização: {timeAgo(sensor.lastUpdate)}
      </p>
      <p className="text-[10px] text-gray-400">
        Coordenadas: {sensor.lat.toFixed(4)}, {sensor.lng.toFixed(4)}
      </p>
    </div>
  );
}

function InfrastructureDetail({ infra }: { infra: Infrastructure }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary-600" />
        <span className="text-sm font-medium">{infra.name}</span>
      </div>
      <StatusBadge label={infra.condition} />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Tipo</p>
          <p className="font-bold text-gray-900">{infra.type.replace("_", " ")}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Ano Construção</p>
          <p className="font-bold text-gray-900">{infra.yearBuilt}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Risco</p>
          <p className={`font-bold ${infra.riskScore > 50 ? "text-danger-600" : "text-success-600"}`}>
            {infra.riskScore}/100
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Capacidade</p>
          <p className="font-bold text-gray-900">
            {infra.capacity ? formatNumber(infra.capacity) : "N/A"}
          </p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-2 text-xs">
        <p className="text-gray-500">Última Inspeção</p>
        <p className="font-bold text-gray-900">{infra.lastInspection}</p>
      </div>
      {infra.sensors.length > 0 && (
        <div className="text-xs">
          <p className="text-gray-500 mb-1">Sensores vinculados:</p>
          <div className="flex flex-wrap gap-1">
            {infra.sensors.map((sId) => (
              <span key={sId} className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-[10px]">
                {sId}
              </span>
            ))}
          </div>
        </div>
      )}
      {infra.bimModelUrl && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-2 text-xs text-primary-700">
          <p className="font-medium">Modelo BIM disponível</p>
          <p className="text-primary-500 text-[10px]">Clique para visualizar em 3D</p>
        </div>
      )}
    </div>
  );
}

function AlertDetail({ alert }: { alert: Alert }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-danger-600" />
        <span className="text-sm font-medium">{alert.title}</span>
      </div>
      <StatusBadge label={alert.severity} variant="severity" />
      <p className="text-xs text-gray-600">{alert.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Localização</p>
          <p className="font-bold text-gray-900">{alert.location}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Categoria</p>
          <p className="font-bold text-gray-900">{alert.category}</p>
        </div>
      </div>
      {alert.affectedPopulation && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-2 text-xs">
          <p className="text-danger-700 font-medium">
            População afetada: {formatNumber(alert.affectedPopulation)} pessoas
          </p>
        </div>
      )}
      <p className="text-[10px] text-gray-400">
        Emitido: {timeAgo(alert.timestamp)}
      </p>
    </div>
  );
}
