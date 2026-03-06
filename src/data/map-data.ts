// ============================================================
// Map Module Extended Data
// Sensor time series, maintenance history, BIM models, WMS layers
// ============================================================

// --- Sensor Time Series Data ---
export interface SensorTimePoint {
  time: string;
  value: number;
  threshold?: number;
}

export function generateSensorTimeSeries(
  sensorId: string,
  baseValue: number,
  range: number,
  threshold: number,
  hours: number = 48
): SensorTimePoint[] {
  const points: SensorTimePoint[] = [];
  const now = new Date();
  let value = baseValue;

  for (let h = hours; h >= 0; h--) {
    const time = new Date(now.getTime() - h * 3600000);
    value = Math.max(0, value + (Math.random() - 0.5) * range * 2);
    points.push({
      time: time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      value: Math.round(value * 100) / 100,
      threshold,
    });
  }
  return points;
}

// --- Maintenance History ---
export interface MaintenanceRecord {
  id: string;
  date: string;
  type: "inspection" | "repair" | "upgrade" | "emergency";
  description: string;
  responsible: string;
  cost?: number;
  status: "completed" | "pending" | "in_progress";
  documents: { name: string; type: string }[];
}

export const maintenanceHistory: Record<string, MaintenanceRecord[]> = {
  inf1: [
    { id: "m1", date: "2025-11-15", type: "inspection", description: "Inspeção visual e estrutural completa dos pilares e vigas", responsible: "NOVACAP", cost: 45000, status: "completed", documents: [{ name: "Laudo_Estrutural_PonteJK_2025.pdf", type: "report" }, { name: "BIM_PonteJK_v3.ifc", type: "bim" }] },
    { id: "m2", date: "2025-06-20", type: "repair", description: "Recuperação de juntas de dilatação na pista Norte", responsible: "NOVACAP", cost: 180000, status: "completed", documents: [{ name: "Projeto_Recuperacao_Juntas.pdf", type: "project" }] },
    { id: "m3", date: "2025-03-10", type: "inspection", description: "Inspeção subaquática de fundações", responsible: "DNIT", cost: 120000, status: "completed", documents: [{ name: "Relatorio_Subaquatico.pdf", type: "report" }] },
  ],
  inf2: [
    { id: "m4", date: "2025-08-20", type: "inspection", description: "Vistoria geral das instalações e sistemas prediais", responsible: "SES-DF", cost: 25000, status: "completed", documents: [{ name: "Vistoria_HBDF_2025.pdf", type: "report" }] },
    { id: "m5", date: "2025-04-15", type: "upgrade", description: "Modernização do sistema de HVAC ala norte", responsible: "SES-DF", cost: 850000, status: "completed", documents: [{ name: "Projeto_HVAC_AlaNorte.pdf", type: "project" }, { name: "BIM_HBDF_HVAC.ifc", type: "bim" }] },
  ],
  inf3: [
    { id: "m6", date: "2025-09-10", type: "inspection", description: "Inspeção estrutural com ensaios não destrutivos", responsible: "DER-DF", cost: 65000, status: "completed", documents: [{ name: "END_ViadutoL2_2025.pdf", type: "report" }] },
    { id: "m7", date: "2025-01-25", type: "emergency", description: "Reparo emergencial de fissura no pilar P3", responsible: "DER-DF", cost: 250000, status: "completed", documents: [{ name: "Relatorio_Emergencia_P3.pdf", type: "report" }] },
  ],
  inf5: [
    { id: "m8", date: "2025-06-15", type: "inspection", description: "Monitoramento de fissuras e deslocamentos com sensores", responsible: "DER-DF", cost: 85000, status: "completed", documents: [{ name: "Monitoramento_PonteCostaSilva_2025.pdf", type: "report" }, { name: "BIM_PonteCostaSilva_v2.ifc", type: "bim" }] },
    { id: "m9", date: "2026-01-15", type: "repair", description: "Projeto de retrofit estrutural - Fase 1", responsible: "DER-DF", cost: 5000000, status: "in_progress", documents: [{ name: "Projeto_Retrofit_Fase1.pdf", type: "project" }, { name: "Cronograma_Retrofit.xlsx", type: "schedule" }] },
    { id: "m10", date: "2024-12-05", type: "emergency", description: "Interdição parcial após detecção de fissuras críticas", responsible: "Defesa Civil", cost: 150000, status: "completed", documents: [{ name: "Auto_Interdicao.pdf", type: "legal" }] },
  ],
  inf8: [
    { id: "m11", date: "2025-12-20", type: "inspection", description: "Inspeção de segurança da barragem conforme PNSB", responsible: "ADASA", cost: 200000, status: "completed", documents: [{ name: "PSB_SantaMaria_2025.pdf", type: "report" }, { name: "BIM_Barragem_SantaMaria.ifc", type: "bim" }] },
  ],
};

// --- BIM Model Data ---
export interface BIMModel {
  id: string;
  infrastructureId: string;
  name: string;
  description: string;
  version: string;
  lastUpdated: string;
  fileSize: string;
  format: string;
  components: BIMComponent[];
}

export interface BIMComponent {
  id: string;
  name: string;
  type: string;
  condition: "good" | "fair" | "poor" | "critical";
  material: string;
  yearBuilt: number;
  lastInspection: string;
}

export const bimModels: BIMModel[] = [
  {
    id: "bim1",
    infrastructureId: "inf1",
    name: "Ponte JK - Modelo Estrutural",
    description: "Modelo completo incluindo pilares, tabuleiro, fundações e cabos de protensão",
    version: "3.2",
    lastUpdated: "2025-11-15",
    fileSize: "245 MB",
    format: "IFC 4.0",
    components: [
      { id: "c1", name: "Pilar P1", type: "column", condition: "good", material: "Concreto Armado", yearBuilt: 2002, lastInspection: "2025-11-15" },
      { id: "c2", name: "Pilar P2", type: "column", condition: "good", material: "Concreto Armado", yearBuilt: 2002, lastInspection: "2025-11-15" },
      { id: "c3", name: "Pilar P3", type: "column", condition: "good", material: "Concreto Armado", yearBuilt: 2002, lastInspection: "2025-11-15" },
      { id: "c4", name: "Tabuleiro Norte", type: "slab", condition: "fair", material: "Concreto Protendido", yearBuilt: 2002, lastInspection: "2025-11-15" },
      { id: "c5", name: "Tabuleiro Sul", type: "slab", condition: "good", material: "Concreto Protendido", yearBuilt: 2002, lastInspection: "2025-11-15" },
      { id: "c6", name: "Fundação Profunda", type: "foundation", condition: "good", material: "Estacas Metálicas", yearBuilt: 2002, lastInspection: "2025-03-10" },
    ],
  },
  {
    id: "bim2",
    infrastructureId: "inf5",
    name: "Ponte Costa e Silva - Modelo de Monitoramento",
    description: "Modelo com sensores de fissuras, deslocamento e vibração integrados",
    version: "2.1",
    lastUpdated: "2025-06-15",
    fileSize: "180 MB",
    format: "IFC 4.0",
    components: [
      { id: "c7", name: "Pilar P1", type: "column", condition: "poor", material: "Concreto Armado", yearBuilt: 1971, lastInspection: "2025-06-15" },
      { id: "c8", name: "Pilar P2", type: "column", condition: "fair", material: "Concreto Armado", yearBuilt: 1971, lastInspection: "2025-06-15" },
      { id: "c9", name: "Viga Principal V1", type: "beam", condition: "poor", material: "Concreto Armado", yearBuilt: 1971, lastInspection: "2025-06-15" },
      { id: "c10", name: "Tabuleiro", type: "slab", condition: "critical", material: "Concreto Armado", yearBuilt: 1971, lastInspection: "2025-06-15" },
      { id: "c11", name: "Guarda-corpo", type: "railing", condition: "poor", material: "Aço", yearBuilt: 1971, lastInspection: "2025-06-15" },
    ],
  },
  {
    id: "bim3",
    infrastructureId: "inf8",
    name: "Barragem Santa Maria - Modelo de Segurança",
    description: "Modelo da barragem com instrumentação de auscultação",
    version: "1.5",
    lastUpdated: "2025-12-20",
    fileSize: "320 MB",
    format: "IFC 4.0",
    components: [
      { id: "c12", name: "Corpo da Barragem", type: "wall", condition: "good", material: "Terra/Enrocamento", yearBuilt: 1969, lastInspection: "2025-12-20" },
      { id: "c13", name: "Vertedouro Principal", type: "spillway", condition: "good", material: "Concreto", yearBuilt: 1969, lastInspection: "2025-12-20" },
      { id: "c14", name: "Galeria de Drenagem", type: "gallery", condition: "fair", material: "Concreto", yearBuilt: 1969, lastInspection: "2025-12-20" },
    ],
  },
];

// --- WMS/WFS Layer Definitions ---
export interface GISLayer {
  id: string;
  name: string;
  description: string;
  source: string;
  type: "wms" | "wfs" | "geojson" | "heatmap";
  url: string;
  layers?: string;
  active: boolean;
  opacity: number;
  category: "risk" | "environment" | "infrastructure" | "planning";
}

export const gisLayers: GISLayer[] = [
  {
    id: "gis1",
    name: "Áreas de Risco de Inundação",
    description: "Mapeamento oficial de áreas suscetíveis a inundação no DF",
    source: "INDE / ANA",
    type: "geojson",
    url: "",
    active: false,
    opacity: 0.4,
    category: "risk",
  },
  {
    id: "gis2",
    name: "Zoneamento Ambiental",
    description: "Áreas de preservação permanente e unidades de conservação",
    source: "IBRAM-DF",
    type: "wms",
    url: "",
    layers: "areas_protegidas",
    active: false,
    opacity: 0.3,
    category: "environment",
  },
  {
    id: "gis3",
    name: "Rede de Drenagem Urbana",
    description: "Galerias pluviais, bocas de lobo e reservatórios",
    source: "NOVACAP",
    type: "wfs",
    url: "",
    layers: "drenagem_urbana",
    active: false,
    opacity: 0.5,
    category: "infrastructure",
  },
  {
    id: "gis4",
    name: "Mapa de Calor - Ocorrências",
    description: "Densidade de ocorrências de desastres nos últimos 5 anos",
    source: "Defesa Civil DF",
    type: "heatmap",
    url: "",
    active: false,
    opacity: 0.6,
    category: "risk",
  },
  {
    id: "gis5",
    name: "Geotecnia - Suscetibilidade",
    description: "Mapa de suscetibilidade a movimentos de massa",
    source: "CPRM / SGB",
    type: "wms",
    url: "",
    layers: "suscetibilidade_massa",
    active: false,
    opacity: 0.4,
    category: "risk",
  },
  {
    id: "gis6",
    name: "Plano Diretor - Uso do Solo",
    description: "Zoneamento de uso e ocupação do solo do PDOT",
    source: "SEDUH-DF",
    type: "wms",
    url: "",
    layers: "uso_solo",
    active: false,
    opacity: 0.3,
    category: "planning",
  },
];

// --- Risk Zone Polygons (simulated) ---
export interface RiskZone {
  id: string;
  name: string;
  level: "low" | "medium" | "high" | "critical";
  coordinates: [number, number][];
  description: string;
}

export const riskZones: RiskZone[] = [
  {
    id: "rz1",
    name: "Zona de Inundação - Taguatinga Centro",
    level: "critical",
    coordinates: [
      [-15.825, -48.045],
      [-15.825, -48.060],
      [-15.840, -48.060],
      [-15.840, -48.045],
    ],
    description: "Área com histórico recorrente de alagamentos. Drenagem subdimensionada.",
  },
  {
    id: "rz2",
    name: "Zona de Deslizamento - Vila Estrutural",
    level: "high",
    coordinates: [
      [-15.775, -47.990],
      [-15.775, -48.005],
      [-15.795, -48.005],
      [-15.795, -47.990],
    ],
    description: "Encostas com ocupação irregular e risco de movimentação de massa.",
  },
  {
    id: "rz3",
    name: "Zona de Inundação - Ceilândia Sul",
    level: "high",
    coordinates: [
      [-15.815, -48.095],
      [-15.815, -48.115],
      [-15.835, -48.115],
      [-15.835, -48.095],
    ],
    description: "Bacia de contribuição com ocupação de áreas de manancial.",
  },
  {
    id: "rz4",
    name: "Zona de Atenção - Lago Paranoá",
    level: "medium",
    coordinates: [
      [-15.810, -47.855],
      [-15.810, -47.885],
      [-15.840, -47.885],
      [-15.840, -47.855],
    ],
    description: "Monitoramento de nível e qualidade da água do Lago Paranoá.",
  },
];

// --- Evacuation Routes ---
export interface MapEvacuationRoute {
  id: string;
  name: string;
  points: [number, number][];
  capacity: number;
  estimatedTime: number;
  status: "clear" | "congested" | "blocked";
}

export const evacuationRoutes: MapEvacuationRoute[] = [
  {
    id: "er1",
    name: "Rota EPTG → Plano Piloto",
    points: [[-15.836, -48.054], [-15.825, -48.020], [-15.815, -47.980], [-15.805, -47.940], [-15.800, -47.890]],
    capacity: 30000,
    estimatedTime: 90,
    status: "clear",
  },
  {
    id: "er2",
    name: "Rota Taguatinga → Samambaia",
    points: [[-15.835, -48.055], [-15.845, -48.070], [-15.855, -48.085], [-15.860, -48.100]],
    capacity: 20000,
    estimatedTime: 45,
    status: "congested",
  },
  {
    id: "er3",
    name: "Desvio Ponte JK → Costa e Silva",
    points: [[-15.827, -47.874], [-15.820, -47.860], [-15.818, -47.846]],
    capacity: 20000,
    estimatedTime: 30,
    status: "clear",
  },
];
