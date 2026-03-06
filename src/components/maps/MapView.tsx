"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Sensor, Infrastructure, Alert } from "@/types";

interface MapViewProps {
  sensors: Sensor[];
  infrastructures: Infrastructure[];
  alerts: Alert[];
  onSelectSensor: (sensor: Sensor) => void;
  onSelectInfrastructure: (infra: Infrastructure) => void;
  onSelectAlert: (alert: Alert) => void;
}

function getSensorIcon(status: string): L.DivIcon {
  const colors: Record<string, string> = {
    online: "#22c55e",
    warning: "#f59e0b",
    critical: "#ef4444",
    offline: "#94a3b8",
  };
  const color = colors[status] || "#94a3b8";
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: "",
  });
}

function getInfraIcon(condition: string): L.DivIcon {
  const colors: Record<string, string> = {
    excellent: "#22c55e",
    good: "#3b82f6",
    fair: "#f59e0b",
    poor: "#f97316",
    critical: "#ef4444",
  };
  const color = colors[condition] || "#94a3b8";
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:3px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: "",
  });
}

function getAlertIcon(severity: string): L.DivIcon {
  const sizes: Record<string, number> = {
    emergency: 24,
    critical: 20,
    warning: 16,
    info: 14,
  };
  const colors: Record<string, string> = {
    emergency: "#dc2626",
    critical: "#f97316",
    warning: "#eab308",
    info: "#3b82f6",
  };
  const size = sizes[severity] || 16;
  const color = colors[severity] || "#3b82f6";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;${severity === "emergency" ? "animation:pulse 1.5s infinite" : ""}">
      <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: "",
  });
}

export default function MapView({
  sensors,
  infrastructures,
  alerts,
  onSelectSensor,
  onSelectInfrastructure,
  onSelectAlert,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [-15.7975, -47.8919],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous layers
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];

    // Sensors layer
    const sensorLayer = L.layerGroup();
    sensors.forEach((sensor) => {
      const marker = L.marker([sensor.lat, sensor.lng], {
        icon: getSensorIcon(sensor.status),
      });
      marker.on("click", () => onSelectSensor(sensor));
      marker.bindTooltip(
        `<strong>${sensor.name}</strong><br/>${sensor.value} ${sensor.unit}`,
        { direction: "top", offset: [0, -8] }
      );
      marker.addTo(sensorLayer);
    });
    sensorLayer.addTo(mapRef.current);
    layersRef.current.push(sensorLayer);

    // Infrastructure layer
    const infraLayer = L.layerGroup();
    infrastructures.forEach((infra) => {
      const marker = L.marker([infra.lat, infra.lng], {
        icon: getInfraIcon(infra.condition),
      });
      marker.on("click", () => onSelectInfrastructure(infra));
      marker.bindTooltip(
        `<strong>${infra.name}</strong><br/>Condição: ${infra.condition} | Risco: ${infra.riskScore}`,
        { direction: "top", offset: [0, -10] }
      );
      marker.addTo(infraLayer);
    });
    infraLayer.addTo(mapRef.current);
    layersRef.current.push(infraLayer);

    // Alerts layer
    const alertLayer = L.layerGroup();
    alerts.forEach((alert) => {
      const marker = L.marker(
        [alert.coordinates.lat, alert.coordinates.lng],
        { icon: getAlertIcon(alert.severity) }
      );
      marker.on("click", () => onSelectAlert(alert));
      marker.bindTooltip(
        `<strong>${alert.title}</strong><br/>${alert.location}`,
        { direction: "top", offset: [0, -12] }
      );
      marker.addTo(alertLayer);
    });
    alertLayer.addTo(mapRef.current);
    layersRef.current.push(alertLayer);
  }, [sensors, infrastructures, alerts, onSelectSensor, onSelectInfrastructure, onSelectAlert]);

  return <div ref={containerRef} className="w-full h-full" />;
}
