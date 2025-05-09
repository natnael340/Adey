"use client";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "./ChatDetailContext";
import { ChatFormType, ChatType } from "@/app/types/types";
import ChatForm from "../../components/ChatForm";
import Api from "@/app/components/Api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Settings2, Cog } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const ChatDetail = () => {
  let { api, bot, identifier, setBot, toggleFormOpen } = useContext(Context);

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
  const [_chatForm, _setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
    allowed_urls: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const initiateChatBotForm = (data: ChatType) => {
    const form = {
      assistant_name: data.assistant_name,
      assistant_characters: data.assistant_characters.map(
        (character) => character.name
      ),
      assistant_picture_data: data.assistant_picture_url,
      assistant_role: data.assistant_role,
      business_description: data.business_description,
      business_name: data.business_name,
      name: data.name,
      allowed_urls: data.allowed_urls,
    };
    setChatForm(form);
    _setChatForm(form);
  };
  const fetchChatBot = async (_api: Api) => {
    try {
      const data = await _api.get_chatbot(identifier);
      setBot(data);
      const form = {
        assistant_name: data.assistant_name,
        assistant_characters: data.assistant_characters.map(
          (character) => character.name
        ),
        assistant_picture_data: data.assistant_picture_url,
        assistant_role: data.assistant_role,
        business_description: data.business_description,
        business_name: data.business_name,
        name: data.name,
        allowed_urls: data.allowed_urls,
      };
      setChatForm(form);
      _setChatForm(form);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const UpdateChatForm = async (data: ChatFormType) => {
    if (api) {
      try {
        const _data = await api.update_chatbot(identifier, data, chatForm);
        await fetchChatBot(api);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const buildChatBot = async () => {
    if (api) {
      try {
        await api.build_chatbot(identifier);
        fetchChatBot(api);
      } catch (error) {
        console.error(error);
      }
    }
  };
  useEffect(() => {
    initiateChatBotForm(bot);
  }, []);
  return (
    <Dialog>
      <div className="flex flex-col  gap-y-5">
        <ChatForm
          CreateChatBot={UpdateChatForm}
          chatForm={chatForm}
          toggleFormOpen={toggleFormOpen}
          edit={true}
        />
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold capitalize">
              {bot.assistant_name}
            </h1>
            <span className="text-sm font-light text-gray-400 capitalize">
              {bot.assistant_characters
                .map((character) => character.name)
                .join(" | ")}
            </span>
          </div>
          {bot.assistant_picture_url ? (
            <Image
              src={bot.assistant_picture_url}
              width={500}
              height={500}
              className="rounded-full h-32 w-32"
              alt="assistant image"
              quality={100}
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-slate-300" />
          )}
        </div>
        <div className="bg-white p-5 rounded-xl text-gray-400">
          <p>{bot.business_description}</p>
          <div className="flex flex-row gap-x-1 justify-end w-full">
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => setOpenModal(true)}
                className="text-black"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Edit Chat Bot
              </Button>
            </DialogTrigger>

            {bot.status != "finished" ? (
              <Button
                onClick={() => buildChatBot()}
                variant="ghost"
                className="text-black"
              >
                <Cog className="mr-2 h-4 w-4" />
                {bot.status == "prepared" ? "Build" : "Rebuild"}
              </Button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ChatDetail;
