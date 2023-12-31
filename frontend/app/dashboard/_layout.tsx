"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useSession } from "next-auth/react";
import Header from "./components/Header";

type PropTypes = {
  children: React.ReactNode;
  page: string;
  data?: {
    chat_bots: number;
    resources?: number;
    chats: number;
  };
};
const Layout = ({ children, page, data }: PropTypes) => {
  const { data: session, status } = useSession({ required: true });
  console.log(session);
  return (
    <div>
      <Header />
      <section className="flex flex-row">
        <Sidebar page={page} />
        <div className="container m-10">{children}</div>
      </section>
    </div>
  );
};

export default Layout;
