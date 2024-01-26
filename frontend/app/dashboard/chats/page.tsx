"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Layout from "../_layout";
import ChatCard from "../components/ChatCard";
import { ChatFormType, ChatType } from "@/app/types/types";
import Api from "@/app/components/Api";
import { Modal, Spinner } from "flowbite-react";
import { IoIosAdd, IoIosClose } from "react-icons/io";
import { FaCamera } from "react-icons/fa";
import Image from "next/image";
import ChatForm from "../components/ChatForm";

const page = (props: any) => {
  const [chatForm, setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    assistant_role: "",
    business_description: "",
    business_name: "",
  });
  const [chats, setChats] = useState<ChatType[] | []>([]);
  const [_chatForm, _setChatForm] = useState<ChatFormType>({ ...chatForm });
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [api, setApi] = useState<Api | null>(null);

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
  const CreateChatBot = async () => {
    if (api) {
      try {
        const data = await api.create_chatbot(chatForm);
        await fetchChatBots(api);
      } catch (error) {
        console.error(error);
      }
    }
  };
  useEffect(() => {
    if (api) fetchChatBots(api);
  }, [api]);

  return (
    <Layout page="chatbots" set_api={setApi}>
      <div className="mx-10 my-5">
        <ChatForm
          CreateChatBot={CreateChatBot}
          chatForm={chatForm}
          _chatForm={_chatForm}
          openModal={openModal}
          setChatForm={setChatForm}
          setOpenModal={setOpenModal}
        />
        <div className="flex flex-row justify-between w-full items-center mb-10">
          <h2 className="text-xl text-[#15192C] font-medium">Chat Bots</h2>
          <button
            className="w-32 flex flex-row items-center space-x-1 justify-center bg-[#EDD447] text-[#45464B] py-1 rounded-lg"
            onClick={() => setOpenModal(true)}
          >
            <IoIosAdd size={30} />
            <span>Add Chat</span>
          </button>
        </div>
        <div>
          {loading ? (
            <div className="w-full h-40 flex flex-1 justify-center items-center">
              <Spinner color="info" aria-label="Loading ..." size="xl" />
            </div>
          ) : (
            <></>
          )}
          <div className="grid grid-cols-3 gap-x-5">
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
      </div>
    </Layout>
  );
};

export default page;
