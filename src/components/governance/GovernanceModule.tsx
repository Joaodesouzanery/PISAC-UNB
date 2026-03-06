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
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6" />
          <h2 className="text-lg font-bold">Governança e Conformidade GovTech</h2>
        </div>
        <p className="text-sm text-primary-100">
          Painel de conformidade regulatória, controle de acesso baseado em papéis (RBAC),
          auditoria, LGPD, interoperabilidade e-PING e arquitetura de microsserviços.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap",
              activeTab === id
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
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
