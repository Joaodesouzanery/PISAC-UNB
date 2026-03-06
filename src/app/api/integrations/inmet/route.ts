import { NextResponse } from "next/server";

const INMET_BASE = process.env.INMET_API_URL || "https://apitempo.inmet.gov.br";

/**
 * Proxy para API do INMET (Instituto Nacional de Meteorologia)
 * Retorna previsão do tempo, condições atuais e avisos meteorológicos.
 * Docs: https://portal.inmet.gov.br/manual/manual-de-uso-da-api-de-previsão
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "condicoes";
  const estacao = searchParams.get("estacao") || "A001"; // Brasília

  try {
    let endpoint: string;

    switch (type) {
      case "condicoes":
        endpoint = `${INMET_BASE}/condicoes/tempo/capital/15`;
        break;
      case "previsao":
        endpoint = `${INMET_BASE}/previsao/${estacao}`;
        break;
      case "avisos":
        endpoint = `${INMET_BASE}/avisos/ativos`;
        break;
      case "estacoes":
        endpoint = `${INMET_BASE}/estacoes/T`;
        break;
      default:
        endpoint = `${INMET_BASE}/condicoes/tempo/capital/15`;
    }

    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 }, // Cache 10 min
    });

    if (!response.ok) {
      return NextResponse.json({
        error: "INMET API indisponível",
        fallback: true,
        data: getMockInmetData(),
      });
    }

    const data = await response.json();
    return NextResponse.json({ data, source: "inmet", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({
      error: "Falha na conexão com INMET",
      fallback: true,
      data: getMockInmetData(),
      timestamp: new Date().toISOString(),
    });
  }
}

function getMockInmetData() {
  return {
    capital: "Brasília",
    condicaoAtual: {
      temperatura: 26,
      umidade: 68,
      pressao: 1012,
      ventoVelocidade: 12,
      ventoDirecao: "SE",
      condicao: "Parcialmente Nublado",
      atualizacao: new Date().toISOString(),
    },
    previsao5dias: [
      { dia: "Hoje", tempMin: 19, tempMax: 29, condicao: "Pancadas de chuva", precipitacao: 15 },
      { dia: "Amanhã", tempMin: 18, tempMax: 27, condicao: "Chuva forte", precipitacao: 35 },
      { dia: "Depois", tempMin: 20, tempMax: 30, condicao: "Parcialmente nublado", precipitacao: 5 },
      { dia: "+3 dias", tempMin: 19, tempMax: 31, condicao: "Sol com nuvens", precipitacao: 0 },
      { dia: "+4 dias", tempMin: 18, tempMax: 28, condicao: "Pancadas isoladas", precipitacao: 10 },
    ],
    avisos: [
      { tipo: "Chuva Intensa", nivel: "Perigo", regioes: ["DF", "Entorno"], inicio: new Date().toISOString(), fim: new Date(Date.now() + 24 * 3600 * 1000).toISOString() },
    ],
  };
}
