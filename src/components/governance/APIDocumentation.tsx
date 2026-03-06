"use client";

import { useState } from "react";
import { apiEndpoints } from "@/data/governance-data";
import { cn } from "@/lib/utils";
import {
  FileCode2,
  Search,
  Filter,
  Lock,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Zap,
  Copy,
} from "lucide-react";
import type { APIEndpoint } from "@/types";

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
  PATCH: "bg-purple-100 text-purple-700",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "bg-success-100 text-success-700" },
  beta: { label: "Beta", color: "bg-warning-100 text-warning-700" },
  deprecated: { label: "Descontinuado", color: "bg-danger-100 text-danger-700" },
  planned: { label: "Planejado", color: "bg-gray-100 text-gray-700" },
};

const authConfig: Record<string, { label: string; icon: typeof Lock }> = {
  api_key: { label: "API Key", icon: Lock },
  oauth2: { label: "OAuth 2.0", icon: Shield },
  jwt: { label: "JWT", icon: Lock },
  gov_br: { label: "Gov.br SSO", icon: Globe },
};

const classificationColors: Record<string, string> = {
  public: "text-green-700",
  internal: "text-blue-700",
  confidential: "text-orange-700",
  restricted: "text-red-700",
};

export default function APIDocumentation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);

  const modules = Array.from(new Set(apiEndpoints.map((e) => e.module)));

  const filteredEndpoints = apiEndpoints.filter((ep) => {
    if (filterModule !== "all" && ep.module !== filterModule) return false;
    if (filterStatus !== "all" && ep.status !== filterStatus) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        ep.path.toLowerCase().includes(s) ||
        ep.description.toLowerCase().includes(s) ||
        ep.module.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const activeCount = apiEndpoints.filter((e) => e.status === "active").length;
  const betaCount = apiEndpoints.filter((e) => e.status === "beta").length;
  const ePingCount = apiEndpoints.filter((e) => e.ePingCompliant).length;

  return (
    <div className="space-y-6">
      {/* API Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <FileCode2 className="h-3 w-3" /> Total de Endpoints
          </p>
          <p className="text-xl font-bold text-gray-900">{apiEndpoints.length}</p>
          <p className="text-[10px] text-gray-400">RESTful documentados</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Ativos
          </p>
          <p className="text-xl font-bold text-success-600">{activeCount}</p>
          <p className="text-[10px] text-gray-400">em produção</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Zap className="h-3 w-3" /> Beta
          </p>
          <p className="text-xl font-bold text-warning-600">{betaCount}</p>
          <p className="text-[10px] text-gray-400">em teste</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-cyan-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Globe className="h-3 w-3" /> e-PING
          </p>
          <p className="text-xl font-bold text-cyan-600">{ePingCount}/{apiEndpoints.length}</p>
          <p className="text-[10px] text-gray-400">conformes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar endpoints por path, descrição..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
          >
            <option value="all">Todos os módulos</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="beta">Beta</option>
            <option value="deprecated">Descontinuado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint List */}
        <div className="lg:col-span-2 space-y-2">
          {filteredEndpoints.map((ep) => {
            const isSelected = selectedEndpoint?.id === ep.id;
            const status = statusConfig[ep.status];

            return (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-2 transition-all",
                  isSelected ? "border-primary-400 bg-primary-50" : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-mono font-bold", methodColors[ep.method])}>
                    {ep.method}
                  </span>
                  <code className="text-xs font-mono text-gray-900 font-medium">{ep.path}</code>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium ml-auto", status.color)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 pl-14">{ep.description}</p>
                <div className="flex items-center gap-2 mt-1.5 pl-14 text-[9px] text-gray-400">
                  <span>{ep.module}</span>
                  <span>•</span>
                  <span>{ep.authentication}</span>
                  <span>•</span>
                  <span>{ep.rateLimit}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Endpoint Detail */}
        <div className="space-y-4">
          {selectedEndpoint ? (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("text-xs px-2 py-1 rounded font-mono font-bold", methodColors[selectedEndpoint.method])}>
                    {selectedEndpoint.method}
                  </span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", statusConfig[selectedEndpoint.status].color)}>
                    {statusConfig[selectedEndpoint.status].label}
                  </span>
                </div>

                <div className="bg-gray-900 rounded-lg p-3 mb-3 flex items-center justify-between">
                  <code className="text-xs text-green-400 font-mono">{selectedEndpoint.path}</code>
                  <Copy className="h-3.5 w-3.5 text-gray-500 cursor-pointer hover:text-white transition-colors" />
                </div>

                <p className="text-xs text-gray-700 mb-4">{selectedEndpoint.description}</p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Módulo</span>
                    <span className="font-medium text-gray-900">{selectedEndpoint.module}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Versão</span>
                    <span className="font-medium text-gray-900">{selectedEndpoint.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Autenticação</span>
                    <span className="font-medium text-gray-900">{authConfig[selectedEndpoint.authentication].label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate Limit</span>
                    <span className="font-medium text-gray-900">{selectedEndpoint.rateLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Formato</span>
                    <span className="font-mono text-[10px] text-gray-900">{selectedEndpoint.responseFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Classificação</span>
                    <span className={cn("font-bold text-[10px]", classificationColors[selectedEndpoint.dataClassification])}>
                      {selectedEndpoint.dataClassification.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">e-PING</span>
                    {selectedEndpoint.ePingCompliant ? (
                      <CheckCircle className="h-4 w-4 text-success-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Example Response */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-xs font-bold text-gray-900 mb-2">Exemplo de Resposta</h4>
                <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-[10px] text-green-400 font-mono leading-relaxed">
{`{
  "status": 200,
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "per_page": 20
  },
  "links": {
    "self": "${selectedEndpoint.path}",
    "next": "${selectedEndpoint.path}?page=2"
  }
}`}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileCode2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Selecione um endpoint para detalhes</p>
            </div>
          )}

          {/* API Standards */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h4 className="text-xs font-bold text-gray-900 mb-2">Padrões da API</h4>
            <div className="space-y-1.5 text-[10px] text-gray-600">
              <p>• OpenAPI 3.1 Specification</p>
              <p>• Versionamento semântico (v1, v2...)</p>
              <p>• Paginação HATEOAS com links</p>
              <p>• Rate limiting com headers X-RateLimit-*</p>
              <p>• Respostas padronizadas com meta/links</p>
              <p>• Códigos de erro RFC 7807 (Problem Details)</p>
              <p>• CORS configurado para domínios gov.br</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
