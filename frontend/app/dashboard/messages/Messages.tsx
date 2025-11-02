"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserMessageType,
  UserMessageDataWithPagination,
} from "@/app/types/types";
import Api from "@/app/components/Api";
import { Separator } from "@/components/ui/separator";

/* --- Tiny RoleBadge so you don't need another component --- */
function RoleBadge({ role }: { role: string }) {
  const cls =
    role === "AI"
      ? "bg-emerald-100 text-emerald-700"
      : role === "SYSTEM"
      ? "bg-zinc-200 text-zinc-700"
      : "bg-blue-100 text-blue-700"; // HUMAN
  return (
    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${cls}`}>
      {role}
    </span>
  );
}

interface Props {
  initialData: UserMessageDataWithPagination;
  token: string;
  onSelect: ({
    sessionId,
    botSlug,
  }: {
    sessionId: string;
    botSlug: string;
  }) => void;
  botFilter: string; // "ALL" or chat.slug
  selectedId?: { sessionId: string; botSlug: string } | null; // to style the active card
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
      return;
    }
  };

  // Date separators
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

  return (
    <div className="space-y-4">
      {rows.map((row, idx) =>
        row.type === "sep" ? (
          <DateDivider key={`sep-${idx}`} label={row.label} />
        ) : (
          <Card
            key={`msg-${idx}`}
            onClick={() =>
              onSelect({
                sessionId: row.msg.session_id,
                botSlug: row.msg.chat.slug,
              })
            }
            className={[
              "cursor-pointer bg-white border-zinc-200 transition",
              "hover:shadow-md hover:border-amber-300/60 hover:bg-amber-50/30",
              selectedId?.sessionId === row.msg.session_id &&
              selectedId?.botSlug === row.msg.chat.slug
                ? "ring-2 ring-amber-400 border-amber-400 bg-amber-50"
                : "",
            ].join(" ")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-x-3 min-w-0">
                  <Avatar className="shrink-0 ring-1 ring-amber-200">
                    {row.msg.chat.assistant_picture_url ? (
                      <AvatarImage
                        src={row.msg.chat.assistant_picture_url}
                        alt="Bot"
                      />
                    ) : (
                      <AvatarFallback className="bg-amber-200 text-amber-900">
                        {(
                          row.msg.chat.assistant_name ||
                          row.msg.chat.name ||
                          "A"
                        ).charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0">
                    {/* Title: bot display (no session id) */}
                    <span className="font-medium text-zinc-900 capitalize block truncate">
                      {row.msg.chat.assistant_name || row.msg.chat.name}
                    </span>
                    {/* Subheadline: user name or Anonymous + Role */}
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="truncate">
                        {row.msg.username?.trim()
                          ? row.msg.username
                          : "Anonymous"}
                      </span>
                      <span>•</span>
                      <RoleBadge role={row.msg.message_type} />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-amber-700 whitespace-nowrap">
                  {fmtTime(row.msg.created)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Preview: clamp to 2 lines */}
              <p className="text-zinc-800 line-clamp-2">{row.msg.message}</p>
            </CardContent>
          </Card>
        )
      )}

      <div className="flex justify-between pt-4">
        <button
          className="text-sm text-amber-700 disabled:text-zinc-300"
          disabled={!prev}
          onClick={() => prev && fetchPage(prev)}
        >
          Previous
        </button>
        <button
          className="text-sm text-amber-700 disabled:text-zinc-300"
          disabled={!next}
          onClick={() => next && fetchPage(next)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Messages;

/* --- centered date divider (light) --- */
function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-2">
      <div className="relative flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-[10px] tracking-wide text-amber-700 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
          {label.toUpperCase()}
        </span>
        <Separator className="flex-1" />
      </div>
    </div>
  );
}
