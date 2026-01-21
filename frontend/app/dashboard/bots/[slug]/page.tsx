import React from "react";

import Api from "@/app/components/Api";
import ChatBox from "../../components/ChatBox";
import Code from "../../components/Code";
import AllowedURLList from "./AllowedURLList";
import ChatDetailContext from "./ChatDetailContext";
import ChatDetail from "./ChatDetail";
import { authToken } from "@/app/components/protected_api";
import Tools from "./Tools";
import Preferences from "./Preferences";
import { Code2 } from "lucide-react";

type PropType = {
  params: {
    slug: string;
  };
};

const BotDetailPage = async ({ params: { slug } }: PropType) => {
  const token = await authToken();
  const api = new Api(token);
  const chat = await api.get_chatbot(slug);
  const preferences = await api.get_preferences();

  return (
    <ChatDetailContext bot={chat} identifier={slug} token={token}>
      <div className="flex flex-col gap-6 min-w-0">
        <ChatDetail />

        {/* Integration Guide */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Integration Guide</h3>
              <p className="text-xs text-slate-500">
                Add the chatbot widget to your website
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
                  1
                </span>
                <h4 className="font-medium text-slate-800">
                  Add Your Chat Identifier
                </h4>
              </div>
              <p className="text-sm text-slate-600 ml-8">
                In the <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">&lt;head&gt;</code> section of your HTML page, add the following meta tag:
              </p>
              <div className="ml-8">
                <Code
                  code={`<meta name="adey_chat_id" content="${chat.identifier}" />`}
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
                  2
                </span>
                <h4 className="font-medium text-slate-800">
                  Add CSS for Widget
                </h4>
              </div>
              <p className="text-sm text-slate-600 ml-8">
                Add the following CSS link tag in the <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">&lt;head&gt;</code> section:
              </p>
              <div className="ml-8">
                <Code
                  code={`<link rel="stylesheet" crossorigin href="https://s3.us-east-2.amazonaws.com/app.adeychatbot/static/chatbots/index.css" />`}
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
                  3
                </span>
                <h4 className="font-medium text-slate-800">
                  Add Script for Widget
                </h4>
              </div>
              <p className="text-sm text-slate-600 ml-8">
                Just before the closing <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">&lt;/body&gt;</code> tag, add this script:
              </p>
              <div className="ml-8">
                <Code
                  code={`<script type="module" crossorigin src="https://s3.us-east-2.amazonaws.com/app.adeychatbot/static/chatbots/index.js"></script>`}
                />
              </div>
            </div>
          </div>
        </div>

        <AllowedURLList />

        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          <Tools initialData={chat.resources} tools={chat.tools} />
        </div>

        <Preferences preferences={preferences} />

        {chat.identifier ? <ChatBox chat_id={chat.identifier} /> : null}
      </div>
    </ChatDetailContext>
  );
};

export default BotDetailPage;
