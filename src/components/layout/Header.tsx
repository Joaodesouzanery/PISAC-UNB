"use client";

import { Bell, Search, User, Clock } from "lucide-react";
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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="font-mono">{currentTime}</span>
        </div>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-8 w-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium hidden md:inline">Operador</span>
        </div>
      </div>
    </header>
  );
}
