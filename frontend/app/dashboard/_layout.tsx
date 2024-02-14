"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebarv2";
import { signOut, useSession } from "next-auth/react";
import Header from "./components/Header";
import Api from "../components/Api";
import { ChatType } from "../types/types";
import Loading from "../components/Loading";

type PropTypes = {
  children: React.ReactElement;
  page: "dashboard" | "chatbots";
  data?: {
    chat_bots: number;
    resources?: number;
    chats: number;
  };
  set_api?: (api: Api) => void;
  loading?: boolean;
};
const Layout = ({ children, page, data, set_api, loading }: PropTypes) => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => {
      console.log("un auth");
      signOut({
        redirect: true,
        callbackUrl: "/auth/login/",
      });
    },
  });
  /*
  const { data: session, status } = useSession({
    required: true,
      () {
      // @ts-ignore
      window.location = "http://localhost:3000/auth/login";
    },
  });
  */
  useEffect(() => {
    if (session) {
      // @ts-ignore
      //if (session?.expired) signOut();
      if (set_api)
        // @ts-ignore
        set_api(new Api(session?.accessToken));
    }
  }, [session]);
  return (
    <div>
      <section className="flex flex-row p-0 m-0 h-screen">
        {status == "loading" || loading ? (
          <Loading loading={true} />
        ) : (
          <>
            <Sidebar page={page} />
            <div className="container p-10 bg-[#F8F9FC] h-screen overflow-y-scroll">
              {children}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Layout;
