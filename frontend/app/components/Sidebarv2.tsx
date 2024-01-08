import Image from "next/image";
import React from "react";
import { RxDashboard } from "react-icons/rx";
import { FaRobot } from "react-icons/fa";

type PropTypes = {
  page: "dashboard" | "chatbots";
};

const Sidebar = ({ page }: PropTypes) => {
  return (
    <div className="min-h-screen h-screen w-72 bg-white my-10 px-8">
      <div className="w-full py-5 flex items-center justify-center">
        <Image
          className="w-6 h-6 sm:h-9 sm:w-9 mr-3"
          src="/adey_logo.png"
          alt="logo"
          width={75}
          height={75}
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-black">
          Adey
        </span>
      </div>
      <div className="pt-10 space-y-3">
        <a
          href="/dashboard"
          className={`flex items-center space-x-3 w-full p-5 rounded-full cursor-pointer ${
            page == "dashboard"
              ? "bg-[rgba(255,255,0,0.1)] text-black"
              : "text-gray-500"
          }`}
        >
          <RxDashboard size={20} />
          <span className="text-base">Dashboard</span>
        </a>
        <a
          href="/dashboard/chats"
          className={`flex items-center space-x-3 w-full p-5 rounded-full cursor-pointer ${
            page == "chatbots"
              ? "bg-[rgba(255,255,0,0.1)] text-black"
              : "text-gray-500"
          }`}
        >
          <FaRobot size={20} />
          <span className="text-base">Chat Bots</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
