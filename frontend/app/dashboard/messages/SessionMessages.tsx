"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Api from "@/app/components/Api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMessageType } from "@/app/types/types";
import { Send } from "lucide-react";

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

  // human takeover state
  const [takeover, setTakeover] = useState(false);
  const [text, setText] = useState("");

  // initial fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);
    setNext(null);
    setPrev(null);
    setTakeover(false);
    (async () => {
      try {
        // ⬇️ If your API is different, replace this call:
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  // scroll to bottom on new messages
  const areaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const fmtTime = (iso: string) =>
    new Date(iso)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace("AM", "am")
      .replace("PM", "pm");

  const onSend = async () => {
    if (!takeover || !text.trim()) return;
    const payload = text.trim();
    setText("");
    try {
      // TODO: ADD human handoff
      //const created = await api.send_human_message(sessionId, payload);
      // optimistic fallback if API returns nothing useful
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

  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Conversation</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                id="takeover"
                checked={takeover}
                onCheckedChange={(v) => setTakeover(Boolean(v))}
              />
              <Label htmlFor="takeover" className="text-sm">
                {takeover
                  ? "You are taking over"
                  : "AI is handling the conversation"}
              </Label>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 h-[calc(100%-56px)] flex flex-col gap-3">
          {/* Thread */}
          <ScrollArea
            ref={areaRef as any}
            className="flex-1 rounded-md border bg-white p-3"
          >
            <div className="space-y-3">
              {loading && <div className="text-sm text-zinc-500">Loading…</div>}
              {!loading &&
                messages.map((m, i) => {
                  const mine = m.message_type === "HUMAN";
                  return (
                    <div
                      className={`flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                      key={m.created + i}
                    >
                      {!mine && (
                        <Avatar className="mr-2 h-6 w-6">
                          <AvatarImage
                            src={m.chat.assistant_picture_url || ""}
                          />
                          <AvatarFallback>🤖</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={[
                          "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                          mine
                            ? "bg-amber-400 text-amber-950"
                            : "bg-zinc-300 text-zinc-900",
                        ].join(" ")}
                      >
                        <p className="whitespace-pre-wrap">{m.message}</p>
                        <div
                          className={`mt-1 text-[10px] ${
                            mine ? "text-amber-900/70" : "text-zinc-700"
                          }`}
                        >
                          {fmtTime(m.created)}
                        </div>
                      </div>
                      {mine && (
                        <Avatar className="ml-2 h-6 w-6">
                          <AvatarImage src="" />
                          <AvatarFallback>🙂</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                takeover ? "Type a reply…" : "Enable takeover to reply"
              }
              className="min-h-[44px]"
            />
            <Button
              onClick={onSend}
              disabled={!takeover || !text.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
