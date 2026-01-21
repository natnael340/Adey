import React from "react";
import Api from "@/app/components/Api";
import ChatContext from "@/app/hooks/ChatContext";
import { authToken } from "@/app/components/protected_api";
import Form from "./Form";
import ChatBots from "./chatbots";

const BotsPage = async () => {
  const token = await authToken();
  const api = new Api(token);
  const data = await api.get_chatbots();

  return (
    <ChatContext token={token}>
      <div>
        <Form />
        <ChatBots initialData={data} />
      </div>
    </ChatContext>
  );
};

export default BotsPage;
