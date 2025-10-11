"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMessageType, UserMessageDataWithPagination } from "@/app/types/types";
import Api from "@/app/components/Api";

interface Props {
  initialData: UserMessageDataWithPagination;
  token: string;
  onSelect: (id: string) => void;
}

const Messages = ({ initialData, token, onSelect }: Props) => {
  const [messages, setMessages] = useState<UserMessageType[]>(initialData.results);
  const [next, setNext] = useState<string | null>(initialData.next);
  const [prev, setPrev] = useState<string | null>(initialData.prev);
  const api = new Api(token);

  const fetchPage = async (url: string | null) => {
    if (!url) return;
    const data = await api.get_messages(url);
    setMessages(data.results);
    setNext(data.next);
    setPrev(data.prev);
  };

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <Card
          key={idx}
          onClick={() => onSelect(msg.session_id)}
          className="cursor-pointer"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-3">
                <Avatar>
                  {msg.chat.assistant_picture_url ? (
                    <AvatarImage src={msg.chat.assistant_picture_url} alt="chat" />
                  ) : (
                    <AvatarFallback>
                      {msg.chat.assistant_name
                        ? msg.chat.assistant_name.charAt(0)
                        : "A"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium capitalize">
                    {msg.chat.assistant_name || msg.chat.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {msg.session_id}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">{msg.created}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p>{msg.message}</p>
            <p className="text-xs text-gray-500">
              {(msg.username && msg.username !== "") ? msg.username : "Anonymous"}
              {" · "}
              {msg.message_type}
            </p>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-between pt-4">
        <button
          className="text-sm disabled:text-gray-300"
          disabled={!prev}
          onClick={() => fetchPage(prev)}
        >
          Previous
        </button>
        <button
          className="text-sm disabled:text-gray-300"
          disabled={!next}
          onClick={() => fetchPage(next)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Messages;
