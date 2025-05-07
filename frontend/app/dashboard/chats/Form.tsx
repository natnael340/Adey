"use client";

import { ChatFormType } from "@/app/types/types";
import React, { useContext, useState } from "react";
import ChatForm from "../components/ChatForm";
import { Context } from "./ChatContext";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ChatAddToggle from "./ChatAddToggle";

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
      <div className="flex flex-row justify-between w-full items-center mb-10">
        <h2 className="text-xl text-[#15192C] font-medium">Chat Bots</h2>
        <ChatAddToggle />
      </div>
    </Dialog>
  );
}

export default Form;
