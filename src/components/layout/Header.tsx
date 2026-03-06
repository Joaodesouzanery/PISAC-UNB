"use client";

import { User, Clock, ShieldCheck, Lock, Network } from "lucide-react";
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
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {/* GovTech Compliance Badges */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[9px] px-2 py-1 bg-success-50 text-success-700 rounded-full font-medium border border-success-200">
            <ShieldCheck className="h-3 w-3" /> LGPD
          </span>
          <span className="flex items-center gap-1 text-[9px] px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
            <Network className="h-3 w-3" /> e-PING
          </span>
          <span className="flex items-center gap-1 text-[9px] px-2 py-1 bg-purple-50 text-purple-700 rounded-full font-medium border border-purple-200">
            <Lock className="h-3 w-3" /> Gov.br
          </span>
        </div>
        <div className="h-5 w-px bg-gray-200 hidden lg:block" />
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="font-mono text-xs">{currentTime}</span>
        </div>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-8 w-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-gray-900">Carlos Ribeiro</p>
            <p className="text-[9px] text-gray-400">Admin • Defesa Civil</p>
          </div>
        </div>
      </div>
    </header>
  );
}
