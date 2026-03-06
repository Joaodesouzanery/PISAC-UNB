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
  Key,
  Activity,
  Eye,
  EyeOff,
  Trash2,
  Plus,
} from "lucide-react";
import type { APIEndpoint } from "@/types";

const methodColors: Record<string, string> = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f97316",
  DELETE: "#ef4444",
  PATCH: "#8b5cf6",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "#22c55e" },
  beta: { label: "Beta", color: "#f59e0b" },
  deprecated: { label: "Descontinuado", color: "#ef4444" },
  planned: { label: "Planejado", color: "#94a3b8" },
};

const authConfig: Record<string, { label: string; icon: typeof Lock }> = {
  api_key: { label: "API Key", icon: Lock },
  oauth2: { label: "OAuth 2.0", icon: Shield },
  jwt: { label: "JWT", icon: Lock },
  gov_br: { label: "Gov.br SSO", icon: Globe },
};

const classificationColors: Record<string, string> = {
  public: "#22c55e",
  internal: "#3b82f6",
  confidential: "#f97316",
  restricted: "#ef4444",
};

const mockApiKeys = [
  { id: "key-1", name: "Integração CEMADEN", key: "pk_live_9f8e7d6c5b4a3....", created: "2026-01-15", lastUsed: "2026-03-05", requests: 12847, status: "active", rateLimit: "1000/hora" },
  { id: "key-2", name: "Dashboard Externo DF", key: "pk_live_a1b2c3d4e5f6....", created: "2025-11-20", lastUsed: "2026-03-06", requests: 45231, status: "active", rateLimit: "2000/hora" },
  { id: "key-3", name: "App Mobile Defesa Civil", key: "pk_live_x7y8z9w0v1u2....", created: "2025-09-01", lastUsed: "2026-02-28", requests: 8923, status: "active", rateLimit: "500/hora" },
  { id: "key-4", name: "Teste Homologação", key: "pk_test_m3n4o5p6q7r8....", created: "2026-02-01", lastUsed: "2026-02-15", requests: 342, status: "revoked", rateLimit: "100/hora" },
];

export default function APIDocumentation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

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

  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };

  return (
    <div className="space-y-6">
      {/* API Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Endpoints", value: apiEndpoints.length, sub: "RESTful documentados", icon: FileCode2, color: "var(--accent)" },
          { label: "Ativos", value: activeCount, sub: "em produção", icon: CheckCircle, color: "#22c55e" },
          { label: "Beta", value: betaCount, sub: "em teste", icon: Zap, color: "#f59e0b" },
          { label: "e-PING", value: `${ePingCount}/${apiEndpoints.length}`, sub: "conformes", icon: Globe, color: "#06b6d4" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl" style={{ ...cardStyle, borderLeft: `4px solid ${color}` }}>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Icon className="h-3 w-3" /> {label}
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* API Key Management */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 12 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--accent)" }}>
            <Key className="h-4 w-4" />
            Gerenciamento de Chaves de API
          </h3>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            <Plus className="h-3 w-3" /> Nova Chave
          </button>
        </div>
        <div className="space-y-2">
          {mockApiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{apiKey.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{
                    backgroundColor: apiKey.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: apiKey.status === "active" ? "#22c55e" : "#ef4444",
                  }}>
                    {apiKey.status === "active" ? "ATIVA" : "REVOGADA"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <code className="font-mono" style={{ color: "var(--text-secondary)" }}>
                    {showKeys[apiKey.id] ? apiKey.key.replace("....", "abcd1234") : apiKey.key}
                  </code>
                  <button onClick={() => setShowKeys(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}>
                    {showKeys[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  <Copy className="h-3 w-3 cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <div className="text-center">
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{apiKey.requests.toLocaleString("pt-BR")}</p>
                  <p>requisições</p>
                </div>
                <div className="text-center">
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{apiKey.rateLimit}</p>
                  <p>rate limit</p>
                </div>
                <div className="text-center">
                  <p className="font-medium" style={{ color: "var(--text-secondary)" }}>{apiKey.lastUsed}</p>
                  <p>último uso</p>
                </div>
              </div>
              {apiKey.status === "active" && (
                <button className="p-1.5 rounded" style={{ color: "#ef4444" }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar endpoints por path, descrição..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none" }}
            />
          </div>
          <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="text-xs rounded-lg px-2 py-2"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
          >
            <option value="all">Todos os módulos</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs rounded-lg px-2 py-2"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
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
            const methodColor = methodColors[ep.method];

            return (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep)}
                className="w-full text-left p-3 rounded-lg transition-all"
                style={{
                  border: `2px solid ${isSelected ? "rgba(249,115,22,0.4)" : "var(--border-primary)"}`,
                  backgroundColor: isSelected ? "var(--accent-muted)" : "var(--bg-card)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold" style={{ backgroundColor: `${methodColor}15`, color: methodColor }}>
                    {ep.method}
                  </span>
                  <code className="text-xs font-mono font-medium" style={{ color: "var(--text-primary)" }}>{ep.path}</code>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-medium ml-auto" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <p className="text-[10px] pl-14" style={{ color: "var(--text-muted)" }}>{ep.description}</p>
                <div className="flex items-center gap-2 mt-1.5 pl-14 text-[9px]" style={{ color: "var(--text-muted)" }}>
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
              <div className="p-4 rounded-xl" style={cardStyle}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded font-mono font-bold" style={{ backgroundColor: `${methodColors[selectedEndpoint.method]}15`, color: methodColors[selectedEndpoint.method] }}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: `${statusConfig[selectedEndpoint.status].color}15`, color: statusConfig[selectedEndpoint.status].color }}>
                    {statusConfig[selectedEndpoint.status].label}
                  </span>
                </div>

                <div className="rounded-lg p-3 mb-3 flex items-center justify-between" style={{ backgroundColor: "#111827" }}>
                  <code className="text-xs font-mono" style={{ color: "#4ade80" }}>{selectedEndpoint.path}</code>
                  <Copy className="h-3.5 w-3.5 cursor-pointer" style={{ color: "#6b7280" }} />
                </div>

                <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>{selectedEndpoint.description}</p>

                <div className="space-y-2.5 text-xs">
                  {[
                    { label: "Módulo", value: selectedEndpoint.module },
                    { label: "Versão", value: selectedEndpoint.version },
                    { label: "Autenticação", value: authConfig[selectedEndpoint.authentication].label },
                    { label: "Rate Limit", value: selectedEndpoint.rateLimit },
                    { label: "Formato", value: selectedEndpoint.responseFormat },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span style={{ color: "var(--text-muted)" }}>{label}</span>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Classificação</span>
                    <span className="font-bold text-[10px]" style={{ color: classificationColors[selectedEndpoint.dataClassification] }}>
                      {selectedEndpoint.dataClassification.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>e-PING</span>
                    {selectedEndpoint.ePingCompliant ? (
                      <CheckCircle className="h-4 w-4" style={{ color: "#22c55e" }} />
                    ) : (
                      <AlertTriangle className="h-4 w-4" style={{ color: "#f59e0b" }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Example Response */}
              <div className="p-4 rounded-xl" style={cardStyle}>
                <h4 className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>Exemplo de Resposta</h4>
                <div className="rounded-lg p-3 overflow-x-auto" style={{ backgroundColor: "#111827" }}>
                  <pre className="text-[10px] font-mono leading-relaxed" style={{ color: "#4ade80" }}>
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
            <div className="p-8 text-center rounded-xl" style={cardStyle}>
              <FileCode2 className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Selecione um endpoint para detalhes</p>
            </div>
          )}

          {/* API Standards */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", borderRadius: 12 }}>
            <h4 className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>Padrões da API</h4>
            <div className="space-y-1.5 text-[10px]" style={{ color: "var(--text-secondary)" }}>
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
