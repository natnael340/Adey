"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserMessageType,
  UserMessageDataWithPagination,
} from "@/app/types/types";
import Api from "@/app/components/Api";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

function RoleBadge({ role }: { role: string }) {
  const config = {
    AI: "bg-emerald-100 text-emerald-700",
    SYSTEM: "bg-slate-100 text-slate-600",
    HUMAN: "bg-blue-100 text-blue-700",
  }[role] || "bg-slate-100 text-slate-600";

  return (
    <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${config}`}>
      {role}
    </span>
  );
}

interface Props {
  initialData: UserMessageDataWithPagination;
  token: string;
  onSelect: (args: { sessionId: string; botSlug: string }) => void;
  botFilter: string;
  selectedId?: { sessionId: string; botSlug: string } | null;
}

const Messages = ({
  initialData,
  token,
  onSelect,
  botFilter,
  selectedId,
}: Props) => {
  const [messages, setMessages] = useState<UserMessageType[]>(
    initialData.results
  );
  const [next, setNext] = useState<string | null>(initialData.next);
  const [prev, setPrev] = useState<string | null>(initialData.prev);
  const api = new Api(token);

  const fetchPage = async (
    url?: string,
    query_params?: Record<string, string>
  ) => {
    try {
      const data = await api.get_messages(url, query_params);
      setMessages(data.results);
      setNext(data.next);
      setPrev(data.prev);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  type Row =
    | { type: "sep"; label: string }
    | { type: "msg"; msg: UserMessageType };

  const rows: Row[] = useMemo(() => {
    const toDay = (iso: string) =>
      new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    const out: Row[] = [];
    let last = "";
    for (const m of messages) {
      const day = toDay(m.created);
      if (day !== last) {
        out.push({ type: "sep", label: day });
        last = day;
      }
      out.push({ type: "msg", msg: m });
    }
    return out;
  }, [messages]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        if (botFilter === "ALL") {
          await fetchPage();
        } else {
          await fetchPage(undefined, { bot_slug: botFilter });
        }
      } catch (err) {
        if (!canceled) {
          console.error("Failed to fetch messages:", err);
        }
      }
    })();
  }, [botFilter]);

  const fmtTime = (iso: string) =>
    new Date(iso)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace("AM", "am")
      .replace("PM", "pm");

  const isSelected = (msg: UserMessageType) =>
    selectedId?.sessionId === msg.session_id &&
    selectedId?.botSlug === msg.chat.slug;

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
          <MessageSquare className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 text-center">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {rows.map((row, idx) =>
          row.type === "sep" ? (
            <div
              key={`sep-${idx}`}
              className="sticky top-0 z-10 px-4 py-2 bg-slate-50/95 backdrop-blur-sm"
            >
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {row.label}
              </span>
            </div>
          ) : (
            <div
              key={`msg-${idx}`}
              onClick={() =>
                onSelect({
                  sessionId: row.msg.session_id,
                  botSlug: row.msg.chat.slug,
                })
              }
              className={cn(
                "px-4 py-3 cursor-pointer border-b border-slate-100 transition-colors",
                isSelected(row.msg)
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-50"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className={cn(
                  "h-10 w-10 shrink-0",
                  isSelected(row.msg) ? "ring-2 ring-white/20" : "ring-1 ring-slate-200"
                )}>
                  {row.msg.chat.assistant_picture_url ? (
                    <AvatarImage
                      src={row.msg.chat.assistant_picture_url}
                      alt="Bot"
                    />
                  ) : (
                    <AvatarFallback className={cn(
                      isSelected(row.msg)
                        ? "bg-slate-700 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {(
                        row.msg.chat.assistant_name ||
                        row.msg.chat.name ||
                        "A"
                      ).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={cn(
                      "font-medium text-sm capitalize truncate",
                      isSelected(row.msg) ? "text-white" : "text-slate-800"
                    )}>
                      {row.msg.chat.assistant_name || row.msg.chat.name}
                    </span>
                    <span className={cn(
                      "text-[11px] whitespace-nowrap",
                      isSelected(row.msg) ? "text-slate-400" : "text-slate-400"
                    )}>
                      {fmtTime(row.msg.created)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn(
                      "text-xs truncate",
                      isSelected(row.msg) ? "text-slate-400" : "text-slate-500"
                    )}>
                      {row.msg.username?.trim() || "Anonymous"}
                    </span>
                    {!isSelected(row.msg) && (
                      <RoleBadge role={row.msg.message_type} />
                    )}
                  </div>

                  <p className={cn(
                    "text-sm line-clamp-2",
                    isSelected(row.msg) ? "text-slate-300" : "text-slate-600"
                  )}>
                    {row.msg.message}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      {(prev || next) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium transition-colors",
              prev
                ? "text-slate-700 hover:text-slate-900"
                : "text-slate-300 cursor-not-allowed"
            )}
            disabled={!prev}
            onClick={() => prev && fetchPage(prev)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium transition-colors",
              next
                ? "text-slate-700 hover:text-slate-900"
                : "text-slate-300 cursor-not-allowed"
            )}
            disabled={!next}
            onClick={() => next && fetchPage(next)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Messages;
