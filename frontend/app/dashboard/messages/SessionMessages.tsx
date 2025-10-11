"use client";

import React, { useEffect, useRef, useState } from "react";
import Message from "../components/ChatMessage";
import { UserMessageType } from "@/app/types/types";
import Api from "@/app/components/Api";
import { AI } from "@/app/constants/consts";

interface Props {
  sessionId: string;
  token: string;
}

const SessionMessages = ({ sessionId, token }: Props) => {
  const api = new Api(token);
  const [messages, setMessages] = useState<UserMessageType[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (url?: string) => {
    const data = await api.get_messages_by_session(sessionId, url);
    setMessages((prev) => {
      const newMsgs = url ? [...data.results.reverse(), ...prev] : data.results.reverse();
      return newMsgs;
    });
    setNext(data.next);
  };

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (boxRef.current && boxRef.current.scrollTop <= 50) {
      if (next) fetchMessages(next);
    }
  };

  return (
    <div
      ref={boxRef}
      onScroll={handleScroll}
      className="bg-white p-5 rounded-xl h-full overflow-y-auto"
    >
      {messages.map((msg, idx) => (
        <Message
          key={idx}
          message={msg.message}
          message_type={msg.message_type}
          textColor="#363636"
          backgroundColor={msg.message_type === AI ? "#D3D3D3" : "#EDD447"}
        />
      ))}
    </div>
  );
};

export default SessionMessages;
