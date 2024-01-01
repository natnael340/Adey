"use client";

import React, { useEffect, useState } from "react";
import Layout from "../_layout";
import ChatCard from "../components/ChatCard";
import { ChatType } from "@/app/types/types";
import Api from "@/app/components/Api";
import { Spinner } from "flowbite-react";

const page = (props: any) => {
  const [chats, setChats] = useState<ChatType | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [api, setApi] = useState<Api | null>(null);
  useEffect(() => {
    (async () => {
      if (api) {
        try {
          const data = await api.get_chatbots();
          setChats(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [api]);
  return (
    <Layout page="chat_bots" set_api={setApi}>
      <div className="mx-10 my-5">
        <h2>Chat Bots</h2>
        <div className="h-[1px] w-full bg-gray-300 my-3" />
        <div>
          {loading ? (
            <div className="w-full h-40 flex flex-1 justify-center items-center">
              <Spinner color="info" aria-label="Loading ..." size="xl" />
            </div>
          ) : (
            <></>
          )}
          {chats.map((chat) => (
            <ChatCard
              slug={chat.slug}
              name={chat.assistant_name}
              characters={["funny", "charming"]}
              conversations={6}
              description={chat.assistant_description}
              image="/Xzh3R6N3.jpg"
              resources={12}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default page;
