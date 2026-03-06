// ============================================================
// Hydrological Simulation & What-If Engine
// ============================================================

export interface HydrologicalParams {
  rainfall: number; // mm/h
  duration: number; // hours
  soilSaturation: number; // 0-100%
  drainageCapacity: number; // 0-100% of design capacity
  urbanImpermeability: number; // 0-100%
  riverBaseLevel: number; // meters
  basinArea: number; // km²
}

export interface SimulationResult {
  timeSteps: SimulationTimeStep[];
  peakFlow: number; // m³/s
  peakLevel: number; // meters
  timeToFlood: number; // hours (0 if no flood)
  floodDuration: number; // hours
  floodedArea: number; // km²
  maxDepth: number; // meters
  totalVolume: number; // m³
}

export interface SimulationTimeStep {
  hour: number;
  rainfall: number; // mm
  runoff: number; // m³/s
  riverLevel: number; // meters
  floodExtent: number; // km²
  drainageLoad: number; // % of capacity
  status: "normal" | "warning" | "critical" | "flood";
}

export interface SocialImpact {
  populationAffected: number;
  householdsDisplaced: number;
  schoolsClosed: number;
  hospitalsBurdened: number;
  criticalInfraAffected: number;
  waterSupplyDisrupted: boolean;
  powerOutageHouseholds: number;
  transitDisruptionPeople: number;
  vulnerablePopulation: number;
  shelterCapacity: number;
  shelterDemand: number;
}

export interface EconomicImpact {
  directInfraDamage: number;
  residentialDamage: number;
  commercialLoss: number;
  industrialLoss: number;
  transportDisruption: number;
  publicServiceCost: number;
  emergencyResponseCost: number;
  cleanupCost: number;
  healthcareCost: number;
  productivityLoss: number;
  totalCost: number;
  gdpImpactPercent: number;
  recoveryMonths: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  category: "mitigation" | "adaptation" | "response" | "prevention";
  parameters: WhatIfParameter[];
  baselineResult: SimulationResult;
  modifiedResult: SimulationResult;
  socialBaseline: SocialImpact;
  socialModified: SocialImpact;
  economicBaseline: EconomicImpact;
  economicModified: EconomicImpact;
  costOfIntervention: number;
  riskReduction: number; // %
  benefitCostRatio: number;
}

export interface WhatIfParameter {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  currentValue: number;
  description: string;
}

// Default hydrological parameters for Brasília DF
const defaultParams: HydrologicalParams = {
  rainfall: 60,
  duration: 6,
  soilSaturation: 70,
  drainageCapacity: 65,
  urbanImpermeability: 55,
  riverBaseLevel: 3.2,
  basinArea: 45,
};

// What-if parameter templates
export const whatIfParameters: WhatIfParameter[] = [
  { id: "p1", name: "Intensidade da Chuva", unit: "mm/h", min: 10, max: 150, step: 5, defaultValue: 60, currentValue: 60, description: "Intensidade máxima de precipitação" },
  { id: "p2", name: "Duração do Evento", unit: "horas", min: 1, max: 24, step: 1, defaultValue: 6, currentValue: 6, description: "Duração total da precipitação" },
  { id: "p3", name: "Saturação do Solo", unit: "%", min: 0, max: 100, step: 5, defaultValue: 70, currentValue: 70, description: "Nível de saturação pré-evento" },
  { id: "p4", name: "Capacidade de Drenagem", unit: "%", min: 20, max: 100, step: 5, defaultValue: 65, currentValue: 65, description: "Capacidade operacional do sistema de drenagem" },
  { id: "p5", name: "Impermeabilização", unit: "%", min: 20, max: 90, step: 5, defaultValue: 55, currentValue: 55, description: "Percentual de área impermeável" },
  { id: "p6", name: "Muro de Contenção", unit: "m", min: 0, max: 3, step: 0.5, defaultValue: 0, currentValue: 0, description: "Altura de muro de contenção adicional" },
  { id: "p7", name: "Área de Piscinões", unit: "mil m³", min: 0, max: 500, step: 50, defaultValue: 0, currentValue: 0, description: "Volume de reservatórios de amortecimento" },
  { id: "p8", name: "Evacuação Preventiva", unit: "%", min: 0, max: 100, step: 10, defaultValue: 0, currentValue: 0, description: "Percentual de população evacuada previamente" },
];

// Run hydrological simulation
export function runHydrologicalSimulation(params: Partial<HydrologicalParams> = {}): SimulationResult {
  const p = { ...defaultParams, ...params };
  const timeSteps: SimulationTimeStep[] = [];
  const totalHours = Math.max(p.duration + 6, 12); // sim runs beyond rainfall
  const floodThreshold = 5.0; // meters

  // Rational method coefficient (simplified)
  const C = 0.3 + (p.urbanImpermeability / 100) * 0.5 + (p.soilSaturation / 100) * 0.2;
  const drainFactor = p.drainageCapacity / 100;

  let riverLevel = p.riverBaseLevel;
  let peakFlow = 0;
  let peakLevel = 0;
  let floodStartHour = -1;
  let floodEndHour = -1;
  let maxFloodExtent = 0;
  let maxDepth = 0;
  let totalVolume = 0;

  for (let h = 0; h <= totalHours; h++) {
    // Rainfall intensity profile (triangular hyetograph)
    let rain = 0;
    if (h <= p.duration) {
      const peak = p.duration / 2;
      rain = h <= peak
        ? p.rainfall * (h / peak)
        : p.rainfall * (1 - (h - peak) / (p.duration - peak));
      rain = Math.max(0, rain);
    }

    // Runoff (Q = C * I * A) with drainage factor
    const intensityMs = (rain / 1000) / 3600; // m/s
    const areaM2 = p.basinArea * 1e6;
    const rawRunoff = C * intensityMs * areaM2;
    const drainedRunoff = rawRunoff * (1 - drainFactor * 0.6);
    const runoff = Math.max(0, drainedRunoff);

    // River level response (simplified storage routing)
    const levelRise = (runoff / (p.basinArea * 1000)) * 0.5;
    const naturalDrain = Math.max(0, (riverLevel - p.riverBaseLevel) * 0.08);
    riverLevel = riverLevel + levelRise - naturalDrain;
    riverLevel = Math.max(p.riverBaseLevel * 0.9, riverLevel);

    // Track peaks
    if (runoff > peakFlow) peakFlow = runoff;
    if (riverLevel > peakLevel) peakLevel = riverLevel;

    // Flood calculations
    const isFlooding = riverLevel > floodThreshold;
    let floodExtent = 0;
    if (isFlooding) {
      const excess = riverLevel - floodThreshold;
      floodExtent = excess * 2.5; // km² per meter excess
      maxDepth = Math.max(maxDepth, excess);
      maxFloodExtent = Math.max(maxFloodExtent, floodExtent);
      totalVolume += excess * floodExtent * 1e6 * 0.3; // approximate volume
      if (floodStartHour < 0) floodStartHour = h;
      floodEndHour = h;
    }

    const drainageLoad = Math.min(100, (runoff / (drainFactor * 50 + 1)) * 0.8);

    timeSteps.push({
      hour: h,
      rainfall: Math.round(rain * 10) / 10,
      runoff: Math.round(runoff * 10) / 10,
      riverLevel: Math.round(riverLevel * 100) / 100,
      floodExtent: Math.round(floodExtent * 100) / 100,
      drainageLoad: Math.min(100, Math.round(drainageLoad * 10) / 10),
      status: riverLevel > floodThreshold ? "flood"
        : riverLevel > floodThreshold * 0.85 ? "critical"
        : riverLevel > floodThreshold * 0.7 ? "warning"
        : "normal",
    });
  }

  return {
    timeSteps,
    peakFlow: Math.round(peakFlow * 10) / 10,
    peakLevel: Math.round(peakLevel * 100) / 100,
    timeToFlood: floodStartHour >= 0 ? floodStartHour : 0,
    floodDuration: floodStartHour >= 0 ? floodEndHour - floodStartHour : 0,
    floodedArea: Math.round(maxFloodExtent * 100) / 100,
    maxDepth: Math.round(maxDepth * 100) / 100,
    totalVolume: Math.round(totalVolume),
  };
}

// Calculate social impact from simulation results
export function calculateSocialImpact(result: SimulationResult, evacuationPct: number = 0): SocialImpact {
  const popDensity = 8500; // people per km²
  const totalAffected = Math.round(result.floodedArea * popDensity);
  const remaining = Math.round(totalAffected * (1 - evacuationPct / 100));

  return {
    populationAffected: remaining,
    householdsDisplaced: Math.round(remaining / 3.5),
    schoolsClosed: Math.min(12, Math.round(result.floodedArea * 2.5)),
    hospitalsBurdened: Math.min(4, Math.round(result.floodedArea * 0.8)),
    criticalInfraAffected: Math.min(8, Math.round(result.floodedArea * 1.5)),
    waterSupplyDisrupted: result.maxDepth > 0.5,
    powerOutageHouseholds: Math.round(remaining * 0.4),
    transitDisruptionPeople: Math.round(remaining * 2.5),
    vulnerablePopulation: Math.round(remaining * 0.22),
    shelterCapacity: 8000,
    shelterDemand: Math.round(remaining * 0.3),
  };
}

// Calculate economic impact from simulation results
export function calculateEconomicImpact(result: SimulationResult, social: SocialImpact): EconomicImpact {
  const depthFactor = Math.max(0.1, result.maxDepth);
  const areaFactor = Math.max(0.1, result.floodedArea);

  const directInfraDamage = Math.round(areaFactor * depthFactor * 15000000);
  const residentialDamage = Math.round(social.householdsDisplaced * 25000);
  const commercialLoss = Math.round(areaFactor * depthFactor * 8000000);
  const industrialLoss = Math.round(areaFactor * depthFactor * 5000000);
  const transportDisruption = Math.round(social.transitDisruptionPeople * 150 * result.floodDuration);
  const publicServiceCost = Math.round(areaFactor * 3000000);
  const emergencyResponseCost = Math.round(social.populationAffected * 200);
  const cleanupCost = Math.round(areaFactor * depthFactor * 2000000);
  const healthcareCost = Math.round(social.vulnerablePopulation * 800);
  const productivityLoss = Math.round(social.transitDisruptionPeople * 250 * Math.min(30, result.floodDuration * 3));

  const totalCost = directInfraDamage + residentialDamage + commercialLoss + industrialLoss +
    transportDisruption + publicServiceCost + emergencyResponseCost + cleanupCost +
    healthcareCost + productivityLoss;

  const regionalGDP = 280000000000; // DF GDP ~R$280B
  const gdpImpactPercent = Math.round((totalCost / regionalGDP) * 10000) / 100;
  const recoveryMonths = Math.round(Math.max(1, depthFactor * areaFactor * 3));

  return {
    directInfraDamage,
    residentialDamage,
    commercialLoss,
    industrialLoss,
    transportDisruption,
    publicServiceCost,
    emergencyResponseCost,
    cleanupCost,
    healthcareCost,
    productivityLoss,
    totalCost,
    gdpImpactPercent,
    recoveryMonths,
  };
}

// Pre-built what-if scenarios
export const whatIfScenarios: { id: string; name: string; description: string; category: WhatIfScenario["category"]; paramOverrides: Record<string, number> }[] = [
  {
    id: "wif1",
    name: "Construção de Piscinões",
    description: "Simular impacto de reservatórios de amortecimento de 200 mil m³ em Taguatinga",
    category: "mitigation",
    paramOverrides: { p7: 200, p4: 80 },
  },
  {
    id: "wif2",
    name: "Evento Extremo (100 anos)",
    description: "Precipitação extrema de 120mm/h por 4 horas com solo saturado",
    category: "prevention",
    paramOverrides: { p1: 120, p2: 4, p3: 95 },
  },
  {
    id: "wif3",
    name: "Ampliação da Drenagem",
    description: "Aumentar capacidade do sistema de drenagem para 90% do projeto",
    category: "adaptation",
    paramOverrides: { p4: 90 },
  },
  {
    id: "wif4",
    name: "Evacuação Preventiva",
    description: "Evacuação de 70% da população em áreas de risco antes do evento",
    category: "response",
    paramOverrides: { p8: 70 },
  },
  {
    id: "wif5",
    name: "Cenário Combinado Ótimo",
    description: "Piscinões + drenagem ampliada + contenção + evacuação parcial",
    category: "mitigation",
    paramOverrides: { p4: 90, p6: 1.5, p7: 300, p8: 50 },
  },
];
