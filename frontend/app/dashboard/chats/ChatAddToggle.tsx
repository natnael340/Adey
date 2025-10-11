"use client";

import React, { useContext } from "react";
import { Context } from "@/app/hooks/ChatContext";
import { Plus } from "lucide-react";
import { DialogTrigger } from "@radix-ui/react-dialog";

const ChatAddToggle = () => {
  let { toggleFormOpen } = useContext(Context);
  return (
    <DialogTrigger asChild>
      <button
        className="w-32 flex flex-row items-center space-x-1 justify-center bg-[#EDD447] text-[#45464B] py-1 rounded-lg"
        onClick={toggleFormOpen}
      >
        <Plus size={32} />
        <span>Add Chat</span>
      </button>
    </DialogTrigger>
  );
};

export default ChatAddToggle;
