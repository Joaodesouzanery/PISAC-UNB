// ============================================================
// Root Cause Analysis & Correlation Engine
// ============================================================

export interface CausalFactor {
  id: string;
  name: string;
  category: "climate" | "infrastructure" | "social" | "environmental" | "operational";
  weight: number; // 0-1 contribution to incident
  confidence: number; // 0-100%
  evidence: string[];
  subFactors?: CausalFactor[];
}

export interface RootCauseAnalysis {
  id: string;
  incidentType: string;
  region: string;
  primaryCause: CausalFactor;
  contributingFactors: CausalFactor[];
  correlationStrength: number; // 0-1
  timeWindow: string;
  recommendation: string;
  urgency: "low" | "medium" | "high" | "critical";
}

export interface CorrelationMatrix {
  variables: string[];
  values: number[][]; // correlation coefficients -1 to 1
}

export interface TrendAnalysis {
  variable: string;
  period: string;
  data: { date: string; value: number; predicted?: number }[];
  trend: "increasing" | "decreasing" | "stable" | "cyclical";
  slope: number;
  r2: number;
  forecast: { date: string; value: number; lower: number; upper: number }[];
}

export interface DashboardWidget {
  id: string;
  type: "line_chart" | "bar_chart" | "radar" | "scatter" | "kpi" | "heatmap" | "gauge" | "table";
  title: string;
  description: string;
  category: "risk" | "sensor" | "infrastructure" | "social" | "financial" | "climate";
  size: "sm" | "md" | "lg";
  dataKey: string;
}

// Available widgets for customizable dashboard
export const availableWidgets: DashboardWidget[] = [
  { id: "w1", type: "line_chart", title: "Tendência de Precipitação", description: "Série temporal de chuvas com previsão", category: "climate", size: "lg", dataKey: "precipitation_trend" },
  { id: "w2", type: "gauge", title: "Índice de Risco Geral", description: "Score composto de risco da região", category: "risk", size: "sm", dataKey: "overall_risk" },
  { id: "w3", type: "radar", title: "Perfil de Vulnerabilidade", description: "Radar multidimensional por região", category: "risk", size: "md", dataKey: "vulnerability_radar" },
  { id: "w4", type: "heatmap", title: "Correlação de Variáveis", description: "Matriz de correlação entre sensores", category: "sensor", size: "lg", dataKey: "correlation_matrix" },
  { id: "w5", type: "bar_chart", title: "Condição de Infraestrutura", description: "Score de condição por ativo", category: "infrastructure", size: "md", dataKey: "infra_condition" },
  { id: "w6", type: "kpi", title: "Sensores Críticos", description: "Contagem de sensores em alerta", category: "sensor", size: "sm", dataKey: "critical_sensors" },
  { id: "w7", type: "scatter", title: "Vulnerabilidade x Impacto", description: "Scatter de vulnerabilidade vs custo histórico", category: "social", size: "md", dataKey: "vuln_vs_impact" },
  { id: "w8", type: "line_chart", title: "Nível dos Rios", description: "Monitoramento de nível com thresholds", category: "sensor", size: "lg", dataKey: "river_levels" },
  { id: "w9", type: "bar_chart", title: "Custos por Tipo de Evento", description: "Distribuição de custos históricos", category: "financial", size: "md", dataKey: "cost_by_event" },
  { id: "w10", type: "kpi", title: "População em Risco", description: "Total de população em áreas de risco", category: "social", size: "sm", dataKey: "population_at_risk" },
  { id: "w11", type: "line_chart", title: "Tendência de Temperatura", description: "Temperatura média com anomalias", category: "climate", size: "md", dataKey: "temp_trend" },
  { id: "w12", type: "table", title: "Ranking de Regiões", description: "Ranking de regiões por vulnerabilidade", category: "risk", size: "lg", dataKey: "region_ranking" },
];

// Root Cause Analysis data (simulated)
export const rootCauseAnalyses: RootCauseAnalysis[] = [
  {
    id: "rca1",
    incidentType: "Inundação",
    region: "Taguatinga",
    primaryCause: {
      id: "f1",
      name: "Drenagem Subdimensionada",
      category: "infrastructure",
      weight: 0.45,
      confidence: 92,
      evidence: [
        "Vazão de projeto 30% abaixo da demanda atual",
        "Análise de capacidade hidráulica NOVACAP 2025",
        "12 eventos de saturação nos últimos 24 meses",
      ],
      subFactors: [
        { id: "f1a", name: "Crescimento urbano não planejado", category: "social", weight: 0.6, confidence: 88, evidence: ["Taxa de impermeabilização +15% em 10 anos"] },
        { id: "f1b", name: "Manutenção deficiente", category: "operational", weight: 0.4, confidence: 85, evidence: ["Apenas 60% das bocas-de-lobo em operação"] },
      ],
    },
    contributingFactors: [
      { id: "f2", name: "Precipitação acima da média", category: "climate", weight: 0.30, confidence: 95, evidence: ["Acumulado 25% acima da média histórica", "La Niña ativo no período"] },
      { id: "f3", name: "Ocupação de áreas de manancial", category: "social", weight: 0.15, confidence: 88, evidence: ["1.200 edificações em APP identificadas", "Redução de 40% na área permeável"] },
      { id: "f4", name: "Assoreamento de córregos", category: "environmental", weight: 0.10, confidence: 78, evidence: ["Perda de 30% da seção transversal", "Erosão em 3 nascentes tributárias"] },
    ],
    correlationStrength: 0.87,
    timeWindow: "Jan 2024 - Mar 2026",
    recommendation: "Ampliação imediata do sistema de macro-drenagem com piscinões e revitalização de córregos",
    urgency: "critical",
  },
  {
    id: "rca2",
    incidentType: "Degradação Estrutural",
    region: "Ponte Costa e Silva",
    primaryCause: {
      id: "f5",
      name: "Fadiga Estrutural por Idade",
      category: "infrastructure",
      weight: 0.50,
      confidence: 95,
      evidence: [
        "Estrutura com 55 anos de operação",
        "Fissuras em 3 de 4 pilares principais",
        "Ensaio de carbonatação: profundidade > 25mm",
      ],
      subFactors: [
        { id: "f5a", name: "Projeto original sem proteção catódica", category: "infrastructure", weight: 0.5, confidence: 90, evidence: ["Norma ABNT da época não exigia"] },
        { id: "f5b", name: "Exposição a ciclos térmicos", category: "environmental", weight: 0.5, confidence: 82, evidence: ["Amplitude térmica diária de 15°C"] },
      ],
    },
    contributingFactors: [
      { id: "f6", name: "Sobrecarga de tráfego", category: "operational", weight: 0.25, confidence: 90, evidence: ["Volume 180% acima do projeto original", "Tráfego pesado 22h/dia"] },
      { id: "f7", name: "Vibração excessiva", category: "environmental", weight: 0.15, confidence: 75, evidence: ["Amplitude de vibração acima do limite NBR 15421", "Sensor S12 acima do threshold 60% do tempo"] },
      { id: "f8", name: "Infiltração por chuvas", category: "climate", weight: 0.10, confidence: 80, evidence: ["Impermeabilização do tabuleiro comprometida", "Manchas de eflorescência em 8 pontos"] },
    ],
    correlationStrength: 0.92,
    timeWindow: "Jun 2023 - Mar 2026",
    recommendation: "Retrofit estrutural urgente com reforço de pilares e substituição do sistema de impermeabilização",
    urgency: "critical",
  },
  {
    id: "rca3",
    incidentType: "Deslizamento",
    region: "Vila Estrutural",
    primaryCause: {
      id: "f9",
      name: "Ocupação de Encostas Instáveis",
      category: "social",
      weight: 0.40,
      confidence: 90,
      evidence: [
        "345 edificações em áreas com declividade > 30%",
        "Solo exposto em 60% da área",
        "Ausência de sistema de drenagem superficial",
      ],
    },
    contributingFactors: [
      { id: "f10", name: "Saturação do solo", category: "climate", weight: 0.30, confidence: 88, evidence: ["Solo com teor de umidade > 85%", "Precipitação acumulada 200mm em 48h"] },
      { id: "f11", name: "Remoção de vegetação", category: "environmental", weight: 0.20, confidence: 85, evidence: ["Perda de 70% da cobertura vegetal original", "Solo sem raízes de ancoragem"] },
      { id: "f12", name: "Disposição inadequada de resíduos", category: "operational", weight: 0.10, confidence: 75, evidence: ["Sobrecarga de aterro em área adjacente", "Lixiviação alterando composição do solo"] },
    ],
    correlationStrength: 0.84,
    timeWindow: "Nov 2024 - Mar 2026",
    recommendation: "Obras de contenção com muro de arrimo, drenagem e realocação de famílias em áreas de risco iminente",
    urgency: "high",
  },
  {
    id: "rca4",
    incidentType: "Desabastecimento de Água",
    region: "Região Oeste",
    primaryCause: {
      id: "f13",
      name: "Vulnerabilidade de Fonte Única",
      category: "infrastructure",
      weight: 0.35,
      confidence: 85,
      evidence: [
        "ETA Descoberto responde por 65% do abastecimento oeste",
        "Sem sistema de backup operacional",
        "Tubulação com idade média de 40 anos",
      ],
    },
    contributingFactors: [
      { id: "f14", name: "Redução de vazão do rio", category: "environmental", weight: 0.25, confidence: 80, evidence: ["Vazão média -18% em relação a 2015", "Desmatamento na bacia de contribuição"] },
      { id: "f15", name: "Demanda crescente", category: "social", weight: 0.25, confidence: 92, evidence: ["Crescimento populacional 3.2% ao ano", "Consumo per capita acima da média"] },
      { id: "f16", name: "Contaminação de mananciais", category: "environmental", weight: 0.15, confidence: 70, evidence: ["3 episódios de turbidez elevada em 12 meses", "Poluição difusa de origem agrícola"] },
    ],
    correlationStrength: 0.78,
    timeWindow: "Jan 2025 - Mar 2026",
    recommendation: "Construção de reservatório de emergência e interligação com sistema do Paranoá",
    urgency: "medium",
  },
];

// Correlation matrix data
export const sensorCorrelationMatrix: CorrelationMatrix = {
  variables: ["Precipitação", "Nível Rio", "Umidade Solo", "Temp.", "Tráfego", "Qualidade Ar"],
  values: [
    [1.00, 0.87, 0.72, -0.35, -0.42, -0.28],
    [0.87, 1.00, 0.68, -0.22, -0.55, -0.15],
    [0.72, 0.68, 1.00, -0.40, -0.18, -0.10],
    [-0.35, -0.22, -0.40, 1.00, 0.45, 0.62],
    [-0.42, -0.55, -0.18, 0.45, 1.00, 0.55],
    [-0.28, -0.15, -0.10, 0.62, 0.55, 1.00],
  ],
};

// Trend analysis data
export function generateTrendData(variable: string): TrendAnalysis {
  const now = new Date();
  const data: { date: string; value: number; predicted?: number }[] = [];
  const forecast: { date: string; value: number; lower: number; upper: number }[] = [];

  let baseValue = 0;
  let amplitude = 0;
  let trend: TrendAnalysis["trend"] = "stable";
  let slope = 0;

  switch (variable) {
    case "precipitation":
      baseValue = 150; amplitude = 100; trend = "cyclical"; slope = 2.5;
      break;
    case "river_level":
      baseValue = 3.5; amplitude = 1.5; trend = "increasing"; slope = 0.05;
      break;
    case "temperature":
      baseValue = 25; amplitude = 5; trend = "increasing"; slope = 0.03;
      break;
    case "risk_index":
      baseValue = 55; amplitude = 15; trend = "increasing"; slope = 0.8;
      break;
    default:
      baseValue = 50; amplitude = 20; trend = "stable"; slope = 0;
  }

  // Historical data (last 12 months)
  for (let m = 11; m >= 0; m--) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const seasonal = Math.sin((date.getMonth() / 12) * Math.PI * 2) * amplitude;
    const trendValue = slope * (12 - m);
    const noise = (Math.random() - 0.5) * amplitude * 0.3;
    const value = Math.max(0, baseValue + seasonal + trendValue + noise);
    data.push({
      date: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      value: Math.round(value * 100) / 100,
    });
  }

  // Forecast (next 6 months)
  for (let m = 1; m <= 6; m++) {
    const date = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const seasonal = Math.sin((date.getMonth() / 12) * Math.PI * 2) * amplitude;
    const trendValue = slope * (12 + m);
    const value = baseValue + seasonal + trendValue;
    const uncertainty = m * amplitude * 0.1;
    forecast.push({
      date: date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      value: Math.round(value * 100) / 100,
      lower: Math.round((value - uncertainty) * 100) / 100,
      upper: Math.round((value + uncertainty) * 100) / 100,
    });
  }

  return {
    variable,
    period: "12 meses",
    data,
    trend,
    slope,
    r2: 0.72 + Math.random() * 0.2,
    forecast,
  };
}
