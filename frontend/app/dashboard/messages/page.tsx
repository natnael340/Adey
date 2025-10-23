import React from "react";
import Layout from "../layout";
import Api from "@/app/components/Api";
import ChatContext from "@/app/hooks/ChatContext";
import { authToken } from "@/app/components/protected_api";
import MessagesPage from "./MessagesPage";

const page = async () => {
  const token = await authToken();
  const api = new Api(token);
  const data = await api.get_messages();

  return (
    <ChatContext token={token}>
      <div className="mx-5 my-5 h-full space-y-5">
        <h2 className="text-xl text-[#15192C] font-medium">Messages</h2>
        <MessagesPage initialData={data} token={token} />
      </div>
    </ChatContext>
  );
};

export default page;
