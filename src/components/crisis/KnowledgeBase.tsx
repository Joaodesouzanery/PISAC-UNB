"use client";

import { useState } from "react";
import { contingencyPlans } from "@/data/crisis-data";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Search,
  FileText,
  Tag,
  Calendar,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Download,
  Filter,
} from "lucide-react";

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const planTypes = Array.from(new Set(contingencyPlans.map((p) => p.type)));

  const filteredPlans = contingencyPlans.filter((plan) => {
    if (filterType !== "all" && plan.type !== filterType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        plan.title.toLowerCase().includes(search) ||
        plan.description.toLowerCase().includes(search) ||
        plan.tags.some((t) => t.toLowerCase().includes(search)) ||
        plan.lessonsLearned.some((l) => l.toLowerCase().includes(search))
      );
    }
    return true;
  });

  // Aggregate all lessons learned
  const allLessons = contingencyPlans.flatMap((p) =>
    p.lessonsLearned.map((lesson) => ({
      lesson,
      source: p.title,
      type: p.type,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar planos, protocolos, lições aprendidas..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white"
            >
              <option value="all">Todos os tipos</option>
              {planTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-gray-400">
            {filteredPlans.length} documentos encontrados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-600" />
            Planos de Contingência e Protocolos
          </h3>

          {filteredPlans.map((plan) => {
            const isExpanded = expandedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <button
                  onClick={() =>
                    setExpandedPlan(isExpanded ? null : plan.id)
                  }
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-600 flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900">
                        {plan.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-medium">
                        v{plan.version}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {plan.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {plan.lastUpdated}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {plan.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {plan.municipality}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-700 leading-relaxed mb-3">
                      {plan.description}
                    </p>

                    {/* Tags */}
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Tags
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {plan.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Lessons Learned */}
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3 text-warning-500" />
                        Lições Aprendidas
                      </p>
                      <div className="space-y-1.5">
                        {plan.lessonsLearned.map((lesson, i) => (
                          <div
                            key={i}
                            className="flex gap-2 p-2 bg-warning-50 rounded-lg border border-warning-200"
                          >
                            <Lightbulb className="h-3 w-3 text-warning-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-warning-800">
                              {lesson}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
                      <Download className="h-3 w-3" />
                      Baixar documento completo
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar: Lessons Learned */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning-500" />
              Lições Aprendidas Consolidadas
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
              {allLessons.map((item, i) => (
                <div
                  key={i}
                  className="p-2 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {item.lesson}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <FileText className="h-2.5 w-2.5" />
                    {item.source}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Estatísticas da Base
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Planos de contingência</span>
                <span className="font-bold text-gray-900">
                  {contingencyPlans.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lições aprendidas</span>
                <span className="font-bold text-gray-900">
                  {allLessons.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipos de protocolo</span>
                <span className="font-bold text-gray-900">
                  {planTypes.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Última atualização</span>
                <span className="font-bold text-gray-900">
                  {contingencyPlans
                    .sort(
                      (a, b) =>
                        new Date(b.lastUpdated).getTime() -
                        new Date(a.lastUpdated).getTime()
                    )[0]
                    ?.lastUpdated}
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-primary-50 rounded-lg border border-primary-200 p-4">
            <h3 className="text-sm font-bold text-primary-900 mb-2">
              Ações Recomendadas
            </h3>
            <div className="space-y-1.5 text-xs text-primary-700">
              <p>
                1. Revisar plano de inundações com dados do evento atual
              </p>
              <p>
                2. Atualizar protocolo de coordenação intermunicipal com novas
                lições
              </p>
              <p>
                3. Agendar exercício simulado pós-crise em 30 dias
              </p>
              <p>
                4. Documentar gaps de recursos identificados durante resposta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
