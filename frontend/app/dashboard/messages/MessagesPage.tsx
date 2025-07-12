"use client";

import React, { useState } from "react";
import Messages from "./Messages";
import SessionMessages from "./SessionMessages";
import { UserMessageDataWithPagination } from "@/app/types/types";

interface Props {
  initialData: UserMessageDataWithPagination;
  token: string;
}

const MessagesPage = ({ initialData, token }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex gap-6 h-full">
      <div className="w-1/3 overflow-y-auto">
        <Messages initialData={initialData} token={token} onSelect={setSelected} />
      </div>
      <div className="flex-1">
        {selected ? (
          <SessionMessages sessionId={selected} token={token} />
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
