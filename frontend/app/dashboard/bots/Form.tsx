"use client";

import { ChatFormType } from "@/app/types/types";
import React, { useContext, useState } from "react";
import ChatForm from "../components/ChatForm";
import { Context } from "@/app/hooks/ChatContext";
import { Dialog } from "@/components/ui/dialog";
import ChatAddToggle from "./ChatAddToggle";
import { Bot } from "lucide-react";

function Form() {
  let { setBotAdded, api, formOpen, toggleFormOpen } = useContext(Context);

  const [chatForm, setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
    allowed_urls: [],
  });
  const CreateChatBot = async (data: ChatFormType) => {
    if (api) {
      try {
        await api.create_chatbot(data);

        setBotAdded(true);
        toggleFormOpen();
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <Dialog open={formOpen} onOpenChange={toggleFormOpen}>
      <ChatForm
        CreateChatBot={CreateChatBot}
        chatForm={chatForm}
        toggleFormOpen={toggleFormOpen}
      />
      <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Bots</h1>
            <p className="text-sm text-slate-500">
              Manage and configure your AI assistants
            </p>
          </div>
        </div>
        <ChatAddToggle />
      </div>
    </Dialog>
  );
}

export default Form;
