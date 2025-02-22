"use client";

import Image from "next/image";
import React from "react";
import {
  BotMessageSquare,
  CircleUser,
  TrendingUp,
  ChevronRight,
  User,
  MessageSquareMore,
  Workflow,
  LogOut,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";

type PropTypes = {
  page: "dashboard" | "chatbots" | "salesbots" | "integrations" | "account";
};

const Sidebar = ({ page }: PropTypes) => {
  return (
    <div className="flex flex-col h-screen w-72 bg-white py-5 px-8 gap-y-10">
      <div className="w-full py-5 flex items-center justify-center gap-x-3">
        <Image
          className="w-8 h-8 sm:h-9 sm:w-9"
          src="/adey_logo.png"
          alt="logo"
          width={75}
          height={75}
        />
        <a href="/"><span className="self-center whitespace-nowrap font-semibold text-lg text-black">
          Adey
        </span></a>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="space-y-1">
          <a
            href="/dashboard"
            className={`flex items-center justify-center space-x-4 w-full p-5 rounded-full cursor-pointer ${
              page == "dashboard"
                ? "bg-[rgba(255,255,0,0.1)] text-black"
                : "text-gray-400"
            }`}
          >
            <LayoutDashboard size={22} />
            <span className="text-base">Dashboard</span>
          </a>
          <a
            href="/dashboard/chats"
            className={`flex items-center justify-center space-x-4 w-full p-5 rounded-full cursor-pointer ${
              page == "chatbots"
                ? "bg-[rgba(255,255,0,0.1)] text-black"
                : "text-gray-400"
            }`}
          >
            <User size={22} />
            <span className="text-base">Chat Bots</span>
          </a>
          {/* <a
            href="/dashboard/sales"
            className={`flex items-center justify-center space-x-4 w-full p-5 rounded-full cursor-pointer ${
              page == "salesbots"
                ? "bg-[rgba(255,255,0,0.1)] text-black"
                : "text-gray-400"
            }`}
          >
            <TrendingUp size={22} />
            <span className="text-base">Sales Bots</span>
          </a> */}
          {/* <a
            href="/dashboard/sales"
            className={`flex items-center justify-center space-x-4 w-full p-5 rounded-full cursor-pointer ${
              page == "integrations"
                ? "bg-[rgba(255,255,0,0.1)] text-black"
                : "text-gray-400"
            }`}
          >
            <Workflow size={22} />
            <span className="text-base">Integrations</span>
          </a> */}
        </div>
        <div className="border-t border-[#ECECEE] w-full space-y-1 py-2 mt-2">
          {/* <a
            href="/dashboard/chats"
            className={`flex items-center justify-center space-x-4 w-full p-5 rounded-full cursor-pointer ${
              page == "account"
                ? "bg-[rgba(255,255,0,0.1)] text-black"
                : "text-gray-400"
            }`}
          >
            <UserCircle size={22} />
            <span className="text-base">My Account</span>
          </a> */}
          <button
            className="flex items-center justify-center space-x-4 w-full p-5 rounded-full cursor-pointer text-gray-400"
            onClick={() =>
              signOut({ redirect: true, callbackUrl: "/auth/login" })
            }
          >
            <LogOut size={22} />
            <span className="text-base">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
