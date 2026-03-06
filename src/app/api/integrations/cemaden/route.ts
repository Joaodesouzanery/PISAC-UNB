import { NextResponse } from "next/server";

const CEMADEN_BASE = process.env.CEMADEN_API_URL || "http://sgaa.cemaden.gov.br/SGAA/rest";

/**
 * Proxy para API do CEMADEN (Centro Nacional de Monitoramento e Alertas de Desastres Naturais)
 * Retorna dados de estações pluviométricas e alertas hidrológicos.
 * Docs: http://www2.cemaden.gov.br/mapainterativo/
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "alertas";
  const uf = searchParams.get("uf") || "DF";
  const municipio = searchParams.get("municipio");

  try {
    let endpoint: string;

    switch (type) {
      case "alertas":
        endpoint = `${CEMADEN_BASE}/alertas/atual`;
        break;
      case "pluviometros":
        endpoint = `${CEMADEN_BASE}/pcds/dados_estacoes`;
        break;
      case "hidrologico":
        endpoint = `${CEMADEN_BASE}/pcds/hidrologico`;
        break;
      default:
        endpoint = `${CEMADEN_BASE}/alertas/atual`;
    }

    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "CEMADEN API indisponível",
          fallback: true,
          data: getMockCemadenData(uf),
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ data, source: "cemaden", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({
      error: "Falha na conexão com CEMADEN",
      fallback: true,
      data: getMockCemadenData(uf),
      timestamp: new Date().toISOString(),
    });
  }
}

function getMockCemadenData(uf: string) {
  return {
    uf,
    alertas: [
      { municipio: "Brasília", tipo: "Chuva Forte", nivel: "moderado", dataHora: new Date().toISOString() },
      { municipio: "Taguatinga", tipo: "Risco Hidrológico", nivel: "alto", dataHora: new Date().toISOString() },
      { municipio: "Ceilândia", tipo: "Alagamento", nivel: "muito_alto", dataHora: new Date().toISOString() },
    ],
    estacoes: [
      { nome: "Est. Pluviométrica Asa Norte", lat: -15.7575, lng: -47.8763, precipitacao24h: 42.5, status: "operante" },
      { nome: "Est. Pluviométrica Taguatinga", lat: -15.8364, lng: -48.0544, precipitacao24h: 68.2, status: "operante" },
      { nome: "Est. Hidrológica Lago Paranoá", lat: -15.7989, lng: -47.8347, nivelAgua: 1.82, status: "operante" },
    ],
  };
}
