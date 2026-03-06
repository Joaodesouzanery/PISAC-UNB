"use client";

import { User, Clock, ShieldCheck, Lock, Network, Search, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

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
      className="px-6 py-3 flex items-center justify-between"
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-0.5">
          <span style={{ color: "var(--text-muted)" }}>PISAC</span>
          <ChevronRight className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
          <span style={{ color: "var(--accent)" }}>{title}</span>
        </div>
        {subtitle && (
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
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
        <div className="hidden lg:flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: "#4ade80",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <ShieldCheck className="h-3 w-3" /> LGPD
          </span>
          <span
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <Network className="h-3 w-3" /> e-PING
          </span>
          <span
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              color: "#a78bfa",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <Lock className="h-3 w-3" /> Gov.br
          </span>
        </div>

        <div className="w-px h-5" style={{ backgroundColor: "var(--border-primary)" }} />

        {/* Time */}
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-[11px]">{currentTime}</span>
        </div>

        <div className="w-px h-5" style={{ backgroundColor: "var(--border-primary)" }} />

        {/* User */}
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
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
