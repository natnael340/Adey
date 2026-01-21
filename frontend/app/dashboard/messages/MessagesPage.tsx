"use client";

import React, { useState } from "react";
import Messages from "./Messages";
import SessionMessages from "./SessionMessages";
import { ChatType, UserMessageDataWithPagination } from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Inbox } from "lucide-react";

interface Props {
  initialData: UserMessageDataWithPagination;
  bots: ChatType[];
  token: string;
}

const MessagesPage = ({ initialData, token, bots }: Props) => {
  const [selected, setSelected] = useState<{
    sessionId: string;
    botSlug: string;
  } | null>(null);
  const [bot, setBot] = useState<string>("ALL");

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      {/* Sidebar - Conversation list */}
      <div className="w-[380px] flex flex-col bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        {/* Filter header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-slate-400" />
            <Select value={bot} onValueChange={setBot}>
              <SelectTrigger className="flex-1 h-9 bg-slate-50 border-slate-200">
                <SelectValue placeholder="All bots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All bots</SelectItem>
                {bots.map((b) => (
                  <SelectItem key={b.slug} value={b.slug}>
                    {b.assistant_name || b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto">
          <Messages
            initialData={initialData}
            token={token}
            onSelect={setSelected}
            botFilter={bot}
            selectedId={selected}
          />
        </div>
      </div>

      {/* Main content - Chat view */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <SessionMessages
            sessionId={selected.sessionId}
            botSlug={selected.botSlug}
            token={token}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/60">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
              <Inbox className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              No conversation selected
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-sm">
              Select a conversation from the list to view messages and respond to customers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
