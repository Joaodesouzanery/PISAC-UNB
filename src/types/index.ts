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

// --- Budget Analysis Types ---
export type InvestmentHorizon = "short" | "medium" | "long";
export type InvestmentCategory =
  | "infrastructure"
  | "technology"
  | "social"
  | "environmental"
  | "institutional";

export interface CostBenefitAnalysis {
  id: string;
  projectName: string;
  category: InvestmentCategory;
  description: string;
  initialInvestment: number;
  annualMaintenanceCost: number;
  horizon: InvestmentHorizon;
  horizonYears: number;
  benefits: {
    avoidedLosses: number;
    socialBenefit: number;
    economicGrowth: number;
    environmentalBenefit: number;
  };
  npv: number; // Net Present Value
  bcr: number; // Benefit-Cost Ratio
  irr: number; // Internal Rate of Return (%)
  paybackYears: number;
  riskReduction: number; // percentage
  relatedScenarios: string[];
  status: "draft" | "under_review" | "approved" | "rejected";
}

export interface DisasterFinancialScenario {
  id: string;
  name: string;
  description: string;
  scenarioType: string;
  probability: number;
  recurrence: string; // e.g., "1 em 50 anos"
  directCosts: {
    infrastructure: number;
    emergency: number;
    healthcare: number;
    housing: number;
    environment: number;
  };
  indirectCosts: {
    economicDisruption: number;
    productivityLoss: number;
    taxRevenueLoss: number;
    socialImpact: number;
  };
  fundingSources: {
    municipalBudget: number;
    stateTransfer: number;
    federalAid: number;
    insurance: number;
    internationalAid: number;
    creditLines: number;
  };
  recoveryTimeMonths: number;
  budgetImpactPercent: number;
  fiscalRiskRating: "low" | "moderate" | "high" | "critical";
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  category: InvestmentCategory;
  priority: number; // 1-100
  totalCost: number;
  yearlyAllocation: { year: number; amount: number }[];
  expectedBenefits: number;
  riskScore: number;
  dependencies: string[];
  status: "planned" | "approved" | "in_execution" | "completed" | "deferred";
  startYear: number;
  endYear: number;
  fundingSource: string;
  kpis: { name: string; target: number; current: number; unit: string }[];
}

export interface BudgetReport {
  id: string;
  title: string;
  type: "cost_benefit" | "impact_analysis" | "investment_plan" | "accountability" | "funding_request";
  generatedAt: string;
  period: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  status: "draft" | "final" | "submitted";
  targetAudience: string;
}

// --- GovTech Governance Types ---
export type UserRoleLevel = "admin" | "manager" | "analyst" | "operator" | "viewer" | "field_agent";
export type DataClassification = "public" | "internal" | "confidential" | "restricted";
export type ComplianceStatus = "compliant" | "partial" | "non_compliant" | "under_review";
export type AuditActionType =
  | "login"
  | "logout"
  | "data_access"
  | "data_export"
  | "data_modify"
  | "report_generate"
  | "alert_acknowledge"
  | "config_change"
  | "permission_change"
  | "crisis_action"
  | "api_call";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleLevel;
  agency: string;
  municipality: string;
  isActive: boolean;
  lastLogin: string;
  mfaEnabled: boolean;
  permissions: Permission[];
  dataAccess: DataClassification[];
}

export interface Permission {
  module: string;
  actions: ("read" | "write" | "delete" | "export" | "admin")[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRoleLevel;
  agency: string;
  action: AuditActionType;
  module: string;
  resource: string;
  details: string;
  ipAddress: string;
  success: boolean;
  riskLevel: "low" | "medium" | "high";
  dataClassification?: DataClassification;
}

export interface LGPDRecord {
  id: string;
  category: string;
  dataType: string;
  purpose: string;
  legalBasis: string;
  retentionPeriod: string;
  classification: DataClassification;
  anonymized: boolean;
  consentRequired: boolean;
  dpia: boolean; // Data Protection Impact Assessment
  status: ComplianceStatus;
  lastAudit: string;
  responsibleOfficer: string;
}

export interface EPingStandard {
  id: string;
  category: "interconnection" | "security" | "integration" | "data_organization" | "content_access";
  name: string;
  description: string;
  standard: string;
  implementationStatus: ComplianceStatus;
  adoptedTechnology: string;
  notes: string;
}

export interface APIEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  module: string;
  version: string;
  authentication: "api_key" | "oauth2" | "jwt" | "gov_br";
  rateLimit: string;
  dataClassification: DataClassification;
  ePingCompliant: boolean;
  responseFormat: string;
  status: "active" | "beta" | "deprecated" | "planned";
}

export interface MicroserviceNode {
  id: string;
  name: string;
  description: string;
  technology: string;
  status: "running" | "degraded" | "offline" | "maintenance";
  instances: number;
  cpu: number;
  memory: number;
  requestsPerMin: number;
  errorRate: number;
  dependencies: string[];
  tier: "frontend" | "api_gateway" | "service" | "data" | "infrastructure";
}

export interface ComplianceMetric {
  category: string;
  total: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  lastAssessment: string;
}

// --- Navigation ---
export type ModulePage =
  | "dashboard"
  | "map"
  | "analysis"
  | "simulation"
  | "monitoring"
  | "budget"
  | "crisis"
  | "budget_analysis"
  | "governance";
