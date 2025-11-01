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
    <div className="flex gap-6 h-full">
      <div className="w-1/3 overflow-y-auto">
        {/* Bot filter only */}
        <div className="mb-3 sticky top-0 z-10  pt-1 pb-2">
          <Select value={bot} onValueChange={setBot}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All bots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All bots</SelectItem>
              {bots.map((b) => (
                <SelectItem key={b.slug} value={b.slug}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Messages
          initialData={initialData}
          token={token}
          onSelect={setSelected}
          botFilter={bot}
          selectedId={selected} // highlight active card
        />
      </div>

      <div className="flex-1">
        {selected ? (
          <SessionMessages
            sessionId={selected.sessionId}
            botSlug={selected.botSlug}
            token={token}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-xl">
            <span className="text-gray-500">Select a conversation</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
