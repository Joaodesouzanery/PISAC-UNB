// ============================================================
// Centro de Comando de Resiliência Municipal - Type Definitions
// ============================================================

// --- Sensor & IoT Types ---
export type SensorType =
  | "river_level"
  | "rain_gauge"
  | "air_quality"
  | "traffic"
  | "structural"
  | "temperature"
  | "humidity"
  | "seismic";

export type SensorStatus = "online" | "offline" | "warning" | "critical";

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  lat: number;
  lng: number;
  value: number;
  unit: string;
  status: SensorStatus;
  lastUpdate: string;
  thresholds: {
    warning: number;
    critical: number;
  };
}

// --- Alert Types ---
export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type AlertCategory =
  | "flood"
  | "landslide"
  | "structural"
  | "air_quality"
  | "traffic"
  | "weather"
  | "general";

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: string;
  location: string;
  coordinates: { lat: number; lng: number };
  isActive: boolean;
  affectedPopulation?: number;
  sensorId?: string;
}

// --- Infrastructure / BIM Types ---
export type InfrastructureType =
  | "bridge"
  | "public_building"
  | "sanitation"
  | "road"
  | "dam"
  | "hospital"
  | "school"
  | "power_station";

export type StructuralCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "critical";

export interface Infrastructure {
  id: string;
  name: string;
  type: InfrastructureType;
  lat: number;
  lng: number;
  condition: StructuralCondition;
  lastInspection: string;
  yearBuilt: number;
  capacity?: number;
  bimModelUrl?: string;
  riskScore: number; // 0-100
  sensors: string[]; // sensor IDs
}

// --- Risk Simulation Types ---
export type ScenarioType =
  | "flood"
  | "landslide"
  | "structural_failure"
  | "service_disruption"
  | "earthquake"
  | "drought";

export interface RiskScenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  probability: number; // 0-1
  severity: number; // 1-10
  affectedAreas: AffectedArea[];
  estimatedCost: number;
  estimatedPopulationAffected: number;
  evacuationRoutes: EvacuationRoute[];
  requiredResources: Resource[];
}

export interface AffectedArea {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  impactLevel: "low" | "medium" | "high" | "extreme";
  populationDensity: number;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  path: { lat: number; lng: number }[];
  capacity: number;
  estimatedTime: number; // in minutes
}

export interface Resource {
  type: string;
  quantity: number;
  available: number;
  unit: string;
}

// --- Budget Types ---
export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  committed: number;
  year: number;
}

export interface MitigationInvestment {
  id: string;
  name: string;
  description: string;
  estimatedCost: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "proposed" | "approved" | "in_progress" | "completed";
  expectedRiskReduction: number; // percentage
  relatedScenarios: string[];
  roi: number; // return on investment ratio
}

export interface FinancialImpact {
  scenarioId: string;
  directCost: number;
  indirectCost: number;
  recoveryTime: number; // months
  insuranceCoverage: number;
  federalAid: number;
}

// --- Dashboard Types ---
export interface DashboardMetric {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: string;
  status?: "normal" | "warning" | "critical";
}

// --- Data Analysis Types ---
export interface VulnerabilityAssessment {
  areaId: string;
  areaName: string;
  overallScore: number; // 0-100
  factors: {
    environmental: number;
    structural: number;
    social: number;
    economic: number;
  };
  trend: "improving" | "stable" | "worsening";
  recommendations: string[];
}

export interface HistoricalEvent {
  id: string;
  date: string;
  type: AlertCategory;
  description: string;
  severity: AlertSeverity;
  cost: number;
  affectedPopulation: number;
  lessonsLearned: string[];
}

// --- Navigation ---
export type ModulePage =
  | "dashboard"
  | "map"
  | "analysis"
  | "simulation"
  | "monitoring"
  | "budget";
