import { describe, it, expect } from "vitest";
import { municipalities, crises, incidents, crisisResources, communicationChannels, interMunicipalMetrics } from "@/data/crisis-data";
import { systemUsers, auditLogs, apiEndpoints, microserviceNodes } from "@/data/governance-data";
import { sensors, alerts, infrastructures } from "@/data/mock-data";

describe("Crisis Data Integrity", () => {
  it("all municipalities should have required fields", () => {
    municipalities.forEach((m) => {
      expect(m.id).toBeDefined();
      expect(m.name).toBeTruthy();
      expect(m.population).toBeGreaterThan(0);
      expect(m.lat).toBeDefined();
      expect(m.lng).toBeDefined();
      expect(["crisis", "alert", "normal", "recovery"]).toContain(m.status);
    });
  });

  it("municipalities should have valid DF coordinates", () => {
    municipalities.forEach((m) => {
      expect(m.lat).toBeGreaterThan(-16.5);
      expect(m.lat).toBeLessThan(-15.0);
      expect(m.lng).toBeGreaterThan(-48.5);
      expect(m.lng).toBeLessThan(-47.0);
    });
  });

  it("all crises should reference valid municipalities", () => {
    const municipalityIds = new Set(municipalities.map((m) => m.id));
    crises.forEach((c) => {
      c.affectedMunicipalities.forEach((mId) => {
        expect(municipalityIds.has(mId)).toBe(true);
      });
    });
  });

  it("all incidents should reference valid crises", () => {
    const crisisIds = new Set(crises.map((c) => c.id));
    incidents.forEach((i) => {
      expect(crisisIds.has(i.crisisId)).toBe(true);
    });
  });

  it("incidents should have valid status and priority", () => {
    incidents.forEach((i) => {
      expect(["open", "in_progress", "resolved", "escalated"]).toContain(i.status);
      expect(["critical", "high", "medium", "low"]).toContain(i.priority);
    });
  });

  it("crisis resources should have consistent quantities", () => {
    crisisResources.forEach((r) => {
      expect(r.available).toBeLessThanOrEqual(r.quantity);
      expect(r.allocated).toBeLessThanOrEqual(r.quantity);
      expect(r.available).toBeGreaterThanOrEqual(0);
    });
  });

  it("communication channels should have participants", () => {
    communicationChannels.forEach((ch) => {
      expect(ch.participants.length).toBeGreaterThan(0);
      expect(ch.messages.length).toBeGreaterThan(0);
    });
  });

  it("inter-municipal metrics should reference valid municipalities", () => {
    const municipalityIds = new Set(municipalities.map((m) => m.id));
    interMunicipalMetrics.forEach((m) => {
      expect(municipalityIds.has(m.municipalityId)).toBe(true);
    });
  });
});

describe("Governance Data Integrity", () => {
  it("all users should have valid roles", () => {
    systemUsers.forEach((u) => {
      expect(["admin", "manager", "analyst", "operator", "viewer", "field_agent"]).toContain(u.role);
      expect(u.email).toContain("@");
      expect(u.name).toBeTruthy();
    });
  });

  it("all users should have permissions", () => {
    systemUsers.forEach((u) => {
      expect(u.permissions.length).toBeGreaterThan(0);
      expect(u.dataAccess.length).toBeGreaterThan(0);
    });
  });

  it("audit logs should have valid action types", () => {
    const validActions = [
      "login", "logout", "data_access", "data_export", "data_modify",
      "report_generate", "alert_acknowledge", "config_change",
      "permission_change", "crisis_action", "api_call",
    ];
    auditLogs.forEach((log) => {
      expect(validActions).toContain(log.action);
      expect(["low", "medium", "high"]).toContain(log.riskLevel);
    });
  });

  it("API endpoints should have valid methods", () => {
    apiEndpoints.forEach((ep) => {
      expect(["GET", "POST", "PUT", "DELETE", "PATCH"]).toContain(ep.method);
      expect(ep.path).toMatch(/^\/api\/v\d+\//);
    });
  });

  it("microservice nodes should have valid tiers", () => {
    microserviceNodes.forEach((node) => {
      expect(["frontend", "api_gateway", "service", "data", "infrastructure"]).toContain(node.tier);
      expect(node.cpu).toBeGreaterThanOrEqual(0);
      expect(node.cpu).toBeLessThanOrEqual(100);
      expect(node.memory).toBeGreaterThanOrEqual(0);
      expect(node.memory).toBeLessThanOrEqual(100);
    });
  });
});

describe("Mock Data Integrity", () => {
  it("all sensors should have valid types and status", () => {
    sensors.forEach((s) => {
      expect(s.id).toBeDefined();
      expect(s.name).toBeTruthy();
      expect(s.lat).toBeDefined();
      expect(s.lng).toBeDefined();
      expect(["online", "offline", "warning", "critical"]).toContain(s.status);
    });
  });

  it("all alerts should have valid severity", () => {
    alerts.forEach((a) => {
      expect(["info", "warning", "critical", "emergency"]).toContain(a.severity);
      expect(a.title).toBeTruthy();
    });
  });

  it("all infrastructures should have valid conditions", () => {
    infrastructures.forEach((inf) => {
      expect(["excellent", "good", "fair", "poor", "critical"]).toContain(inf.condition);
      expect(inf.name).toBeTruthy();
    });
  });
});

describe("Data Dates - should be 2026", () => {
  it("governance data dates should be in 2026", () => {
    systemUsers.forEach((u) => {
      expect(u.lastLogin).toContain("2026");
    });
  });

  it("crisis data dates should be in 2026", () => {
    municipalities.forEach((m) => {
      expect(m.lastUpdate).toContain("2026");
    });
  });
});
