"use client";

import React, { useEffect, useRef, useState } from "react";
import Api from "@/app/components/Api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMessageType } from "@/app/types/types";
import { Send, Loader2, Bot, User, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  botSlug: string;
  sessionId: string;
  token: string;
}

export default function SessionMessages({ botSlug, sessionId, token }: Props) {
  const api = new Api(token);
  const [messages, setMessages] = useState<UserMessageType[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [prev, setPrev] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [takeover, setTakeover] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);
    setNext(null);
    setPrev(null);
    setTakeover(false);
    (async () => {
      try {
        const data = await api.get_messages_by_session(botSlug, sessionId);
        if (cancelled) return;
        setMessages(data.results || []);
        setNext(data.next || null);
        setPrev(data.prev || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const fmtTime = (iso: string) =>
    new Date(iso)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace("AM", "am")
      .replace("PM", "pm");

  const onTakeoverChange = async (checked: boolean) => {
    try {
      await api.send_human_handoff(botSlug, sessionId, { is_handoff: checked });
      setTakeover(checked);
    } catch (e) {
      console.error("Human takeover failed.");
    }
  };

  const onSend = async () => {
    if (!takeover || !text.trim()) return;
    const payload = text.trim();
    setText("");
    try {
      const msg: UserMessageType = {
        username: "Agent",
        message: payload,
        message_type: "HUMAN",
        session_id: sessionId,
        created: new Date().toISOString(),
        chat: { name: "You", slug: "human" },
      };
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      console.error("send failed", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <Headphones className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Conversation</h3>
            <p className="text-xs text-slate-500">
              Session: {sessionId.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              takeover
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            )}
          >
            {takeover ? (
              <>
                <User className="h-3.5 w-3.5" />
                You&apos;re responding
              </>
            ) : (
              <>
                <Bot className="h-3.5 w-3.5" />
                AI handling
              </>
            )}
          </div>
          <Switch
            id="takeover"
            checked={takeover}
            onCheckedChange={(v) => onTakeoverChange(Boolean(v))}
          />
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50"
      >
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-slate-500">No messages in this conversation</p>
          </div>
        )}

        {!loading &&
          messages.map((m, i) => {
            const isHuman = m.message_type === "HUMAN";
            return (
              <div
                key={m.created + i}
                className={cn("flex gap-3", isHuman ? "flex-row-reverse" : "")}
              >
                <Avatar
                  className={cn(
                    "h-8 w-8 shrink-0",
                    isHuman ? "ring-2 ring-slate-200" : "ring-2 ring-emerald-200"
                  )}
                >
                  {!isHuman && m.chat.assistant_picture_url ? (
                    <AvatarImage src={m.chat.assistant_picture_url} />
                  ) : null}
                  <AvatarFallback
                    className={cn(
                      isHuman
                        ? "bg-slate-700 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {isHuman ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5",
                    isHuman
                      ? "bg-slate-900 text-white rounded-tr-md"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {m.message}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] mt-1.5",
                      isHuman ? "text-slate-400" : "text-slate-400"
                    )}
                  >
                    {fmtTime(m.created)}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={text}
              disabled={!takeover}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                takeover
                  ? "Type your message... (Enter to send)"
                  : "Enable takeover to respond"
              }
              rows={1}
              className={cn(
                "w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all",
                !takeover && "bg-slate-50 cursor-not-allowed"
              )}
            />
          </div>
          <Button
            onClick={onSend}
            disabled={!takeover || !text.trim()}
            className="h-[46px] px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!takeover && (
          <p className="text-xs text-slate-400 mt-2 text-center">
            Toggle the switch above to take over this conversation
          </p>
        )}
      </div>
    </div>
  );
}
