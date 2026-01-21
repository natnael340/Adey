"use client";

import { ChatType } from "@/app/types/types";
import React, { useContext, useEffect, useState } from "react";
import ChatCard from "../components/ChatCard";
import { Context } from "../../hooks/ChatContext";
import Api from "@/app/components/Api";
import { Loader2, Bot, Plus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

type ParamType = {
  initialData: ChatType[];
};

const ChatBots = ({ initialData }: ParamType) => {
  const [chats, setChats] = useState<ChatType[] | []>(initialData);
  let { botAdded, setBotAdded, api, toggleFormOpen } = useContext(Context);
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

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="mt-3 text-sm text-slate-500">Loading your bots...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
          <Bot className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          No bots yet
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
          Create your first AI assistant to start engaging with your customers
          automatically.
        </p>
        <DialogTrigger asChild>
          <button
            onClick={toggleFormOpen}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create your first bot</span>
          </button>
        </DialogTrigger>
      </div>
    );
  }

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {chats.map((chat) => (
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
  );
};

export default ChatBots;
