"use client";

import { useState } from "react";
import { systemUsers, roleDefinitions } from "@/data/governance-data";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/shared/ProgressBar";
import {
  Users,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Key,
  Building2,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Download,
  Lock,
  UserCheck,
  UserX,
  Fingerprint,
  FileCheck,
  Globe,
  ArrowRight,
} from "lucide-react";
import type { SystemUser, UserRoleLevel } from "@/types";

const moduleLabels: Record<string, string> = {
  all: "Todos os Módulos",
  dashboard: "Painel Geral",
  map: "Mapa BIM/GIS/IoT",
  analysis: "Análise de Dados",
  simulation: "Simulação",
  monitoring: "Monitoramento",
  budget: "Orçamento",
  crisis: "Gestão de Crises",
  budget_analysis: "Análise Orçamentária",
  governance: "Governança",
  system: "Sistema",
};

const actionIcons: Record<string, typeof Eye> = {
  read: Eye,
  write: Edit3,
  delete: Trash2,
  export: Download,
  admin: Shield,
};

const actionLabels: Record<string, string> = {
  read: "Ler",
  write: "Escrever",
  delete: "Excluir",
  export: "Exportar",
  admin: "Admin",
};

const classificationLabels: Record<string, string> = {
  public: "Público",
  internal: "Interno",
  confidential: "Confidencial",
  restricted: "Restrito",
};

const classificationColors: Record<string, string> = {
  public: "#22c55e",
  internal: "#3b82f6",
  confidential: "#f97316",
  restricted: "#ef4444",
};

export default function AccessControl() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const filteredUsers = systemUsers.filter((u) => {
    if (filterRole !== "all" && u.role !== filterRole) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.agency.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const activeUsers = systemUsers.filter((u) => u.isActive).length;
  const mfaEnabled = systemUsers.filter((u) => u.mfaEnabled).length;
  const roleDistribution = Object.entries(roleDefinitions).map(([key, config]) => ({
    role: key,
    label: config.label,
    count: systemUsers.filter((u) => u.role === key).length,
    color: config.color,
  }));

  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };

  return (
    <div className="space-y-6">
      {/* RBAC Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Usuários Cadastrados", value: systemUsers.length, sub: `${activeUsers} ativos`, icon: Users, color: "var(--accent)" },
          { label: "MFA Habilitado", value: `${mfaEnabled}/${systemUsers.length}`, sub: `${((mfaEnabled / systemUsers.length) * 100).toFixed(0)}% cobertura`, icon: Fingerprint, color: "#22c55e" },
          { label: "Perfis de Acesso", value: Object.keys(roleDefinitions).length, sub: "RBAC granular por módulo", icon: Key, color: "#f59e0b" },
          { label: "Usuários Inativos", value: systemUsers.length - activeUsers, sub: "credenciais suspensas", icon: UserX, color: "#ef4444" },
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

      {/* Role Distribution */}
      <div className="p-4 rounded-xl" style={cardStyle}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Shield className="h-4 w-4" style={{ color: "var(--accent)" }} />
          Distribuição de Perfis (RBAC)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {roleDistribution.map((r) => (
            <div key={r.role} className="text-center">
              <div className={cn("inline-block px-3 py-1.5 rounded-lg text-xs font-bold mb-1", r.color)}>
                {r.label}
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{r.count}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {roleDefinitions[r.role].description.substring(0, 40)}...
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search/Filter */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, email ou agência..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none" }}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs rounded-lg px-2 py-2"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            >
              <option value="all">Todos os perfis</option>
              {Object.entries(roleDefinitions).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <table className="w-full">
              <thead style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border-primary)" }}>
                <tr>
                  {["Usuário", "Perfil", "Agência", "MFA", "Status"].map((h) => (
                    <th key={h} className={cn("text-left text-[10px] font-bold uppercase tracking-wider px-4 py-2", h === "Agência" && "hidden md:table-cell", (h === "MFA" || h === "Status") && "text-center")} style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      backgroundColor: selectedUser?.id === user.id ? "var(--accent-muted)" : "transparent",
                    }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", roleDefinitions[user.role].color)}>
                        {roleDefinitions[user.role].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{user.agency}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.mfaEnabled ? (
                        <CheckCircle className="h-4 w-4 mx-auto" style={{ color: "#22c55e" }} />
                      ) : (
                        <XCircle className="h-4 w-4 mx-auto" style={{ color: "#ef4444" }} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{
                        backgroundColor: user.isActive ? "rgba(34,197,94,0.15)" : "var(--bg-elevated)",
                        color: user.isActive ? "#22c55e" : "var(--text-muted)",
                      }}>
                        {user.isActive ? "ATIVO" : "INATIVO"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Panel */}
        <div className="space-y-4">
          {selectedUser ? (
            <>
              <div className="p-4 rounded-xl" style={cardStyle}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold" style={{
                    backgroundColor: selectedUser.isActive ? "var(--accent-muted)" : "var(--bg-elevated)",
                    color: selectedUser.isActive ? "var(--accent)" : "var(--text-muted)",
                  }}>
                    {selectedUser.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{selectedUser.name}</h4>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { label: "Perfil", icon: Shield, value: <span className={cn("px-2 py-0.5 rounded-full font-medium text-[10px]", roleDefinitions[selectedUser.role].color)}>{roleDefinitions[selectedUser.role].label}</span> },
                    { label: "Agência", icon: Building2, value: <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selectedUser.agency}</span> },
                    { label: "Último Login", icon: Clock, value: <span className="font-medium" style={{ color: "var(--text-primary)" }}>{new Date(selectedUser.lastLogin).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
                    { label: "MFA", icon: Fingerprint, value: <span className="font-bold" style={{ color: selectedUser.mfaEnabled ? "#22c55e" : "#ef4444" }}>{selectedUser.mfaEnabled ? "Habilitado" : "Desabilitado"}</span> },
                  ].map(({ label, icon: Icon, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}><Icon className="h-3 w-3" /> {label}</span>
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="p-4 rounded-xl" style={cardStyle}>
                <h4 className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                  <Key className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                  Permissões por Módulo
                </h4>
                <div className="space-y-2">
                  {selectedUser.permissions.map((perm, i) => (
                    <div key={i} className="p-2 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <p className="text-[10px] font-bold mb-1" style={{ color: "var(--text-secondary)" }}>
                        {moduleLabels[perm.module] || perm.module}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {perm.actions.map((action) => {
                          const Icon = actionIcons[action];
                          return (
                            <span key={action} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
                              <Icon className="h-2.5 w-2.5" />
                              {actionLabels[action]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Access Classification */}
              <div className="p-4 rounded-xl" style={cardStyle}>
                <h4 className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                  <Lock className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
                  Classificação de Dados
                </h4>
                <div className="flex gap-1 flex-wrap">
                  {(["public", "internal", "confidential", "restricted"] as const).map((level) => {
                    const hasAccess = selectedUser.dataAccess.includes(level);
                    return (
                      <span
                        key={level}
                        className="text-[10px] px-2 py-1 rounded font-medium"
                        style={{
                          backgroundColor: hasAccess ? `${classificationColors[level]}15` : "var(--bg-elevated)",
                          color: hasAccess ? classificationColors[level] : "var(--text-muted)",
                          textDecoration: hasAccess ? "none" : "line-through",
                        }}
                      >
                        {classificationLabels[level]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center rounded-xl" style={cardStyle}>
              <UserCheck className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Selecione um usuário para visualizar permissões</p>
            </div>
          )}

          {/* Gov.br Authentication */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 12 }}>
            <h4 className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: "var(--accent)" }}>
              <Globe className="h-3.5 w-3.5" />
              Autenticação Gov.br (OpenID Connect)
            </h4>
            <div className="space-y-2 text-[10px]" style={{ color: "var(--text-secondary)" }}>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>Fluxo de Login Único:</p>
              <div className="flex items-center gap-1 flex-wrap text-[9px]">
                {["Usuário acessa PISAC", "Redirect Gov.br", "Autenticação OIDC", "Token JWT", "Acesso concedido"].map((step, i) => (
                  <span key={step} className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--bg-card)", color: "var(--accent)" }}>{step}</span>
                    {i < 4 && <ArrowRight className="h-2.5 w-2.5" style={{ color: "var(--text-muted)" }} />}
                  </span>
                ))}
              </div>
              <div className="mt-2 space-y-1">
                <p>• Login Único via Gov.br (OpenID Connect / OAuth 2.0)</p>
                <p>• MFA obrigatório para perfis Admin e Gestor</p>
                <p>• Sessão expira após 30 min de inatividade</p>
                <p>• Bloqueio após 5 tentativas falhas consecutivas</p>
              </div>
            </div>
          </div>

          {/* ICP-Brasil Digital Signature */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12 }}>
            <h4 className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: "#22c55e" }}>
              <FileCheck className="h-3.5 w-3.5" />
              Assinatura Digital ICP-Brasil
            </h4>
            <div className="space-y-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
              <p>• Certificado digital A1/A3 para validação de documentos</p>
              <p>• Assinatura de decisões críticas com carimbo de tempo</p>
              <p>• Integração com cadeia ICP-Brasil para verificação</p>
              <p>• Conformidade com MP 2.200-2/2001</p>
              <p>• Validação automática de certificados expirados/revogados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
