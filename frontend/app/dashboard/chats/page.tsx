import React from "react";
import Layout from "../_layout";
import ChatCard from "../components/ChatCard";

const page = () => {
  return (
    <Layout page="chat_bots">
      <div className="mx-10 my-5">
        <h2>Chat Bots</h2>
        <div className="h-[1px] w-full bg-gray-300 my-3" />
        <div>
          <ChatCard
            name="Julian Marqueze"
            characters={["funny", "charming"]}
            conversations={6}
            description="Chat bot for print on demand company called print avenue which focus on making user specific designs based"
            image="/Xzh3R6N3.jpg"
            resources={12}
          />
        </div>
      </div>
    </Layout>
  );
};

export default page;
