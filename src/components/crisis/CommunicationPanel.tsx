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
} from "lucide-react";
import type { CommunicationChannel, ChannelMessage } from "@/types";

const messageTypeConfig: Record<
  ChannelMessage["type"],
  { icon: typeof MessageSquare; label: string; color: string; bgColor: string }
> = {
  text: { icon: MessageSquare, label: "Mensagem", color: "text-gray-500", bgColor: "bg-white" },
  alert: { icon: AlertTriangle, label: "Alerta", color: "text-danger-600", bgColor: "bg-danger-50" },
  resource_request: { icon: Zap, label: "Recurso", color: "text-warning-600", bgColor: "bg-warning-50" },
  situation_report: { icon: FileText, label: "Relatório", color: "text-primary-600", bgColor: "bg-primary-50" },
  decision: { icon: Star, label: "Decisão", color: "text-purple-600", bgColor: "bg-purple-50" },
};

export default function CommunicationPanel() {
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel>(
    communicationChannels[0]
  );
  const [messageInput, setMessageInput] = useState("");
  const [messageType, setMessageType] = useState<ChannelMessage["type"]>("text");

  const onlineCount = selectedChannel.participants.filter((p) => p.isOnline).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
      {/* Channel List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary-600" />
            Canais de Comunicação
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {communicationChannels.map((channel) => {
            const crisis = crises.find((c) => c.coordinationChannelId === channel.id);
            const unread = channel.id !== selectedChannel.id ? channel.messages.length : 0;

            return (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={cn(
                  "w-full text-left p-3 border-b border-gray-100 transition-colors",
                  selectedChannel.id === channel.id
                    ? "bg-primary-50 border-l-2 border-l-primary-500"
                    : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-900 truncate max-w-[160px]">
                      {channel.name}
                    </span>
                  </div>
                  {channel.isActive && (
                    <Circle className="h-2 w-2 fill-success-500 text-success-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded",
                      channel.type === "crisis_room"
                        ? "bg-danger-50 text-danger-600"
                        : channel.type === "inter_municipal"
                        ? "bg-primary-50 text-primary-600"
                        : "bg-gray-100 text-gray-500"
                    )}
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
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {/* Channel Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              {selectedChannel.name}
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {onlineCount} de {selectedChannel.participants.length} online
            </p>
          </div>
          {selectedChannel.crisisId && (
            <span className="text-[10px] px-2 py-1 bg-danger-50 text-danger-700 rounded-full font-medium">
              Crise Ativa
            </span>
          )}
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
                  className={cn(
                    "rounded-lg p-3 border",
                    config.bgColor,
                    msg.priority === "urgent"
                      ? "border-l-4 border-l-danger-500 border-danger-200"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    <span className="text-xs font-bold text-gray-900">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {msg.senderAgency}
                    </span>
                    {msg.priority === "urgent" && (
                      <span className="text-[10px] text-danger-700 bg-danger-100 px-1.5 py-0.5 rounded font-medium">
                        URGENTE
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 ml-auto">
                      {timeAgo(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              );
            })}
        </div>

        {/* Message Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex gap-2 mb-2">
            {(Object.entries(messageTypeConfig) as [ChannelMessage["type"], typeof messageTypeConfig[ChannelMessage["type"]]][]).map(
              ([type, config]) => (
                <button
                  key={type}
                  onClick={() => setMessageType(type)}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-full border transition-colors flex items-center gap-1",
                    messageType === type
                      ? `${config.bgColor} ${config.color} border-current font-medium`
                      : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                  )}
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
              placeholder="Escreva uma mensagem..."
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && messageInput.trim()) {
                  setMessageInput("");
                }
              }}
            />
            <button
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              onClick={() => {
                if (messageInput.trim()) setMessageInput("");
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Participants Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            Participantes ({selectedChannel.participants.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {/* Online */}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
            Online ({selectedChannel.participants.filter((p) => p.isOnline).length})
          </p>
          {selectedChannel.participants
            .filter((p) => p.isOnline)
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <div className="relative">
                  <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <Circle className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-success-500 text-white stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-gray-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate">
                    {p.role} • {p.agency}
                  </p>
                </div>
              </div>
            ))}

          {/* Offline */}
          {selectedChannel.participants.some((p) => !p.isOnline) && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1 mt-3">
                Offline (
                {selectedChannel.participants.filter((p) => !p.isOnline).length})
              </p>
              {selectedChannel.participants
                .filter((p) => !p.isOnline)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-50"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-gray-700 truncate">
                        {p.name}
                      </p>
                      <p className="text-[9px] text-gray-400 truncate">
                        {p.role} • {p.agency}
                      </p>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Crisis Info */}
        {selectedChannel.crisisId && (
          <div className="p-3 border-t border-gray-200">
            <div className="p-2 bg-danger-50 rounded-lg border border-danger-200">
              <p className="text-[10px] font-bold text-danger-700 mb-1">
                Crise Vinculada
              </p>
              <p className="text-[10px] text-danger-600">
                {crises.find((c) => c.id === selectedChannel.crisisId)?.title}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
