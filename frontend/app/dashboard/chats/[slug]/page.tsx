import React from "react";
import Layout from "../../_layout";

import Api from "@/app/components/Api";
import ChatBox from "../../components/ChatBox";
import Code from "../../components/Code";
import Resources from "./Resources";
import AllowedURLList from "./AllowedURLList";
import ChatDetailContext from "./ChatDetailContext";
import ChatDetail from "./ChatDetail";
import { authToken } from "@/app/components/protected_api";

type PropType = {
  params: {
    slug: string;
  };
};

const page = async ({ params: { slug } }: PropType) => {
  const token = await authToken();
  const api = new Api(token);
  const chat = await api.get_chatbot(slug);
  const resources = await api.get_resources(slug);

  return (
    <Layout page="chatbots">
      <ChatDetailContext bot={chat} identifier={slug} token={token}>
        <div className="px-20 py-5 flex flex-col gap-y-5">
          <ChatDetail />
          <div className="bg-white p-5 rounded-xl text-gray-900 space-y-3">
            <h3 className="font-bold text-xl mb-3">
              Integration Guide: Chatbot Integration
            </h3>
            <p>
              To integrate our chatbot into your website or web application,
              please follow the steps below:
            </p>
            <h5 className="font-semibold text-lg">
              Step 1: Add Your Chat Identifier
            </h5>
            <p>
              In the &lt;head&gt; section of your HTML page, add the following
              meta tag to specify the chat identifier:
            </p>
            <Code
              code={`<meta name="adey_chat_id" content="${chat.identifier}" />`}
            />
            <h5 className="font-semibold text-lg">
              Step 2: Add CSS for Widget
            </h5>
            <p>
              To style the chatbot widget, add the following CSS link tag in the
              &lt;head&gt; section of your HTML page:
            </p>
            <Code
              code={`<link rel="stylesheet" crossorigin href="https://s3.us-east-2.amazonaws.com/app.adeychatbot/static/chatbots/index.css" />`}
            />
            <p>
              This link tag will load the CSS file required for the chatbot
              widget. Ensure that the href attribute points to the correct
              location of the CSS file.
            </p>
            <h5 className="font-semibold text-lg">
              Step 3: Add Script for Widget
            </h5>
            <p>
              At the end of your HTML page, just before the closing
              &lt;/body&gt;tag, add the following script tag to load the chatbot
              script:
            </p>
            <Code
              code={`<script type="module" crossorigin src="https://s3.us-east-2.amazonaws.com/app.adeychatbot/static/chatbots/index.js"></script>`}
            />
            <p>
              This script tag will load the JavaScript code responsible for
              initializing and displaying the chatbot. Make sure that the src
              attribute points to the correct location of the JavaScript file.
            </p>
          </div>
          <AllowedURLList />
          <Resources initialData={resources.results} />
          {chat.identifier ? <ChatBox chat_id={chat.identifier} /> : <></>}
        </div>
      </ChatDetailContext>
    </Layout>
  );
};

export default page;
