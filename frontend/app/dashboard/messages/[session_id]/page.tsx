import React from "react";
import Layout from "../_layout";
import Api from "@/app/components/Api";
import ChatContext from "@/app/hooks/ChatContext";
import { authToken } from "@/app/components/protected_api";
import SessionMessages from "./session";

interface Param {
  params: { session_id: string };
}

const page = async ({ params: { session_id } }: Param) => {
  const token = await authToken();
  const api = new Api(token);
  const data = await api.get_messages_by_session(session_id);

  return (
    <Layout page="messages">
      <ChatContext token={token}>
        <div className="mx-10 my-5">
          <SessionMessages initialData={data} />
        </div>
      </ChatContext>
    </Layout>
  );
};

export default page;
