"use client";

import { User, Clock, ShieldCheck, Lock, Network, Search, ChevronRight, Sun, Moon, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="px-3 sm:px-6 py-3 flex items-center justify-between gap-2"
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs mb-0.5">
            <span className="hidden sm:inline" style={{ color: "var(--text-muted)" }}>PISAC</span>
            <ChevronRight className="h-3 w-3 hidden sm:block" style={{ color: "var(--text-muted)" }} />
            <span className="truncate" style={{ color: "var(--accent)" }}>{title}</span>
          </div>
          {subtitle && (
            <p className="text-[11px] truncate hidden sm:block" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search
            className="absolute left-3 h-3.5 w-3.5"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-1.5 rounded-lg text-xs w-48 focus:w-64 transition-all"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Compliance Badges */}
        <div className="hidden xl:flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: theme === "dark" ? "#4ade80" : "#16a34a",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <ShieldCheck className="h-3 w-3" /> LGPD
          </span>
          <span
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: theme === "dark" ? "#60a5fa" : "#2563eb",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <Network className="h-3 w-3" /> e-PING
          </span>
          <span
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              color: theme === "dark" ? "#a78bfa" : "#7c3aed",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <Lock className="h-3 w-3" /> Gov.br
          </span>
        </div>

        <div className="w-px h-5 hidden sm:block" style={{ backgroundColor: "var(--border-primary)" }} />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-primary)",
          }}
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-px h-5 hidden sm:block" style={{ backgroundColor: "var(--border-primary)" }} />

        {/* Time */}
        <div className="hidden sm:flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-[11px]">{currentTime}</span>
        </div>

        <div className="w-px h-5 hidden md:block" style={{ backgroundColor: "var(--border-primary)" }} />

        {/* User */}
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "var(--accent-muted)",
              color: "var(--accent)",
            }}
          >
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              Carlos Ribeiro
            </p>
            <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
              Admin &bull; Defesa Civil
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
