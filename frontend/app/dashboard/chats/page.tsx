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

const page = (props: any) => {
  const [chatForm, setChatForm] = useState<ChatFormType>({
    name: "",
    assistant_picture_data: null,
    assistant_characters: [],
    assistant_name: "",
    business_description: "",
    business_name: "",
  });
  const [character, setCharacter] = useState("");
  const [chats, setChats] = useState<ChatType[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [api, setApi] = useState<Api | null>(null);
  const [characterInputActive, setCharacterInputActive] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setChatForm({
          ...chatForm,
          assistant_picture_data: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
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
  const updateState = (char: string) => {
    if (char[char.length - 1] == " ") {
      setChatForm({
        ...chatForm,
        assistant_characters: [...chatForm.assistant_characters, character],
      });
      setCharacter("");
    } else {
      setCharacter(char);
    }
  };
  const handleCharacterInputFocus = (active: boolean) => {
    console.log("handleCharacterInputFocus " + active);
    setCharacterInputActive(active);
  };
  const RemoveCharacter = (char: string) => {
    const chars = chatForm.assistant_characters.filter(
      (pre: string) => pre !== char
    );
    setChatForm({ ...chatForm, assistant_characters: chars });
  };
  return (
    <Layout page="chatbots" set_api={setApi}>
      <div className="mx-10 my-5">
        <Modal
          show={openModal}
          onClose={() => setOpenModal(false)}
          dismissible
          theme={{
            content: {
              inner:
                "relative rounded-2xl bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]",
            },
          }}
        >
          <Modal.Body className="bg-white p-10 space-y-5 rounded-3xl">
            <div className="flex flex-row items-center space-x-5">
              {chatForm.assistant_picture_data ? (
                <Image
                  src={{
                    src: chatForm.assistant_picture_data,
                    width: 100,
                    height: 100,
                  }}
                  alt="Assistant picture"
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <button
                  className="w-32 h-32 rounded-full bg-[#D9D9D9] flex items-center justify-center focus:border-transparent border-transparent outline-none outline-transparent"
                  onClick={handleImageUploadClick}
                >
                  <FaCamera size={26} color="#818181" />
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="flex-1">
                <label>Bot Name</label>
                <input
                  type="text"
                  value={chatForm.name}
                  onChange={(e) =>
                    setChatForm({ ...chatForm, name: e.target.value })
                  }
                  placeholder="Customer support"
                  className="block text-sm w-full border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 ps-0 placeholder-gray-300"
                />
              </div>
            </div>
            <div>
              <label>Assistant Name</label>
              <input
                type="text"
                value={chatForm.assistant_name}
                onChange={(e) =>
                  setChatForm({ ...chatForm, assistant_name: e.target.value })
                }
                placeholder="Selam"
                className="block text-sm w-full border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 ps-0 placeholder-gray-300"
              />
            </div>
            <div>
              <label>Assistant Characters</label>
              <div className="flex flex-row">
                <div
                  className={`h-10 flex flex-row items-center gap-x-1 ${
                    characterInputActive
                      ? "border-b-blue-600"
                      : "border-b-gray-300"
                  } border-b`}
                >
                  {chatForm.assistant_characters.map((character, idx) => (
                    <div
                      key={`character_${idx}`}
                      className="py-1 px-2 capitalize bg-[#E7CD3C] bg-opacity-60 space-x-2 flex flex-row items-center rounded-full"
                    >
                      <p className="text-sm">{character}</p>
                      <button onClick={() => RemoveCharacter(character)}>
                        <IoIosClose />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  value={character}
                  onChange={(e) => updateState(e.target.value)}
                  onFocus={(e) => handleCharacterInputFocus(true)}
                  onBlur={(e) => handleCharacterInputFocus(false)}
                  placeholder="#funny #intelligent"
                  className={`${
                    chatForm.assistant_characters.length != 0 ? "ps-2" : "ps-0"
                  } text-sm flex-1 border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 placeholder-gray-300`}
                />
              </div>
            </div>
            <div>
              <label>Business Name</label>
              <input
                type="text"
                value={chatForm.business_name}
                onChange={(e) =>
                  setChatForm({ ...chatForm, business_name: e.target.value })
                }
                placeholder="Print Avenue"
                className="block text-sm w-full border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 ps-0 placeholder-gray-300"
              />
            </div>
            <div>
              <label>Business Description</label>
              <input
                type="text"
                value={chatForm.business_description}
                onChange={(e) =>
                  setChatForm({
                    ...chatForm,
                    business_description: e.target.value,
                  })
                }
                placeholder="Print Avenue is a leading printing solutions provider, offering a wide range of high-quality printing services ..."
                className="block text-sm w-full border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 ps-0 placeholder-gray-300"
              />
            </div>
            <div className="flex justify-end mt-5">
              <button
                className="py-2 px-4 bg-[#F0E07F] rounded-xl"
                onClick={CreateChatBot}
              >
                Create Chat Bot
              </button>
            </div>
          </Modal.Body>
        </Modal>
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
