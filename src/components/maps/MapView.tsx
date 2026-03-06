"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Sensor, Infrastructure, Alert } from "@/types";
import type { RiskZone, MapEvacuationRoute } from "@/data/map-data";

interface MapViewProps {
  sensors: Sensor[];
  infrastructures: Infrastructure[];
  alerts: Alert[];
  riskZones: RiskZone[];
  evacuationRoutes: MapEvacuationRoute[];
  showRiskZones: boolean;
  showEvacRoutes: boolean;
  showHeatmap: boolean;
  onSelectSensor: (sensor: Sensor) => void;
  onSelectInfrastructure: (infra: Infrastructure) => void;
  onSelectAlert: (alert: Alert) => void;
  searchCoords: [number, number] | null;
  routePoints: [number, number][] | null;
}

// ---- Icon Factories ----

function getSensorIcon(status: string): L.DivIcon {
  const colors: Record<string, string> = {
    online: "#22c55e", warning: "#f59e0b", critical: "#ef4444", offline: "#94a3b8",
  };
  const color = colors[status] || "#94a3b8";
  const pulse = status === "critical" ? "animation:pulse 1.5s infinite;" : "";
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 1px 6px rgba(0,0,0,0.4);${pulse}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: "",
  });
}

function getInfraIcon(condition: string): L.DivIcon {
  const colors: Record<string, string> = {
    excellent: "#22c55e", good: "#3b82f6", fair: "#f59e0b", poor: "#f97316", critical: "#ef4444",
  };
  const color = colors[condition] || "#94a3b8";
  return L.divIcon({
    html: `<div style="width:20px;height:20px;border-radius:4px;background:${color};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 1px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: "",
  });
}

function getAlertIcon(severity: string): L.DivIcon {
  const sizes: Record<string, number> = { emergency: 26, critical: 22, warning: 18, info: 14 };
  const colors: Record<string, string> = { emergency: "#dc2626", critical: "#f97316", warning: "#eab308", info: "#3b82f6" };
  const size = sizes[severity] || 16;
  const color = colors[severity] || "#3b82f6";
  const pulse = severity === "emergency" ? "animation:pulse 1.5s infinite;" : "";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;${pulse}">
      <svg width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="white"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: "",
  });
}

const riskZoneColors: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#3b82f6",
};

const routeStatusColors: Record<string, string> = {
  clear: "#22c55e", congested: "#f59e0b", blocked: "#ef4444",
};

export default function MapView({
  sensors,
  infrastructures,
  alerts,
  riskZones,
  evacuationRoutes,
  showRiskZones,
  showEvacRoutes,
  showHeatmap,
  onSelectSensor,
  onSelectInfrastructure,
  onSelectAlert,
  searchCoords,
  routePoints,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [-15.7975, -47.8919],
      zoom: 11,
      zoomControl: false,
    });

    // Zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(mapRef.current);

    // Dark-themed tile layer (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(mapRef.current);

    // Scale control
    L.control.scale({ metric: true, imperial: false, position: "bottomleft" }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update data layers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous layers
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];

    // --- Risk zones ---
    if (showRiskZones) {
      const riskLayer = L.layerGroup();
      riskZones.forEach((zone) => {
        const polygon = L.polygon(zone.coordinates, {
          color: riskZoneColors[zone.level] || "#f59e0b",
          fillColor: riskZoneColors[zone.level] || "#f59e0b",
          fillOpacity: 0.2,
          weight: 2,
          dashArray: zone.level === "critical" ? "" : "5 5",
        });
        polygon.bindTooltip(
          `<strong>${zone.name}</strong><br/><span style="color:${riskZoneColors[zone.level]}">${zone.level.toUpperCase()}</span><br/>${zone.description}`,
          { sticky: true, className: "dark-tooltip" }
        );
        polygon.addTo(riskLayer);
      });
      riskLayer.addTo(mapRef.current);
      layersRef.current.push(riskLayer);
    }

    // --- Evacuation routes ---
    if (showEvacRoutes) {
      const routeLayer = L.layerGroup();
      evacuationRoutes.forEach((route) => {
        const polyline = L.polyline(route.points, {
          color: routeStatusColors[route.status] || "#22c55e",
          weight: 4,
          opacity: 0.8,
          dashArray: route.status === "blocked" ? "10 10" : undefined,
        });
        polyline.bindTooltip(
          `<strong>${route.name}</strong><br/>Capacidade: ${route.capacity.toLocaleString()} pessoas<br/>Tempo: ${route.estimatedTime} min<br/>Status: <span style="color:${routeStatusColors[route.status]}">${route.status.toUpperCase()}</span>`,
          { sticky: true, className: "dark-tooltip" }
        );
        polyline.addTo(routeLayer);

        // Arrow markers along route
        if (route.points.length >= 2) {
          const midIdx = Math.floor(route.points.length / 2);
          const mid = route.points[midIdx];
          const arrowIcon = L.divIcon({
            html: `<div style="color:${routeStatusColors[route.status]};font-size:18px;font-weight:bold;text-shadow:0 1px 2px rgba(0,0,0,0.5)">➤</div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            className: "",
          });
          L.marker(mid, { icon: arrowIcon }).addTo(routeLayer);
        }
      });
      routeLayer.addTo(mapRef.current);
      layersRef.current.push(routeLayer);
    }

    // --- Heatmap (simulated with circles) ---
    if (showHeatmap) {
      const heatLayer = L.layerGroup();
      const heatPoints: [number, number, number][] = [
        [-15.836, -48.054, 0.9], [-15.830, -48.050, 0.7], [-15.840, -48.060, 0.8],
        [-15.785, -47.995, 0.6], [-15.790, -47.998, 0.5],
        [-15.820, -48.105, 0.7], [-15.825, -48.110, 0.6],
        [-15.803, -47.965, 0.4], [-15.810, -47.870, 0.3],
      ];
      heatPoints.forEach(([lat, lng, intensity]) => {
        L.circle([lat, lng], {
          radius: 800 + intensity * 1200,
          color: "transparent",
          fillColor: intensity > 0.7 ? "#ef4444" : intensity > 0.5 ? "#f97316" : "#f59e0b",
          fillOpacity: intensity * 0.35,
        }).addTo(heatLayer);
      });
      heatLayer.addTo(mapRef.current);
      layersRef.current.push(heatLayer);
    }

    // --- Sensors layer ---
    const sensorLayer = L.layerGroup();
    sensors.forEach((sensor) => {
      const marker = L.marker([sensor.lat, sensor.lng], { icon: getSensorIcon(sensor.status) });
      marker.on("click", () => onSelectSensor(sensor));
      marker.bindTooltip(
        `<strong>${sensor.name}</strong><br/><span style="font-size:13px;font-weight:bold">${sensor.value} ${sensor.unit}</span><br/>Status: ${sensor.status}`,
        { direction: "top", offset: [0, -10], className: "dark-tooltip" }
      );
      marker.addTo(sensorLayer);
    });
    sensorLayer.addTo(mapRef.current);
    layersRef.current.push(sensorLayer);

    // --- Infrastructure layer ---
    const infraLayer = L.layerGroup();
    infrastructures.forEach((infra) => {
      const marker = L.marker([infra.lat, infra.lng], { icon: getInfraIcon(infra.condition) });
      marker.on("click", () => onSelectInfrastructure(infra));
      marker.bindTooltip(
        `<strong>${infra.name}</strong><br/>Condição: ${infra.condition}<br/>Risco: ${infra.riskScore}/100`,
        { direction: "top", offset: [0, -12], className: "dark-tooltip" }
      );
      marker.addTo(infraLayer);
    });
    infraLayer.addTo(mapRef.current);
    layersRef.current.push(infraLayer);

    // --- Alerts layer ---
    const alertLayer = L.layerGroup();
    alerts.forEach((alert) => {
      const marker = L.marker([alert.coordinates.lat, alert.coordinates.lng], { icon: getAlertIcon(alert.severity) });
      marker.on("click", () => onSelectAlert(alert));
      marker.bindTooltip(
        `<strong>${alert.title}</strong><br/>${alert.location}<br/>Severidade: ${alert.severity.toUpperCase()}`,
        { direction: "top", offset: [0, -14], className: "dark-tooltip" }
      );
      marker.addTo(alertLayer);
    });
    alertLayer.addTo(mapRef.current);
    layersRef.current.push(alertLayer);
  }, [sensors, infrastructures, alerts, riskZones, evacuationRoutes, showRiskZones, showEvacRoutes, showHeatmap, onSelectSensor, onSelectInfrastructure, onSelectAlert]);

  // Search marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    if (searchCoords) {
      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#f97316;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.5);transform:rotate(-45deg)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "",
      });
      searchMarkerRef.current = L.marker(searchCoords, { icon }).addTo(mapRef.current);
      mapRef.current.setView(searchCoords, 15, { animate: true });
    }
  }, [searchCoords]);

  // Custom route line
  useEffect(() => {
    if (!mapRef.current) return;
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    if (routePoints && routePoints.length >= 2) {
      routeLineRef.current = L.polyline(routePoints, {
        color: "#f97316",
        weight: 5,
        opacity: 0.9,
        dashArray: "10 6",
      }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });
    }
  }, [routePoints]);

  return (
    <>
      <style>{`
        .dark-tooltip {
          background: rgba(20, 21, 31, 0.95) !important;
          border: 1px solid rgba(38, 39, 58, 0.8) !important;
          color: #e6e6f0 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .dark-tooltip::before {
          border-top-color: rgba(20, 21, 31, 0.95) !important;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full" style={{ background: "#0c0d14" }} />
    </>
  );
}
