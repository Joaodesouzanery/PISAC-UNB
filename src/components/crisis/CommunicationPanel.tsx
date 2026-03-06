"use client";

import { useState } from "react";
import { communicationChannels, crises } from "@/data/crisis-data";
import { cn, timeAgo } from "@/lib/utils";
import {
  MessageSquare,
  Hash,
  Users,
  Circle,
  Send,
  AlertTriangle,
  FileText,
  Zap,
  Star,
  Radio,
  Shield,
  Video,
  Lock,
  Bell,
  PhoneCall,
} from "lucide-react";
import type { CommunicationChannel, ChannelMessage } from "@/types";

const messageTypeConfig: Record<
  ChannelMessage["type"],
  { icon: typeof MessageSquare; label: string; color: string; bgVar: string }
> = {
  text: { icon: MessageSquare, label: "Mensagem", color: "var(--text-muted)", bgVar: "" },
  alert: { icon: AlertTriangle, label: "Alerta", color: "#ef4444", bgVar: "rgba(239,68,68,0.08)" },
  resource_request: { icon: Zap, label: "Recurso", color: "#f59e0b", bgVar: "rgba(245,158,11,0.08)" },
  situation_report: { icon: FileText, label: "Relatório", color: "#3b82f6", bgVar: "rgba(59,130,246,0.08)" },
  decision: { icon: Star, label: "Decisão", color: "#8b5cf6", bgVar: "rgba(139,92,246,0.08)" },
};

export default function CommunicationPanel() {
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel>(
    communicationChannels[0]
  );
  const [messageInput, setMessageInput] = useState("");
  const [messageType, setMessageType] = useState<ChannelMessage["type"]>("text");

  const onlineCount = selectedChannel.participants.filter((p) => p.isOnline).length;
  const cardStyle: React.CSSProperties = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12 };

  return (
    <div className="space-y-4">
      {/* CAP / Secure Communication Banner */}
      <div
        className="rounded-xl p-3 flex items-center gap-3 flex-wrap"
        style={{ backgroundColor: "var(--accent-muted)", border: "1px solid rgba(249,115,22,0.3)" }}
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
            Comunicação Segura
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> E2E Criptografado
          </span>
          <span className="flex items-center gap-1">
            <Bell className="h-3 w-3" /> CAP (Common Alerting Protocol)
          </span>
          <span className="flex items-center gap-1">
            <Video className="h-3 w-3" /> Videoconferência Integrada
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Registro para Auditoria
          </span>
          <span className="flex items-center gap-1">
            <PhoneCall className="h-3 w-3" /> VoIP Emergencial
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-280px)]">
        {/* Channel List */}
        <div className="flex flex-col" style={cardStyle}>
          <div className="p-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Radio className="h-4 w-4" style={{ color: "var(--accent)" }} />
              Canais de Comunicação
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {communicationChannels.map((channel) => {
              const crisis = crises.find((c) => c.coordinationChannelId === channel.id);
              const isSelected = selectedChannel.id === channel.id;

              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className="w-full text-left p-3 transition-colors"
                  style={{
                    backgroundColor: isSelected ? "var(--accent-muted)" : "transparent",
                    borderBottom: "1px solid var(--border-subtle)",
                    borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                      <span className="text-xs font-medium truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>
                        {channel.name}
                      </span>
                    </div>
                    {channel.isActive && (
                      <Circle className="h-2 w-2 fill-success-500 text-success-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          channel.type === "crisis_room"
                            ? "rgba(239,68,68,0.1)"
                            : channel.type === "inter_municipal"
                            ? "rgba(59,130,246,0.1)"
                            : "var(--bg-elevated)",
                        color:
                          channel.type === "crisis_room"
                            ? "#ef4444"
                            : channel.type === "inter_municipal"
                            ? "#3b82f6"
                            : "var(--text-muted)",
                      }}
                    >
                      {channel.type === "crisis_room"
                        ? "Sala de Crise"
                        : channel.type === "inter_municipal"
                        ? "Intermunicipal"
                        : channel.type === "field_ops"
                        ? "Operações"
                        : "Agência"}
                    </span>
                    <span>{channel.participants.length} membros</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Area */}
        <div className="lg:col-span-2 flex flex-col" style={cardStyle}>
          {/* Channel Header */}
          <div className="p-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Hash className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                {selectedChannel.name}
                <Lock className="h-3 w-3" style={{ color: "#22c55e" }} />
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                {onlineCount} de {selectedChannel.participants.length} online • Criptografia E2E ativa
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px]" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--accent)" }}>
                <Video className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px]" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--accent)" }}>
                <PhoneCall className="h-4 w-4" />
              </button>
              {selectedChannel.crisisId && (
                <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  Crise Ativa
                </span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
            {selectedChannel.messages
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .map((msg) => {
                const config = messageTypeConfig[msg.type];
                const Icon = config.icon;

                return (
                  <div
                    key={msg.id}
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: config.bgVar || "var(--bg-elevated)",
                      border: msg.priority === "urgent" ? "1px solid #ef4444" : "1px solid var(--border-subtle)",
                      borderLeft: msg.priority === "urgent" ? "4px solid #ef4444" : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                        {msg.senderAgency}
                      </span>
                      {msg.priority === "urgent" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                          URGENTE
                        </span>
                      )}
                      <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>
                        {timeAgo(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                      {msg.content}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Message Input */}
          <div className="p-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
            <div className="flex gap-2 mb-2">
              {(Object.entries(messageTypeConfig) as [ChannelMessage["type"], typeof messageTypeConfig[ChannelMessage["type"]]][]).map(
                ([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setMessageType(type)}
                    className="text-[10px] px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                    style={{
                      backgroundColor: messageType === type ? "var(--accent-muted)" : "var(--bg-elevated)",
                      color: messageType === type ? "var(--accent)" : "var(--text-muted)",
                      border: `1px solid ${messageType === type ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <config.icon className="h-3 w-3" />
                    {config.label}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Escreva uma mensagem segura..."
                className="flex-1 text-xs rounded-lg px-3 py-2"
                style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && messageInput.trim()) setMessageInput("");
                }}
              />
              <button
                className="px-3 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                onClick={() => { if (messageInput.trim()) setMessageInput(""); }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        <div className="flex flex-col" style={cardStyle}>
          <div className="p-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Users className="h-4 w-4" style={{ color: "var(--accent)" }} />
              Participantes ({selectedChannel.participants.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
            {/* Online */}
            <p className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1" style={{ color: "var(--text-muted)" }}>
              Online ({selectedChannel.participants.filter((p) => p.isOnline).length})
            </p>
            {selectedChannel.participants
              .filter((p) => p.isOnline)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
                      {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-success-500 text-white stroke-[3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-[9px] truncate" style={{ color: "var(--text-muted)" }}>{p.role} • {p.agency}</p>
                  </div>
                </div>
              ))}

            {/* Offline */}
            {selectedChannel.participants.some((p) => !p.isOnline) && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1 mt-3" style={{ color: "var(--text-muted)" }}>
                  Offline ({selectedChannel.participants.filter((p) => !p.isOnline).length})
                </p>
                {selectedChannel.participants
                  .filter((p) => !p.isOnline)
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-50">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                        {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium truncate" style={{ color: "var(--text-muted)" }}>{p.name}</p>
                        <p className="text-[9px] truncate" style={{ color: "var(--text-muted)" }}>{p.role} • {p.agency}</p>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Crisis Info */}
          {selectedChannel.crisisId && (
            <div className="p-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
              <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p className="text-[10px] font-bold mb-1" style={{ color: "#ef4444" }}>Crise Vinculada</p>
                <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                  {crises.find((c) => c.id === selectedChannel.crisisId)?.title}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
