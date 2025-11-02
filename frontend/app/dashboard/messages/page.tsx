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
  const bots = await api.get_chatbots();

  return (
    <ChatContext token={token}>
      <div className="mx-5 my-5 h-full">
        <h2 className="text-lg font-bold">Messages</h2>
        <MessagesPage initialData={data} token={token} bots={bots} />
      </div>
    </ChatContext>
  );
};

export default page;
