import React from "react";
import { AI } from "../App";

const Message = ({ message, message_type, thinking }) => {
  return (
    <div
      className={`flex w-full my-5 ${
        message_type === AI ? "justify-start" : "justify-end"
      }`}
    >
      {thinking ? (
        <div className="flex flex-row space-x-1 items-center p-3 w-20 min-h-8 rounded-xl bg-[#D3D3D3] loading">
          <div className="w-3 h-3 rounded-full ic1 bg-[#c4c4c4]" />
          <div className="w-3 h-3 rounded-full ic2 bg-[#c4c4c4]" />
          <div className="w-3 h-3 rounded-full ic3 bg-[#c4c4c4]" />
        </div>
      ) : (
        <div
          className={`w-60 min-h-8 rounded-xl text-[#363636] ${
            message_type === AI ? "bg-[#D3D3D3]" : "bg-[#EDD447]"
          }  p-3`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default Message;
