import React from "react";

type PropType = {
  message: string;
  type: "HUMAN" | "AI";
};
const ChatMessage = ({ message, type }: PropType) => {
  return (
    <div
      className={`flex my-2  ${
        type == "HUMAN" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={` font-light rounded-3xl px-5 py-3 w-64 ${
          type == "HUMAN"
            ? "bg-chat-query text-right text-white"
            : "bg-chat-response text-black"
        }`}
      >
        {message}
      </div>
    </div>
  );
};

export default ChatMessage;
