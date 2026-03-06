"use client";

import { useState } from "react";
import {
  MessageSquare,
  Package,
  ClipboardList,
  Globe2,
  BookOpen,
  Siren,
} from "lucide-react";
import CommunicationPanel from "./CommunicationPanel";
import ResourceCoordination from "./ResourceCoordination";
import IncidentManagement from "./IncidentManagement";
import InterMunicipalDashboard from "./InterMunicipalDashboard";
import KnowledgeBase from "./KnowledgeBase";

type CrisisView =
  | "communication"
  | "resources"
  | "incidents"
  | "intermunicipal"
  | "knowledge";

export default function CrisisModule() {
  const [view, setView] = useState<CrisisView>("communication");

  const tabs: { key: CrisisView; label: string; icon: typeof Siren }[] = [
    { key: "communication", label: "Comunicação Unificada", icon: MessageSquare },
    { key: "resources", label: "Coordenação de Recursos", icon: Package },
    { key: "incidents", label: "Gestão de Incidentes", icon: ClipboardList },
    { key: "intermunicipal", label: "Painel Intermunicipal", icon: Globe2 },
    { key: "knowledge", label: "Base de Conhecimento", icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === key
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {view === "communication" && <CommunicationPanel />}
      {view === "resources" && <ResourceCoordination />}
      {view === "incidents" && <IncidentManagement />}
      {view === "intermunicipal" && <InterMunicipalDashboard />}
      {view === "knowledge" && <KnowledgeBase />}
    </div>
  );
}
