import React from "react";
import Api from "@/app/components/Api";
import ChatContext from "@/app/hooks/ChatContext";
import { authToken } from "@/app/components/protected_api";
import MessagesPage from "./MessagesPage";
import { MessageCircle } from "lucide-react";

const MessagesPageRoot = async () => {
  const token = await authToken();
  const api = new Api(token);
  const data = await api.get_messages();
  const bots = await api.get_chatbots();

  return (
    <ChatContext token={token}>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-500 text-white shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Messages</h1>
            <p className="text-sm text-slate-500">
              View and manage customer conversations
            </p>
          </div>
        </div>

        {/* Main content */}
        <MessagesPage initialData={data} token={token} bots={bots} />
      </div>
    </ChatContext>
  );
};

export default MessagesPageRoot;
