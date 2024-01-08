import React from "react";
import { AI } from "../App";

const Message = ({ message, message_type }) => {
  return (
    <div
      className={`flex w-full my-5 ${
        message_type === AI ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`w-60 min-h-8 rounded-3xl bg-[#EDD447] ${
          message_type === AI ? "" : "bg-opacity-30"
        }  p-3`}
      >
        {message}
      </div>
    </div>
  );
};

export default Message;
