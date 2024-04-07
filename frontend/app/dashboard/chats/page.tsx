import React from "react";
import Layout from "../_layout";
import Api from "@/app/components/Api";
import ChatContext from "./ChatContext";
import { authToken } from "@/app/components/protected_api";
import Form from "./Form";
import ChatAddToggle from "./ChatAddToggle";
import ChatBots from "./chatbots";

const page = async () => {
  const token = await authToken();
  const api = new Api(token);
  const data = await api.get_chatbots();

  return (
    <Layout page="chatbots">
      <ChatContext token={token}>
        <div className="mx-10 my-5">
          <Form />
          <div className="flex flex-row justify-between w-full items-center mb-10">
            <h2 className="text-xl text-[#15192C] font-medium">Chat Bots</h2>
            <ChatAddToggle />
          </div>
          <ChatBots initialData={data} />
        </div>
      </ChatContext>
    </Layout>
  );
};

export default page;
