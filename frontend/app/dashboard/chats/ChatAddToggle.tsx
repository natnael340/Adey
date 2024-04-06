"use client";

import React, { useContext } from "react";
import { Context } from "./ChatContext";
import { Plus } from "lucide-react";

const ChatAddToggle = () => {
  let { toggleFormOpen } = useContext(Context);
  return (
    <button
      className="w-32 flex flex-row items-center space-x-1 justify-center bg-[#EDD447] text-[#45464B] py-1 rounded-lg"
      onClick={toggleFormOpen}
    >
      <Plus size={32} />
      <span>Add Chat</span>
    </button>
  );
};

export default ChatAddToggle;
