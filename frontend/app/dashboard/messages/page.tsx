import React from "react";
import Layout from "../_layout";
import Api from "@/app/components/Api";
import ChatContext from "@/app/hooks/ChatContext";
import { authToken } from "@/app/components/protected_api";
import Messages from "./Messages";

const page = async () => {
  const token = await authToken();
  const api = new Api(token);
  const data = await api.get_messages();

  return (
    <Layout page="messages">
      <ChatContext token={token}>
        <div className="mx-10 my-5">
          <Messages initialData={data} token={token} />
        </div>
      </ChatContext>
    </Layout>
  );
};

export default page;
