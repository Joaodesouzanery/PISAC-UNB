import { NextResponse } from "next/server";
import { crises, incidents, municipalities, crisisResources } from "@/data/crisis-data";
import { auditLogs, systemUsers } from "@/data/governance-data";

/**
 * Export API - generates structured data for PDF/Excel export on client
 * Client-side handles PDF (jsPDF) and Excel (xlsx) generation
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "crises";
  const format = searchParams.get("format") || "json";

  let data: unknown;
  let title: string;

  switch (type) {
    case "crises":
      data = crises.map((c) => ({
        titulo: c.title,
        status: c.status,
        nivel: c.level,
        agenciaLider: c.leadAgency,
        municipiosAfetados: c.affectedMunicipalities.length,
        iniciadaEm: c.startTime,
      }));
      title = "Relatório de Crises";
      break;

    case "incidents":
      data = incidents.map((i) => ({
        titulo: i.title,
        status: i.status,
        prioridade: i.priority,
        responsavel: i.assignedTo,
        agencia: i.assignedAgency,
        municipio: i.municipality,
        localizacao: i.location,
        atualizadoEm: i.updatedAt,
      }));
      title = "Relatório de Incidentes";
      break;

    case "municipalities":
      data = municipalities.map((m) => ({
        nome: m.name,
        estado: m.state,
        populacao: m.population,
        status: m.status,
        incidentesAtivos: m.activeIncidents,
        recursosDisponiveis: `${m.resourcesAvailable}%`,
      }));
      title = "Relatório Municipal";
      break;

    case "resources":
      data = crisisResources.map((r) => ({
        nome: r.name,
        tipo: r.type,
        total: r.quantity,
        disponivel: r.available,
        alocado: r.allocated,
        status: r.status,
        localizacao: r.location,
      }));
      title = "Relatório de Recursos";
      break;

    case "audit":
      data = auditLogs.map((l) => ({
        usuario: l.userName,
        acao: l.action,
        detalhe: l.details,
        modulo: l.module,
        recurso: l.resource,
        risco: l.riskLevel,
        sucesso: l.success ? "Sim" : "Não",
        ip: l.ipAddress,
        dataHora: l.timestamp,
      }));
      title = "Relatório de Auditoria";
      break;

    case "users":
      data = systemUsers.map((u) => ({
        nome: u.name,
        email: u.email,
        perfil: u.role,
        agencia: u.agency,
        municipio: u.municipality,
        mfa: u.mfaEnabled ? "Sim" : "Não",
        status: u.isActive ? "Ativo" : "Inativo",
        ultimoLogin: u.lastLogin,
      }));
      title = "Relatório de Usuários";
      break;

    default:
      return NextResponse.json({ error: "Tipo de exportação inválido" }, { status: 400 });
  }

  return NextResponse.json({
    title,
    type,
    generatedAt: new Date().toISOString(),
    recordCount: Array.isArray(data) ? data.length : 0,
    data,
  });
}
