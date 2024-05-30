"use client";

import { ChatType } from "@/app/types/types";
import React, { useContext, useEffect, useState } from "react";
import ChatCard from "../components/ChatCard";
import { Context } from "./ChatContext";
import Api from "@/app/components/Api";
import { Loader } from "lucide-react";

type ParamType = {
  initialData: ChatType[];
};
const chatbots = ({ initialData }: ParamType) => {
  const [chats, setChats] = useState<ChatType[] | []>(initialData);
  let { botAdded, setBotAdded, api } = useContext(Context);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchChatBots = async (_api: Api) => {
    try {
      const data = await _api.get_chatbots();
      setChats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chats.length == 0) {
      setChats(initialData);
    }
  }, []);

  useEffect(() => {
    if (botAdded) {
      if (api) fetchChatBots(api);
      setBotAdded(false);
    }
  }, [botAdded]);
  return (
    <div>
      {loading ? (
        <div className="w-full h-40 flex flex-1 justify-center items-center">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <></>
      )}
      <div className="grid md:grid-cols-3 gap-x-5 sm:grid-cols-1 gap-y-5">
        {chats.map((chat, idx) => (
          <ChatCard
            key={chat.slug}
            slug={chat.slug}
            name={chat.assistant_name}
            characters={chat.assistant_characters.map(
              (character) => character.name
            )}
            conversations={chat.conversations}
            description={chat.business_description}
            image={chat.assistant_picture_url}
            resources={chat.resources}
          />
        ))}
      </div>
    </div>
  );
};

export default chatbots;
