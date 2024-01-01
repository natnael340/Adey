"use client";

import { Modal, TextInput } from "flowbite-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import { IoIosSend } from "react-icons/io";
import axios from "axios";
import { log } from "console";

type PropTypes = {
  hidden: boolean;
  set_chat_hidden: () => void;
  identifier?: string;
};
type MessageType = {
  username: string;
  inquiry: string;
  response: string;
};
const ChatBox = ({ hidden, set_chat_hidden, identifier }: PropTypes) => {
  const [messages, setMessage] = useState<MessageType[]>([]);
  const [msg, setMsg] = useState("");
  const sendMessage = () => {
    const data: MessageType = {
      inquiry: msg,
      response: "",
      username: "Anonymous",
    };
    setMessage([...messages, data]);
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
  return (
    <Modal
      show={!hidden}
      position="bottom-right"
      onClose={set_chat_hidden}
      size="sm"
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
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="bg-white px-5 h-96 overflow-y-scroll ">
          {messages.map((message, idx) => {
            let childrens: React.ReactElement[] = [];
            if (message.inquiry) {
              childrens.push(
                <ChatMessage
                  message={message.inquiry}
                  type="query"
                  key={`query_${idx}`}
                />
              );
            }
            if (message.response) {
              childrens.push(
                <ChatMessage
                  message={message.response}
                  type="response"
                  key={`response_${idx}`}
                />
              );
            }
            return childrens;
          })}
        </div>
        <div className="flex flex-row">
          <TextInput
            className="flex-1 rounded-none"
            id="question"
            type="text"
            name="question"
            placeholder="Type your question"
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
