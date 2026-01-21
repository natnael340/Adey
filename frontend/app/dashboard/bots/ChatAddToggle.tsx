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
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={toggleFormOpen}
      >
        <Plus className="h-4 w-4" />
        <span>Create Bot</span>
      </button>
    </DialogTrigger>
  );
};

export default ChatAddToggle;
