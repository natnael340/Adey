"use client";

import { Sidebar } from "flowbite-react";
import Link from "next/link";
import React from "react";
import {
  HiArrowSmLeft,
  HiChartPie,
  HiInbox,
  HiUser,
  HiViewBoards,
} from "react-icons/hi";

type PropTypes = {
  page: string;
};
const sidebar = ({ page }: PropTypes) => {
  return (
    <Sidebar
      aria-label="Default sidebar example"
      className="h-full min-h-screen pt-5 px-2"
      theme={{ root: { inner: "bg-white" } }}
    >
      <Sidebar.Logo href="/" img="/adey_logo.png" imgAlt="Adey logo">
        Adey
      </Sidebar.Logo>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item
            href="/dashboard"
            icon={HiChartPie}
            active={page == "dashboard"}
          >
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item
            href="/dashboard/chats"
            icon={HiViewBoards}
            labelColor="dark"
            active={page == "chat_bots"}
          >
            Chat Bots
          </Sidebar.Item>
          <Sidebar.Item
            href="#"
            icon={HiInbox}
            label="3"
            active={page == "user_chats"}
          >
            User chats
          </Sidebar.Item>
          <Sidebar.Item href="#" icon={HiUser} active={page == "resources"}>
            Resources
          </Sidebar.Item>
          <Sidebar.Item href="#" icon={HiArrowSmLeft}>
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default sidebar;
