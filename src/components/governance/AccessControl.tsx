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

const classificationColors: Record<string, string> = {
  public: "bg-green-100 text-green-700",
  internal: "bg-blue-100 text-blue-700",
  confidential: "bg-orange-100 text-orange-700",
  restricted: "bg-red-100 text-red-700",
};

const classificationLabels: Record<string, string> = {
  public: "Público",
  internal: "Interno",
  confidential: "Confidencial",
  restricted: "Restrito",
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

  return (
    <div className="space-y-6">
      {/* RBAC Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-primary-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="h-3 w-3" /> Usuários Cadastrados
          </p>
          <p className="text-xl font-bold text-gray-900">{systemUsers.length}</p>
          <p className="text-[10px] text-gray-400">{activeUsers} ativos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-success-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Fingerprint className="h-3 w-3" /> MFA Habilitado
          </p>
          <p className="text-xl font-bold text-success-600">{mfaEnabled}/{systemUsers.length}</p>
          <p className="text-[10px] text-gray-400">
            {((mfaEnabled / systemUsers.length) * 100).toFixed(0)}% cobertura
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-warning-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Key className="h-3 w-3" /> Perfis de Acesso
          </p>
          <p className="text-xl font-bold text-gray-900">{Object.keys(roleDefinitions).length}</p>
          <p className="text-[10px] text-gray-400">RBAC granular por módulo</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-danger-500 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <UserX className="h-3 w-3" /> Usuários Inativos
          </p>
          <p className="text-xl font-bold text-danger-600">
            {systemUsers.length - activeUsers}
          </p>
          <p className="text-[10px] text-gray-400">credenciais suspensas</p>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary-600" />
          Distribuição de Perfis (RBAC)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {roleDistribution.map((r) => (
            <div key={r.role} className="text-center">
              <div className={cn("inline-block px-3 py-1.5 rounded-lg text-xs font-bold mb-1", r.color)}>
                {r.label}
              </div>
              <p className="text-lg font-bold text-gray-900">{r.count}</p>
              <p className="text-[10px] text-gray-400">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, email ou agência..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
            >
              <option value="all">Todos os perfis</option>
              {Object.entries(roleDefinitions).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-2">Usuário</th>
                  <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-2">Perfil</th>
                  <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-2 hidden md:table-cell">Agência</th>
                  <th className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-2">MFA</th>
                  <th className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 transition-colors",
                      selectedUser?.id === user.id && "bg-primary-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", roleDefinitions[user.role].color)}>
                        {roleDefinitions[user.role].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-600">{user.agency}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.mfaEnabled ? (
                        <CheckCircle className="h-4 w-4 text-success-500 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isActive ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-success-100 text-success-700 rounded font-bold">ATIVO</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-bold">INATIVO</span>
                      )}
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold",
                    selectedUser.isActive ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {selectedUser.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{selectedUser.name}</h4>
                    <p className="text-[10px] text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1"><Shield className="h-3 w-3" /> Perfil</span>
                    <span className={cn("px-2 py-0.5 rounded-full font-medium text-[10px]", roleDefinitions[selectedUser.role].color)}>
                      {roleDefinitions[selectedUser.role].label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1"><Building2 className="h-3 w-3" /> Agência</span>
                    <span className="font-medium text-gray-900">{selectedUser.agency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Último Login</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedUser.lastLogin).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1"><Fingerprint className="h-3 w-3" /> MFA</span>
                    <span className={cn("font-bold", selectedUser.mfaEnabled ? "text-success-600" : "text-danger-600")}>
                      {selectedUser.mfaEnabled ? "Habilitado" : "Desabilitado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1">
                  <Key className="h-3.5 w-3.5 text-primary-600" />
                  Permissões por Módulo
                </h4>
                <div className="space-y-2">
                  {selectedUser.permissions.map((perm, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] font-bold text-gray-700 mb-1">
                        {moduleLabels[perm.module] || perm.module}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {perm.actions.map((action) => {
                          const Icon = actionIcons[action];
                          return (
                            <span key={action} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded font-medium">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-warning-600" />
                  Classificação de Dados
                </h4>
                <div className="flex gap-1 flex-wrap">
                  {(["public", "internal", "confidential", "restricted"] as const).map((level) => (
                    <span
                      key={level}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded font-medium",
                        selectedUser.dataAccess.includes(level)
                          ? classificationColors[level]
                          : "bg-gray-100 text-gray-300 line-through"
                      )}
                    >
                      {classificationLabels[level]}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <UserCheck className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Selecione um usuário para visualizar permissões</p>
            </div>
          )}

          {/* Auth Info */}
          <div className="bg-primary-50 rounded-lg border border-primary-200 p-4">
            <h4 className="text-xs font-bold text-primary-900 mb-2 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              Autenticação Gov.br
            </h4>
            <div className="space-y-1.5 text-[10px] text-primary-800">
              <p>• Login Único via Gov.br (OpenID Connect)</p>
              <p>• MFA obrigatório para perfis Admin e Gestor</p>
              <p>• Sessão expira após 30 min de inatividade</p>
              <p>• Bloqueio após 5 tentativas falhas consecutivas</p>
              <p>• Certificado digital ICP-Brasil aceito</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
