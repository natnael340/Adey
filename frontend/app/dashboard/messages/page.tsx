import React from "react";
import Layout from "../_layout";
import Api from "@/app/components/Api";
import ChatContext from "../../hooks/ChatContext";
import { authToken } from "@/app/components/protected_api";

const page = async () => {
  const token = await authToken();
  const api = new Api(token);
  const data = await api.get_messages();
  console.log("Messages data:", data);

  return (
    <Layout page="messages">
      <ChatContext token={token}>
        <div></div>
      </ChatContext>
    </Layout>
  );
};

export default page;
