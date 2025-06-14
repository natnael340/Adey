"use client";

import React, { useState } from "react";
import Message from "../../components/ChatMessage";
import { UserMessageType } from "@/app/types/types";
import { AI } from "@/app/constants/consts";

interface Props {
  initialData: UserMessageType[];
}

const SessionMessages = ({ initialData }: Props) => {
  const [messages] = useState<UserMessageType[]>(initialData);

  return (
    <div className="bg-white p-5 rounded-xl">
      {messages.map((msg, idx) => (
        <Message
          key={idx}
          message={msg.message}
          message_type={msg.message_type}
          textColor="#363636"
          backgroundColor={
            msg.message_type === AI ? "#D3D3D3" : "#EDD447"
          }
        />
      ))}
    </div>
  );
};

export default SessionMessages;
