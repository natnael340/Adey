"use client";

import { ChatFormType } from "@/app/types/types";
import React, { useContext, useState } from "react";
import ChatForm from "../components/ChatForm";
import { Context } from "./ChatContext";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
  const [_chatForm, _setChatForm] = useState<ChatFormType>({ ...chatForm });
  const CreateChatBot = async () => {
    if (api) {
      try {
        const data = await api.create_chatbot(chatForm);
        setBotAdded(true);
        toggleFormOpen();
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <div>
      <ChatForm
        CreateChatBot={CreateChatBot}
        chatForm={chatForm}
        _chatForm={_chatForm}
        openModal={formOpen}
        setChatForm={setChatForm}
        setOpenModal={(value) => toggleFormOpen()}
      />
    </div>
  );
}

export default Form;
