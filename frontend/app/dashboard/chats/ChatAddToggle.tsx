"use client";

import React, { useContext } from "react";
import { Context } from "./ChatContext";
import { IoIosAdd, IoIosClose } from "react-icons/io";

const ChatAddToggle = () => {
  let { toggleFormOpen } = useContext(Context);
  return (
    <button
      className="w-32 flex flex-row items-center space-x-1 justify-center bg-[#EDD447] text-[#45464B] py-1 rounded-lg"
      onClick={() => {
        toggleFormOpen();
        console.log("toggleFormOpen");
      }}
    >
      <IoIosAdd size={30} />
      <span>Add Chat</span>
    </button>
  );
};

export default ChatAddToggle;
