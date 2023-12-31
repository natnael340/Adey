"use client";

import { Sidebar } from "flowbite-react";
import Link from "next/link";
import React from "react";
import {
  HiArrowSmLeft,
  HiChartPie,
  HiInbox,
  HiShoppingBag,
  HiTable,
  HiUser,
  HiViewBoards,
} from "react-icons/hi";

type PropTypes = {
  page: string;
};
const sidebar = ({ page }: PropTypes) => {
  return (
    <Sidebar aria-label="Default sidebar example" className="h-screen">
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
