"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMessageType, UserMessageDataWithPagination } from "@/app/types/types";
import { useRouter } from "next/navigation";

interface Props {
  initialData: UserMessageDataWithPagination;
  token: string;
}

const Messages = ({ initialData }: Props) => {
  const [messages] = useState<UserMessageType[]>(initialData.results);
  const router = useRouter();

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <Card
          key={idx}
          onClick={() => router.push(`/dashboard/messages/${msg.session_id}`)}
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
    </div>
  );
};

export default Messages;
