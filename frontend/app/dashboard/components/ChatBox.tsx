"use client";

import { Modal, TextInput } from "flowbite-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import { IoIosSend } from "react-icons/io";
import axios from "axios";
import useWebSocket, { ReadyState } from "react-use-websocket";

type PropTypes = {
  hidden: boolean;
  set_chat_hidden: () => void;
  identifier?: string;
};
type MessageType = {
  username: string;
  message: string;
  message_type: string;
  task_id?: string;
};
const HUMAN = "HUMAN";
const AI = "AI";
const ChatBox = ({ hidden, set_chat_hidden, identifier }: PropTypes) => {
  const [messages, setMessage] = useState<MessageType[]>([]);
  const [botActive, setBotActive] = useState(false);
  const [msg, setMsg] = useState("");
  const chat_window = useRef<HTMLDivElement>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const { readyState, sendJsonMessage } = useWebSocket(
    `ws://127.0.0.1:8000/rag/${identifier}/messages/`,
    {
      onOpen: () => {
        console.log("Connected");
        setBotActive(true);
      },
      onClose: () => {
        console.log("Closed");
      },
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        setMessage([
          ...messages,
          {
            username: "ANONYMOUS",
            message: data.message,
            message_type: AI,
          },
        ]);
      },
    }
  );
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
  const sendMessage = async () => {
    sendJsonMessage({
      message: msg,
    });
    const d: MessageType = {
      message: msg,
      message_type: HUMAN,
      username: "Anonymous",
    };
    setMessage([...messages, d]);
    return;
    try {
      const { data } = await axios<MessageType>({
        url: `http://127.0.0.1:8000/api/v1/rag/${identifier}/messages/`,
        method: "POST",
        withCredentials: true,
        data: {
          message: msg,
        },
      });
      const d: MessageType = {
        message: msg,
        message_type: HUMAN,
        username: "Anonymous",
        task_id: data.task_id,
      };
      setMessage([...messages, d]);
      // @ts-ignore
      setTaskId(data.task_id);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    (async () => {
      if (identifier) {
        try {
          const { data } = await axios<MessageType[]>({
            url: `http://127.0.0.1:8000/api/v1/rag/${identifier}/messages/`,
            method: "GET",
            withCredentials: true,
          });
          setMessage(data);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (chat_window.current) {
      chat_window.current.scrollTop = chat_window.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Modal
      show={!hidden}
      position="bottom-right"
      onClose={set_chat_hidden}
      size="md"
      theme={{ body: { base: "flex-1 overflow-auto" } }}
      dismissible
    >
      <Modal.Body className="flex flex-col rounded-lg">
        <div className="flex flex-row items-center justify-between w-full rounded-lg bg-[#FFFF00] bg-opacity-5 px-3">
          <div className="flex flex-row items-center gap-x-4 py-1">
            <Image
              src="/Xzh3R6N3.jpg"
              width={100}
              height={100}
              className="rounded-full h-10 w-10"
              alt="assistant image"
              quality={100}
            />
            <h3>Henok</h3>
          </div>
          <div
            className={`w-3 h-3 bg-green-500 rounded-full${
              botActive ? "bg-green-500" : "bg-gray-500"
            }`}
          />
        </div>
        <div className="bg-white px-5 h-96 overflow-y-scroll" ref={chat_window}>
          {messages.map((message, idx) => {
            let childrens: React.ReactElement[] = [];
            if (message.message_type == HUMAN) {
              childrens.push(
                <ChatMessage
                  message={message.message}
                  type={HUMAN}
                  key={`query_${idx}`}
                />
              );
            } else {
              childrens.push(
                <ChatMessage
                  message={message.message}
                  type={AI}
                  key={`response_${idx}`}
                />
              );
            }
            return childrens;
          })}
        </div>
        <div className="flex flex-row">
          <TextInput
            value={msg}
            className="flex-1 rounded-none"
            id="question"
            type="text"
            name="question"
            placeholder={connectionStatus}
            onChange={(e) => setMsg(e.target.value)}
            required
            onKeyDown={(e) => (e.key == "Enter" ? sendMessage() : null)}
          />
          <div
            className="w-10 h-10 flex justify-center items-center bg-[#EDD447] text-white"
            onClick={sendMessage}
          >
            <IoIosSend />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChatBox;
