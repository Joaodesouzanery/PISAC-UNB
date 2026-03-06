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

// --- Crisis Management Types ---
export type CrisisStatus = "active" | "monitoring" | "resolved" | "escalated";
export type CrisisLevel = "level_1" | "level_2" | "level_3" | "level_4";
export type IncidentStatus = "open" | "in_progress" | "resolved" | "escalated";
export type IncidentPriority = "low" | "medium" | "high" | "critical";

export interface Crisis {
  id: string;
  title: string;
  description: string;
  status: CrisisStatus;
  level: CrisisLevel;
  startTime: string;
  endTime?: string;
  leadAgency: string;
  affectedMunicipalities: string[];
  incidents: string[]; // incident IDs
  coordinationChannelId: string;
}

export interface Municipality {
  id: string;
  name: string;
  state: string;
  population: number;
  lat: number;
  lng: number;
  status: "normal" | "alert" | "crisis" | "recovery";
  activeCrises: number;
  activeIncidents: number;
  resourcesAvailable: number; // percentage
  lastUpdate: string;
}

export interface Incident {
  id: string;
  crisisId: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  assignedTo: string;
  assignedAgency: string;
  municipality: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  location: string;
  tags: string[];
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  timestamp: string;
  author: string;
  agency: string;
  message: string;
  type: "status_change" | "comment" | "resource_update" | "escalation" | "situation_report";
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: "crisis_room" | "inter_municipal" | "agency" | "field_ops";
  participants: ChannelParticipant[];
  messages: ChannelMessage[];
  crisisId?: string;
  isActive: boolean;
}

export interface ChannelParticipant {
  id: string;
  name: string;
  role: string;
  agency: string;
  municipality: string;
  isOnline: boolean;
}

export interface ChannelMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAgency: string;
  content: string;
  timestamp: string;
  type: "text" | "alert" | "resource_request" | "situation_report" | "decision";
  priority?: "normal" | "urgent";
}

export interface CrisisResource {
  id: string;
  type: string;
  name: string;
  quantity: number;
  available: number;
  allocated: number;
  municipality: string;
  status: "available" | "deployed" | "in_transit" | "maintenance";
  location: string;
  lastUpdate: string;
}

export interface ContingencyPlan {
  id: string;
  title: string;
  type: string;
  description: string;
  lastUpdated: string;
  author: string;
  municipality: string;
  version: string;
  tags: string[];
  lessonsLearned: string[];
}

export interface InterMunicipalMetrics {
  municipalityId: string;
  municipalityName: string;
  responseTimeMinutes: number;
  activeIncidents: number;
  resolvedLast24h: number;
  resourceUtilization: number;
  communicationScore: number;
  overallReadiness: number;
}

// --- Navigation ---
export type ModulePage =
  | "dashboard"
  | "map"
  | "analysis"
  | "simulation"
  | "monitoring"
  | "budget"
  | "crisis";
