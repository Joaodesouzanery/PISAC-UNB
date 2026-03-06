import { describe, it, expect } from "vitest";
import { GET as getSensors } from "@/app/api/sensors/route";
import { GET as getAlerts } from "@/app/api/alerts/route";
import { GET as getCrises } from "@/app/api/crises/route";
import { GET as getIncidents } from "@/app/api/incidents/route";
import { GET as getMunicipalities } from "@/app/api/municipalities/route";
import { GET as getResources } from "@/app/api/resources/route";
import { GET as getExport } from "@/app/api/export/route";

function createRequest(url: string): Request {
  return new Request(url);
}

describe("API Routes - Sensors", () => {
  it("should return sensor data", async () => {
    const res = await getSensors(createRequest("http://localhost/api/sensors"));
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.source).toBe("mock");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("should filter by status", async () => {
    const res = await getSensors(createRequest("http://localhost/api/sensors?status=online"));
    const json = await res.json();
    json.data.forEach((s: any) => expect(s.status).toBe("online"));
  });
});

describe("API Routes - Alerts", () => {
  it("should return alert data", async () => {
    const res = await getAlerts(createRequest("http://localhost/api/alerts"));
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("should filter by severity", async () => {
    const res = await getAlerts(createRequest("http://localhost/api/alerts?severity=critical"));
    const json = await res.json();
    json.data.forEach((a: any) => expect(a.severity).toBe("critical"));
  });
});

describe("API Routes - Crises", () => {
  it("should return crisis data", async () => {
    const res = await getCrises(createRequest("http://localhost/api/crises"));
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("should filter by status", async () => {
    const res = await getCrises(createRequest("http://localhost/api/crises?status=active"));
    const json = await res.json();
    json.data.forEach((c: any) => expect(c.status).toBe("active"));
  });
});

describe("API Routes - Incidents", () => {
  it("should return incident data", async () => {
    const res = await getIncidents(createRequest("http://localhost/api/incidents"));
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });
});

describe("API Routes - Municipalities", () => {
  it("should return municipality data", async () => {
    const res = await getMunicipalities(createRequest("http://localhost/api/municipalities"));
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });
});

describe("API Routes - Resources", () => {
  it("should return resource data", async () => {
    const res = await getResources(createRequest("http://localhost/api/resources"));
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });
});

describe("API Routes - Export", () => {
  it("should export crises data", async () => {
    const res = await getExport(createRequest("http://localhost/api/export?type=crises"));
    const json = await res.json();
    expect(json.title).toBe("Relatório de Crises");
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.generatedAt).toBeTruthy();
  });

  it("should export incidents data", async () => {
    const res = await getExport(createRequest("http://localhost/api/export?type=incidents"));
    const json = await res.json();
    expect(json.title).toBe("Relatório de Incidentes");
  });

  it("should export audit data", async () => {
    const res = await getExport(createRequest("http://localhost/api/export?type=audit"));
    const json = await res.json();
    expect(json.title).toBe("Relatório de Auditoria");
  });

  it("should reject invalid types", async () => {
    const res = await getExport(createRequest("http://localhost/api/export?type=invalid"));
    expect(res.status).toBe(400);
  });
});
