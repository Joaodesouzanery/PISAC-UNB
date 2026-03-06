// ============================================================
// Real-Time Data Simulation Service
// Simulates feeds from CEMADEN, INMET, and IoT sensor networks
// ============================================================

import type { Sensor, Alert, AlertSeverity } from "@/types";
import { sensors as baseSensors, alerts as baseAlerts } from "@/data/mock-data";

// --- Sensor real-time simulation ---

function jitter(value: number, range: number): number {
  return value + (Math.random() - 0.5) * 2 * range;
}

export function simulateSensorUpdate(sensor: Sensor): Sensor {
  const rangeMap: Record<string, number> = {
    river_level: 0.15,
    rain_gauge: 5,
    air_quality: 4,
    traffic: 3,
    structural: 0.005,
    temperature: 0.3,
    humidity: 2,
  };
  const range = rangeMap[sensor.type] ?? 1;
  const newValue = Math.max(0, jitter(sensor.value, range));

  let status = sensor.status;
  if (newValue >= sensor.thresholds.critical) status = "critical";
  else if (newValue >= sensor.thresholds.warning) status = "warning";
  else status = "online";

  // 1% chance of going offline
  if (Math.random() < 0.01) status = "offline";

  return {
    ...sensor,
    value: Math.round(newValue * 100) / 100,
    status,
    lastUpdate: new Date().toISOString(),
  };
}

export function getRealtimeSensors(prevSensors?: Sensor[]): Sensor[] {
  const base = prevSensors ?? baseSensors;
  return base.map(simulateSensorUpdate);
}

// --- Anomaly detection (simple z-score based) ---

interface AnomalyResult {
  sensorId: string;
  sensorName: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number; // standard deviations
  severity: AlertSeverity;
  timestamp: string;
}

const sensorHistory: Map<string, number[]> = new Map();
const HISTORY_WINDOW = 30;

export function detectAnomalies(sensors: Sensor[]): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];

  for (const sensor of sensors) {
    if (sensor.status === "offline") continue;

    const history = sensorHistory.get(sensor.id) ?? [];
    history.push(sensor.value);
    if (history.length > HISTORY_WINDOW) history.shift();
    sensorHistory.set(sensor.id, history);

    if (history.length < 5) continue;

    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((a, b) => a + (b - mean) ** 2, 0) / history.length;
    const std = Math.sqrt(variance);
    if (std === 0) continue;

    const zScore = Math.abs((sensor.value - mean) / std);

    if (zScore > 2) {
      const severity: AlertSeverity =
        zScore > 3.5 ? "emergency" : zScore > 3 ? "critical" : "warning";
      anomalies.push({
        sensorId: sensor.id,
        sensorName: sensor.name,
        metric: sensor.type,
        value: sensor.value,
        expected: Math.round(mean * 100) / 100,
        deviation: Math.round(zScore * 100) / 100,
        severity,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return anomalies;
}

// --- Dynamic alerts from anomalies ---

let alertIdCounter = 100;

export function generateDynamicAlerts(
  anomalies: AnomalyResult[],
  existingAlerts: Alert[]
): Alert[] {
  const newAlerts: Alert[] = [];

  for (const anomaly of anomalies) {
    // Check if an alert for this sensor already exists
    const exists = existingAlerts.some(
      (a) => a.sensorId === anomaly.sensorId && a.isActive
    );
    if (exists) continue;

    const sensor = baseSensors.find((s) => s.id === anomaly.sensorId);
    if (!sensor) continue;

    alertIdCounter++;
    newAlerts.push({
      id: `auto-${alertIdCounter}`,
      title: `Anomalia: ${sensor.name}`,
      description: `Valor ${anomaly.value} ${sensor.unit} detectado (esperado: ~${anomaly.expected} ${sensor.unit}). Desvio de ${anomaly.deviation}σ.`,
      severity: anomaly.severity,
      category: sensor.type === "river_level" || sensor.type === "rain_gauge" ? "flood" :
                sensor.type === "air_quality" ? "air_quality" :
                sensor.type === "traffic" ? "traffic" :
                sensor.type === "structural" ? "structural" : "general",
      timestamp: anomaly.timestamp,
      location: sensor.name.split(" - ")[1] ?? sensor.name,
      coordinates: { lat: sensor.lat, lng: sensor.lng },
      isActive: true,
      sensorId: sensor.id,
    });
  }

  return newAlerts;
}

// --- Predictive models (simplified) ---

export interface PredictionPoint {
  hour: string;
  actual?: number;
  predicted: number;
  lower: number;
  upper: number;
}

export interface FloodPrediction {
  region: string;
  probability: number;
  trend: "rising" | "stable" | "falling";
  nextPeak: string;
  estimatedLevel: number;
  threshold: number;
  timeline: PredictionPoint[];
}

export function generateFloodPrediction(): FloodPrediction[] {
  const now = new Date();
  const regions = [
    { name: "Rio Descoberto", baseLevel: 5.1, threshold: 7.0, baseProbability: 0.35 },
    { name: "Rio Paranoá", baseLevel: 3.2, threshold: 5.5, baseProbability: 0.12 },
    { name: "Córrego Taguatinga", baseLevel: 1.8, threshold: 3.0, baseProbability: 0.45 },
  ];

  return regions.map((region) => {
    const timeline: PredictionPoint[] = [];
    let level = region.baseLevel;
    const trendFactor = 0.05 + Math.random() * 0.1;
    const peakHour = 4 + Math.floor(Math.random() * 8);

    for (let h = 0; h < 24; h++) {
      const hour = new Date(now.getTime() + h * 3600000);
      const hourStr = hour.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      // Simulate rising then falling pattern
      const distFromPeak = Math.abs(h - peakHour);
      const change = trendFactor * Math.max(0, peakHour - distFromPeak) / peakHour;
      level = region.baseLevel + change * (region.threshold - region.baseLevel) * 0.6;
      level += (Math.random() - 0.5) * 0.1;

      const uncertainty = 0.1 + h * 0.05;
      timeline.push({
        hour: hourStr,
        actual: h < 2 ? Math.round(level * 100) / 100 : undefined,
        predicted: Math.round(level * 100) / 100,
        lower: Math.round((level - uncertainty) * 100) / 100,
        upper: Math.round((level + uncertainty) * 100) / 100,
      });
    }

    const peakLevel = Math.max(...timeline.map((t) => t.predicted));
    const prob = Math.min(0.95, region.baseProbability + (peakLevel / region.threshold) * 0.3);

    return {
      region: region.name,
      probability: Math.round(prob * 100) / 100,
      trend: peakLevel > region.baseLevel * 1.1 ? "rising" : peakLevel < region.baseLevel * 0.95 ? "falling" : "stable",
      nextPeak: timeline[peakHour]?.hour ?? "N/A",
      estimatedLevel: Math.round(peakLevel * 100) / 100,
      threshold: region.threshold,
      timeline,
    };
  });
}

// --- CEMADEN/INMET simulated feed ---

export interface WeatherForecast {
  hour: string;
  precipitation: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: "clear" | "cloudy" | "rain" | "storm" | "heavy_storm";
}

export function generateWeatherForecast(): WeatherForecast[] {
  const now = new Date();
  const forecasts: WeatherForecast[] = [];

  let precipitation = 5;
  let temperature = 28;
  const stormPeak = 6 + Math.floor(Math.random() * 6);

  for (let h = 0; h < 24; h++) {
    const hour = new Date(now.getTime() + h * 3600000);
    const hourStr = hour.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const distFromStorm = Math.abs(h - stormPeak);
    precipitation = Math.max(0, 40 * Math.exp(-0.3 * distFromStorm) + (Math.random() - 0.3) * 10);
    temperature = 28 - precipitation * 0.15 + (Math.random() - 0.5) * 2;
    const humidity = Math.min(100, 60 + precipitation * 0.8 + (Math.random() - 0.5) * 5);
    const windSpeed = 10 + precipitation * 0.5 + (Math.random() - 0.5) * 8;

    let condition: WeatherForecast["condition"] = "clear";
    if (precipitation > 30) condition = "heavy_storm";
    else if (precipitation > 20) condition = "storm";
    else if (precipitation > 5) condition = "rain";
    else if (humidity > 75) condition = "cloudy";

    forecasts.push({
      hour: hourStr,
      precipitation: Math.round(precipitation * 10) / 10,
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      condition,
    });
  }

  return forecasts;
}

// --- Risk score timeline ---

export interface RiskTimelinePoint {
  time: string;
  flood: number;
  structural: number;
  landslide: number;
  overall: number;
}

export function generateRiskTimeline(): RiskTimelinePoint[] {
  const now = new Date();
  const points: RiskTimelinePoint[] = [];
  let floodRisk = 45;
  let structuralRisk = 30;
  let landslideRisk = 35;

  for (let h = 0; h < 24; h++) {
    const hour = new Date(now.getTime() + h * 3600000);
    const hourStr = hour.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    floodRisk = Math.max(10, Math.min(95, floodRisk + (Math.random() - 0.4) * 8));
    structuralRisk = Math.max(10, Math.min(80, structuralRisk + (Math.random() - 0.5) * 3));
    landslideRisk = Math.max(10, Math.min(90, landslideRisk + (Math.random() - 0.45) * 6));
    const overall = floodRisk * 0.4 + structuralRisk * 0.25 + landslideRisk * 0.35;

    points.push({
      time: hourStr,
      flood: Math.round(floodRisk),
      structural: Math.round(structuralRisk),
      landslide: Math.round(landslideRisk),
      overall: Math.round(overall),
    });
  }

  return points;
}
