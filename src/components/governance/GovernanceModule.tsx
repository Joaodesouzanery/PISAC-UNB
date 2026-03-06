"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Users,
  ScrollText,
  Lock,
  Network,
  Server,
  FileCode2,
} from "lucide-react";
import AccessControl from "./AccessControl";
import AuditLogs from "./AuditLogs";
import LGPDCompliance from "./LGPDCompliance";
import Interoperability from "./Interoperability";
import ArchitectureView from "./ArchitectureView";
import APIDocumentation from "./APIDocumentation";

type GovernanceTab =
  | "access"
  | "audit"
  | "lgpd"
  | "interoperability"
  | "api"
  | "architecture";

const tabs: { id: GovernanceTab; label: string; icon: typeof ShieldCheck }[] = [
  { id: "access", label: "Controle de Acesso", icon: Users },
  { id: "audit", label: "Auditoria", icon: ScrollText },
  { id: "lgpd", label: "LGPD", icon: Lock },
  { id: "interoperability", label: "Interoperabilidade", icon: Network },
  { id: "api", label: "APIs", icon: FileCode2 },
  { id: "architecture", label: "Arquitetura", icon: Server },
];

export default function GovernanceModule() {
  const [activeTab, setActiveTab] = useState<GovernanceTab>("access");

  return (
    <div className="space-y-6">
      {/* Compliance Banner */}
      <div
        className="rounded-lg p-4"
        style={{
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.04) 100%)",
          border: "1px solid rgba(249, 115, 22, 0.2)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Governança e Conformidade GovTech
          </h2>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Painel de conformidade regulatória, controle de acesso baseado em papéis (RBAC),
          auditoria, LGPD, interoperabilidade e-PING e arquitetura de microsserviços.
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 rounded-lg p-1 overflow-x-auto"
        style={{ backgroundColor: "var(--bg-elevated)" }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap"
            style={{
              backgroundColor: activeTab === id ? "var(--bg-card)" : "transparent",
              color: activeTab === id ? "var(--accent)" : "var(--text-muted)",
              boxShadow: activeTab === id ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "access" && <AccessControl />}
      {activeTab === "audit" && <AuditLogs />}
      {activeTab === "lgpd" && <LGPDCompliance />}
      {activeTab === "interoperability" && <Interoperability />}
      {activeTab === "api" && <APIDocumentation />}
      {activeTab === "architecture" && <ArchitectureView />}
    </div>
  );
}
