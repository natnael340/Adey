"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useSession } from "next-auth/react";
import Header from "./components/Header";
import Api from "../components/Api";
import { ChatType } from "../types/types";

type PropTypes = {
  children: React.ReactElement;
  page: string;
  data?: {
    chat_bots: number;
    resources?: number;
    chats: number;
  };
  set_api?: (api: Api) => void;
};
const Layout = ({ children, page, data, set_api }: PropTypes) => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // @ts-ignore
      window.location = "http://localhost:3000/auth/login";
    },
  });
  useEffect(() => {
    if (session) {
      if (set_api)
        // @ts-ignore
        set_api(new Api(session?.accessToken));
    }
  }, [session]);
  return (
    <div>
      <section className="flex flex-row">
        <Sidebar page={page} />
        <div className="container p-10 bg-[#F8F9FC]">{children}</div>
      </section>
    </div>
  );
};

export default Layout;
