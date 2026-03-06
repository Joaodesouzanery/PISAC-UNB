"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { sensors, infrastructures, alerts } from "@/data/mock-data";
import {
  riskZones,
  evacuationRoutes,
  gisLayers,
  maintenanceHistory,
  bimModels,
  generateSensorTimeSeries,
  type GISLayer,
  type MaintenanceRecord,
} from "@/data/map-data";
import StatusBadge from "@/components/shared/StatusBadge";
import ProgressBar from "@/components/shared/ProgressBar";
import { formatNumber, timeAgo } from "@/lib/utils";
import {
  Layers,
  Radio,
  Building2,
  AlertTriangle,
  Eye,
  EyeOff,
  MapPin,
  Search,
  Navigation,
  Box,
  FileText,
  Clock,
  Wrench,
  ChevronDown,
  ChevronRight,
  X,
  Shield,
  Flame,
  Route,
  Map as MapIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Sensor, Infrastructure, Alert } from "@/types";

const MapView = dynamic(() => import("./MapView"), { ssr: false });
const BIMViewer = dynamic(() => import("./BIMViewer"), { ssr: false });

type LayerType = "sensors" | "infrastructure" | "alerts";
type DetailTab = "info" | "timeseries" | "maintenance" | "documents";

// --- Geocoding simulation ---
const knownLocations: Record<string, [number, number]> = {
  "ponte jk": [-15.8267, -47.8739],
  "taguatinga": [-15.836, -48.054],
  "plano piloto": [-15.7935, -47.8823],
  "ceilândia": [-15.810, -48.107],
  "vila estrutural": [-15.785, -47.995],
  "lago sul": [-15.844, -47.856],
  "samambaia": [-15.878, -48.082],
  "asa norte": [-15.748, -47.882],
  "asa sul": [-15.820, -47.882],
  "hospital de base": [-15.794, -47.891],
  "esplanada": [-15.798, -47.864],
  "barragem santa maria": [-15.715, -47.954],
  "rio descoberto": [-15.780, -48.234],
};

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
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showEvacRoutes, setShowEvacRoutes] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showGISPanel, setShowGISPanel] = useState(false);
  const [activeGISLayers, setActiveGISLayers] = useState<Set<string>>(new Set());
  const [detailTab, setDetailTab] = useState<DetailTab>("info");
  const [showBIM, setShowBIM] = useState(false);
  const [activeBIMModel, setActiveBIMModel] = useState<string | null>(null);

  // Geocoding
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCoords, setSearchCoords] = useState<[number, number] | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // Routing
  const [showRouting, setShowRouting] = useState(false);
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [routePoints, setRoutePoints] = useState<[number, number][] | null>(null);

  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  const filteredSensors = useMemo(() => {
    if (filterStatus === "all") return sensors;
    return sensors.filter((s) => s.status === filterStatus);
  }, [filterStatus]);

  // Geocoding handler
  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    const match = Object.entries(knownLocations).find(([key]) => key.includes(query) || query.includes(key));
    if (match) {
      setSearchCoords(match[1]);
      setSearchResults([]);
    } else {
      // Fuzzy match suggestions
      const suggestions = Object.keys(knownLocations).filter((k) =>
        k.split(" ").some((w) => query.split(" ").some((q) => w.startsWith(q) || q.startsWith(w)))
      );
      setSearchResults(suggestions);
    }
  };

  // Routing handler
  const handleRoute = () => {
    const from = knownLocations[routeFrom.toLowerCase().trim()];
    const to = knownLocations[routeTo.toLowerCase().trim()];
    if (from && to) {
      // Simple intermediate points
      const midLat = (from[0] + to[0]) / 2 + (Math.random() - 0.5) * 0.01;
      const midLng = (from[1] + to[1]) / 2 + (Math.random() - 0.5) * 0.01;
      setRoutePoints([from, [midLat, midLng], to]);
    }
  };

  // BIM model lookup
  const selectedInfraBIM = selectedItem?.type === "infrastructure"
    ? bimModels.find((b) => b.infrastructureId === selectedItem.data.id)
    : null;

  // Active BIM model
  const currentBIMModel = activeBIMModel
    ? bimModels.find((b) => b.id === activeBIMModel)
    : null;

  if (showBIM && currentBIMModel) {
    return (
      <div className="h-[calc(100vh-120px)]">
        <BIMViewer model={currentBIMModel} onClose={() => { setShowBIM(false); setActiveBIMModel(null); }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Toolbar */}
      <div
        className="px-3 py-2 flex items-center gap-2 flex-wrap"
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        {/* Layer toggles */}
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Camadas:
        </span>
        {[
          { key: "sensors" as LayerType, icon: Radio, label: "Sensores", count: sensors.length },
          { key: "infrastructure" as LayerType, icon: Building2, label: "Infra BIM", count: infrastructures.length },
          { key: "alerts" as LayerType, icon: AlertTriangle, label: "Alertas", count: alerts.filter((a) => a.isActive).length },
        ].map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
            style={{
              backgroundColor: activeLayers.has(key) ? "var(--accent-muted)" : "var(--bg-elevated)",
              color: activeLayers.has(key) ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${activeLayers.has(key) ? "rgba(249,115,22,0.3)" : "var(--border-primary)"}`,
            }}
          >
            {activeLayers.has(key) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{label}</span> ({count})
          </button>
        ))}

        <div className="w-px h-5 hidden sm:block" style={{ backgroundColor: "var(--border-primary)" }} />

        {/* GIS overlay toggles */}
        <button
          onClick={() => setShowRiskZones(!showRiskZones)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{
            backgroundColor: showRiskZones ? "rgba(239,68,68,0.1)" : "var(--bg-elevated)",
            color: showRiskZones ? "#ef4444" : "var(--text-muted)",
            border: `1px solid ${showRiskZones ? "rgba(239,68,68,0.3)" : "var(--border-primary)"}`,
          }}
        >
          <Shield className="h-3 w-3" />
          <span className="hidden md:inline">Zonas de Risco</span>
        </button>

        <button
          onClick={() => setShowEvacRoutes(!showEvacRoutes)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{
            backgroundColor: showEvacRoutes ? "rgba(34,197,94,0.1)" : "var(--bg-elevated)",
            color: showEvacRoutes ? "#22c55e" : "var(--text-muted)",
            border: `1px solid ${showEvacRoutes ? "rgba(34,197,94,0.3)" : "var(--border-primary)"}`,
          }}
        >
          <Route className="h-3 w-3" />
          <span className="hidden md:inline">Evacuação</span>
        </button>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{
            backgroundColor: showHeatmap ? "rgba(249,115,22,0.1)" : "var(--bg-elevated)",
            color: showHeatmap ? "#f97316" : "var(--text-muted)",
            border: `1px solid ${showHeatmap ? "rgba(249,115,22,0.3)" : "var(--border-primary)"}`,
          }}
        >
          <Flame className="h-3 w-3" />
          <span className="hidden md:inline">Calor</span>
        </button>

        <button
          onClick={() => setShowGISPanel(!showGISPanel)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{
            backgroundColor: showGISPanel ? "rgba(139,92,246,0.1)" : "var(--bg-elevated)",
            color: showGISPanel ? "#a78bfa" : "var(--text-muted)",
            border: `1px solid ${showGISPanel ? "rgba(139,92,246,0.3)" : "var(--border-primary)"}`,
          }}
        >
          <Layers className="h-3 w-3" />
          <span className="hidden lg:inline">WMS/WFS</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Geocoding search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-8 pr-3 py-1 rounded-lg text-[11px] w-40"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            {searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-md)" }}
              >
                {searchResults.map((result) => (
                  <button
                    key={result}
                    onClick={() => {
                      setSearchCoords(knownLocations[result]);
                      setSearchQuery(result);
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 text-[11px] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-elevated)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <MapPin className="inline h-3 w-3 mr-1.5" style={{ color: "var(--accent)" }} />
                    {result}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Routing toggle */}
          <button
            onClick={() => setShowRouting(!showRouting)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: showRouting ? "var(--accent-muted)" : "var(--bg-elevated)",
              color: showRouting ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${showRouting ? "rgba(249,115,22,0.3)" : "var(--border-primary)"}`,
            }}
          >
            <Navigation className="h-3 w-3" />
            <span className="hidden md:inline">Rota</span>
          </button>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-[11px] rounded-lg px-2 py-1"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">Todos</option>
            <option value="online">Online</option>
            <option value="warning">Atenção</option>
            <option value="critical">Crítico</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Routing panel */}
      {showRouting && (
        <div
          className="px-4 py-2 flex items-center gap-3 flex-wrap"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <Navigation className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <input
            type="text"
            placeholder="Origem (ex: Taguatinga)"
            value={routeFrom}
            onChange={(e) => setRouteFrom(e.target.value)}
            className="px-3 py-1 rounded-lg text-[11px] w-40"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none" }}
          />
          <ChevronRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Destino (ex: Plano Piloto)"
            value={routeTo}
            onChange={(e) => setRouteTo(e.target.value)}
            className="px-3 py-1 rounded-lg text-[11px] w-40"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none" }}
          />
          <button
            onClick={handleRoute}
            className="px-3 py-1 rounded-lg text-[11px] font-medium"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            Calcular
          </button>
          {routePoints && (
            <button
              onClick={() => setRoutePoints(null)}
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              Limpar rota
            </button>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* GIS Layers Panel */}
        {showGISPanel && (
          <div
            className="w-64 overflow-y-auto scrollbar-thin p-3 flex-shrink-0"
            style={{
              backgroundColor: "var(--bg-card)",
              borderRight: "1px solid var(--border-primary)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Camadas GIS (WMS/WFS)
              </p>
              <button onClick={() => setShowGISPanel(false)} style={{ color: "var(--text-muted)" }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {gisLayers.map((layer) => {
                const isActive = activeGISLayers.has(layer.id);
                const catColors: Record<string, string> = {
                  risk: "#ef4444", environment: "#22c55e", infrastructure: "#3b82f6", planning: "#a78bfa",
                };
                return (
                  <div
                    key={layer.id}
                    className="p-2.5 rounded-lg cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isActive ? "var(--accent-muted)" : "var(--bg-elevated)",
                      border: `1px solid ${isActive ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                    }}
                    onClick={() => {
                      setActiveGISLayers((prev) => {
                        const next = new Set(prev);
                        if (next.has(layer.id)) next.delete(layer.id);
                        else next.add(layer.id);
                        return next;
                      });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: catColors[layer.category] || "#94a3b8" }}
                      />
                      <span className="text-xs font-medium flex-1" style={{ color: "var(--text-primary)" }}>
                        {layer.name}
                      </span>
                      {isActive ? <Eye className="h-3 w-3" style={{ color: "var(--accent)" }} /> : <EyeOff className="h-3 w-3" style={{ color: "var(--text-muted)" }} />}
                    </div>
                    <p className="text-[10px] mt-1 ml-4" style={{ color: "var(--text-muted)" }}>
                      {layer.source} • {layer.type.toUpperCase()}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] mt-3" style={{ color: "var(--text-muted)" }}>
              * Camadas simuladas. Integração com INDE, ANA, CPRM e GeoPortais do DF em andamento.
            </p>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            sensors={activeLayers.has("sensors") ? filteredSensors : []}
            infrastructures={activeLayers.has("infrastructure") ? infrastructures : []}
            alerts={activeLayers.has("alerts") ? alerts.filter((a) => a.isActive) : []}
            riskZones={riskZones}
            evacuationRoutes={evacuationRoutes}
            showRiskZones={showRiskZones}
            showEvacRoutes={showEvacRoutes}
            showHeatmap={showHeatmap}
            onSelectSensor={(s) => { setSelectedItem({ type: "sensor", data: s }); setDetailTab("info"); }}
            onSelectInfrastructure={(i) => { setSelectedItem({ type: "infrastructure", data: i }); setDetailTab("info"); }}
            onSelectAlert={(a) => { setSelectedItem({ type: "alert", data: a }); setDetailTab("info"); }}
            searchCoords={searchCoords}
            routePoints={routePoints}
          />

          {/* Legend overlay */}
          <div
            className="absolute bottom-4 left-4 rounded-lg p-3 text-[10px] z-[500]"
            style={{
              backgroundColor: "rgba(20,21,31,0.9)",
              border: "1px solid var(--border-primary)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="font-bold mb-1.5" style={{ color: "var(--text-secondary)" }}>Legenda</p>
            <div className="space-y-1">
              {showRiskZones && (
                <>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: "#ef4444", opacity: 0.6 }} /><span style={{ color: "var(--text-muted)" }}>Risco Crítico</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: "#f97316", opacity: 0.6 }} /><span style={{ color: "var(--text-muted)" }}>Risco Alto</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: "#f59e0b", opacity: 0.6 }} /><span style={{ color: "var(--text-muted)" }}>Risco Médio</span></div>
                </>
              )}
              {showEvacRoutes && (
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded-sm" style={{ backgroundColor: "#22c55e" }} /><span style={{ color: "var(--text-muted)" }}>Rota Evacuação</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedItem && (
          <div
            className="w-80 lg:w-96 overflow-y-auto scrollbar-thin flex-shrink-0 flex flex-col"
            style={{
              backgroundColor: "var(--bg-card)",
              borderLeft: "1px solid var(--border-primary)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Detalhes</h3>
              <button onClick={() => setSelectedItem(null)} style={{ color: "var(--text-muted)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-4 pt-2 gap-1 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              {(
                [
                  { key: "info" as DetailTab, label: "Info", icon: MapPin },
                  ...(selectedItem.type === "sensor" ? [{ key: "timeseries" as DetailTab, label: "Séries", icon: Clock }] : []),
                  ...(selectedItem.type === "infrastructure" ? [
                    { key: "maintenance" as DetailTab, label: "Manutenção", icon: Wrench },
                    { key: "documents" as DetailTab, label: "Docs", icon: FileText },
                  ] : []),
                ]
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setDetailTab(key)}
                  className="flex items-center gap-1 px-3 py-2 text-[11px] font-medium rounded-t-lg"
                  style={{
                    backgroundColor: detailTab === key ? "var(--bg-elevated)" : "transparent",
                    color: detailTab === key ? "var(--accent)" : "var(--text-muted)",
                    borderBottom: detailTab === key ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {detailTab === "info" && selectedItem.type === "sensor" && (
                <SensorInfo sensor={selectedItem.data} />
              )}
              {detailTab === "info" && selectedItem.type === "infrastructure" && (
                <InfrastructureInfo
                  infra={selectedItem.data}
                  bimModel={selectedInfraBIM ?? undefined}
                  onOpenBIM={(modelId) => { setActiveBIMModel(modelId); setShowBIM(true); }}
                />
              )}
              {detailTab === "info" && selectedItem.type === "alert" && (
                <AlertInfo alert={selectedItem.data} />
              )}
              {detailTab === "timeseries" && selectedItem.type === "sensor" && (
                <SensorTimeSeries sensor={selectedItem.data} />
              )}
              {detailTab === "maintenance" && selectedItem.type === "infrastructure" && (
                <MaintenanceHistory infraId={selectedItem.data.id} />
              )}
              {detailTab === "documents" && selectedItem.type === "infrastructure" && (
                <DocumentsList infraId={selectedItem.data.id} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Detail Sub-Components ----

function SensorInfo({ sensor }: { sensor: Sensor }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{sensor.name}</span>
      </div>
      <StatusBadge label={sensor.status} />
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: "Valor Atual", value: `${sensor.value} ${sensor.unit}`, color: "var(--text-primary)" },
          { label: "Tipo", value: sensor.type.replace("_", " "), color: "var(--text-primary)" },
          { label: "Limiar Atenção", value: `${sensor.thresholds.warning} ${sensor.unit}`, color: "#f59e0b" },
          { label: "Limiar Crítico", value: `${sensor.thresholds.critical} ${sensor.unit}`, color: "#ef4444" },
        ].map((item, i) => (
          <div key={i} className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "10px" }}>{item.label}</p>
            <p className="font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        Última atualização: {timeAgo(sensor.lastUpdate)}
      </p>
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        Coordenadas: {sensor.lat.toFixed(4)}, {sensor.lng.toFixed(4)}
      </p>
    </div>
  );
}

function SensorTimeSeries({ sensor }: { sensor: Sensor }) {
  const data = useMemo(() =>
    generateSensorTimeSeries(sensor.id, sensor.value, sensor.value * 0.1, sensor.thresholds.warning, 48),
    [sensor.id, sensor.value, sensor.thresholds.warning]
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
        Série Temporal - Últimas 48h
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #1e1f2e)" />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--chart-text, #7c7c98)" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: "var(--chart-text, #7c7c98)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: 11,
            }}
          />
          <ReferenceLine y={sensor.thresholds.warning} stroke="#f59e0b" strokeDasharray="3 3" label="" />
          <ReferenceLine y={sensor.thresholds.critical} stroke="#ef4444" strokeDasharray="3 3" label="" />
          <Line type="monotone" dataKey="value" stroke="#f97316" dot={false} strokeWidth={2} name="Valor" />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block" style={{ backgroundColor: "#f59e0b" }} /> Atenção</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block" style={{ backgroundColor: "#ef4444" }} /> Crítico</span>
      </div>
    </div>
  );
}

function InfrastructureInfo({ infra, bimModel, onOpenBIM }: { infra: Infrastructure; bimModel?: typeof bimModels[0]; onOpenBIM: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{infra.name}</span>
      </div>
      <StatusBadge label={infra.condition} />
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: "Tipo", value: infra.type.replace("_", " ") },
          { label: "Ano", value: String(infra.yearBuilt) },
          { label: "Risco", value: `${infra.riskScore}/100`, color: infra.riskScore > 50 ? "#ef4444" : "#22c55e" },
          { label: "Capacidade", value: infra.capacity ? formatNumber(infra.capacity) : "N/A" },
        ].map((item, i) => (
          <div key={i} className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "10px" }}>{item.label}</p>
            <p className="font-bold" style={{ color: item.color || "var(--text-primary)" }}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Última Inspeção</p>
        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{infra.lastInspection}</p>
      </div>
      {infra.sensors.length > 0 && (
        <div>
          <p className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Sensores vinculados:</p>
          <div className="flex flex-wrap gap-1">
            {infra.sensors.map((sId) => (
              <span key={sId} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
                {sId}
              </span>
            ))}
          </div>
        </div>
      )}
      {bimModel && (
        <button
          onClick={() => onOpenBIM(bimModel.id)}
          className="w-full flex items-center gap-2 p-3 rounded-lg transition-colors"
          style={{
            backgroundColor: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <Box className="h-5 w-5 flex-shrink-0" style={{ color: "#a78bfa" }} />
          <div className="text-left">
            <p className="text-xs font-bold" style={{ color: "#a78bfa" }}>Visualizar Modelo BIM 3D</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {bimModel.name} • v{bimModel.version} • {bimModel.fileSize}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

function AlertInfo({ alert }: { alert: Alert }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-danger-500" />
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{alert.title}</span>
      </div>
      <StatusBadge label={alert.severity} variant="severity" />
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{alert.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "10px" }}>Localização</p>
          <p className="font-bold" style={{ color: "var(--text-primary)" }}>{alert.location}</p>
        </div>
        <div className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "10px" }}>Categoria</p>
          <p className="font-bold" style={{ color: "var(--text-primary)" }}>{alert.category}</p>
        </div>
      </div>
      {alert.affectedPopulation && (
        <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-xs font-medium" style={{ color: "#ef4444" }}>
            População afetada: {formatNumber(alert.affectedPopulation)} pessoas
          </p>
        </div>
      )}
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Emitido: {timeAgo(alert.timestamp)}</p>
    </div>
  );
}

function MaintenanceHistory({ infraId }: { infraId: string }) {
  const records = maintenanceHistory[infraId] || [];

  if (records.length === 0) {
    return <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nenhum registro de manutenção disponível.</p>;
  }

  const typeLabels: Record<string, string> = {
    inspection: "Inspeção", repair: "Reparo", upgrade: "Modernização", emergency: "Emergência",
  };
  const typeColors: Record<string, string> = {
    inspection: "#3b82f6", repair: "#f59e0b", upgrade: "#22c55e", emergency: "#ef4444",
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
        Histórico de Manutenção ({records.length})
      </p>
      <div className="space-y-2">
        {records.map((record) => (
          <div
            key={record.id}
            className="p-3 rounded-lg"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderLeft: `3px solid ${typeColors[record.type] || "#94a3b8"}`,
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{
                backgroundColor: `${typeColors[record.type]}15`,
                color: typeColors[record.type],
              }}>
                {typeLabels[record.type] || record.type}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{record.date}</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-primary)" }}>{record.description}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{record.responsible}</span>
              {record.cost && (
                <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  R$ {(record.cost / 1000).toFixed(0)}k
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsList({ infraId }: { infraId: string }) {
  const records = maintenanceHistory[infraId] || [];
  const allDocs = records.flatMap((r) =>
    r.documents.map((d) => ({ ...d, date: r.date, source: r.responsible }))
  );

  if (allDocs.length === 0) {
    return <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nenhum documento disponível.</p>;
  }

  const typeIcons: Record<string, string> = {
    report: "📄", bim: "🏗️", project: "📐", schedule: "📅", legal: "⚖️",
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
        Documentos Vinculados ({allDocs.length})
      </p>
      <div className="space-y-1.5">
        {allDocs.map((doc, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <span className="text-sm">{typeIcons[doc.type] || "📄"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{doc.source} • {doc.date}</p>
            </div>
            <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
