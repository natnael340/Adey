"use client";

import { formUpdated } from "@/app/components/utils";
import { ChatFormType } from "@/app/types/types";
import { Modal } from "flowbite-react";
import Image from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

type PropTypes = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  chatForm: ChatFormType;
  _chatForm: ChatFormType;
  setChatForm: (value: ChatFormType) => void;
  CreateChatBot: () => void;
  edit?: boolean;
};
const ChatForm = ({
  openModal,
  chatForm,
  _chatForm,
  setOpenModal,
  setChatForm,
  CreateChatBot,
  edit,
}: PropTypes) => {
  const [characterInputActive, setCharacterInputActive] =
    useState<boolean>(false);
  const [character, setCharacter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canSave, setCanSave] = useState(false);

  const handleCharacterInputFocus = (active: boolean) => {
    console.log("handleCharacterInputFocus " + active);
    setCharacterInputActive(active);
  };
  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
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
  const RemoveCharacter = (char: string) => {
    const chars = chatForm.assistant_characters.filter(
      (pre: string) => pre !== char
    );
    setChatForm({ ...chatForm, assistant_characters: chars });
  };
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
  useEffect(() => {
    const { status, data } = formUpdated(chatForm, _chatForm);
    if (status !== canSave) setCanSave(status);
    console.log(
      status,
      data,
      _chatForm.assistant_role,
      chatForm.assistant_role
    );
  }, [chatForm]);
  return (
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
            <div className="relative">
              <Image
                src={{
                  src: chatForm.assistant_picture_data,
                  width: 100,
                  height: 100,
                }}
                alt="Assistant picture"
                className="w-32 h-32 rounded-full"
              />
              {edit ? (
                <div className="absolute top-0 left-0 bottom-0 right-0 rounded-full hover:bg-black hover:bg-opacity-20 z-10 flex items-center justify-center">
                  <button
                    className="flex z-20 w-32 h-32 rounded-full items-center justify-center focus:border-transparent border-transparent outline-none outline-transparent opacity-0 hover:opacity-100"
                    onClick={handleImageUploadClick}
                  >
                    <FaCamera size={26} color="#D9D9D9" />
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
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
                characterInputActive ? "border-b-blue-600" : "border-b-gray-300"
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
          <label>Assistant Role</label>
          <input
            type="text"
            value={chatForm.assistant_role}
            onChange={(e) =>
              setChatForm({ ...chatForm, assistant_role: e.target.value })
            }
            placeholder="Manager"
            className="block text-sm w-full border-x-transparent border-t-transparent border-gray-300 focus:border-x-transparent focus:border-t-transparent focus:ring-0 ps-0 placeholder-gray-300"
          />
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
            className={`py-2 px-4 bg-[#F0E07F] rounded-xl ${
              canSave ? "" : "opacity-30"
            }`}
            onClick={canSave ? CreateChatBot : () => null}
          >
            {edit ? "Update" : "Create"} Chat Bot
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChatForm;
