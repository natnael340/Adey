"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMessageType } from "@/app/types/types";

interface Props {
  initialData: UserMessageType[];
  token: string;
}

const Messages = ({ initialData }: Props) => {
  const [messages] = useState<UserMessageType[]>(initialData);

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-3">
                <Avatar>
                  <AvatarFallback>{msg.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium capitalize">{msg.username}</span>
                  <span className="text-sm text-muted-foreground">
                    {msg.chat.name}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">{msg.created}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p>{msg.message}</p>
            <p className="text-xs text-gray-500">
              Session: {msg.session_id} · {msg.message_type}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Messages;
