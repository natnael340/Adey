import { useEffect, useRef, useState } from "react";
import {
  IoMdChatbubbles,
  IoMdClose,
  IoMdSend,
  IoMdAlert,
} from "react-icons/io";
import Message from "./components/Message";
import useWebSocket from "react-use-websocket";
import "./App.css";
import { MessageType, PreferenceType, ProfileType } from "./types";

import { HUMAN, AI, DEFAULT_CONFIG } from "./constants";

const CHAT_ID: string | null =
  document
    .querySelector("meta[name='adey_chat_id']")
    ?.getAttribute("content") || null;
const App = () => {
  if (!CHAT_ID) {
    throw new Error("adey_chat_id meta property is not set");
  }
  const [showChatBot, setShowChatBot] = useState<boolean>(false);
  const [preference, setPreference] = useState<PreferenceType>(DEFAULT_CONFIG);
  const chat_window = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string>("");
  const [online, setOnline] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [unseenCount, setUnseenCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatProfile, setChatProfile] = useState<ProfileType>({
    assistant_name: "",
    assistant_role: "",
  });
  const [error, setError] = useState<string>("");

  const { sendJsonMessage } = useWebSocket(
    `${import.meta.env.VITE_BACKEND_WS_PROTOCOL}://${
      import.meta.env.VITE_BACKEND_DOMAIN
    }/rag/${CHAT_ID}/messages/`,
    {
      onOpen: () => {
        setOnline(true);
      },
      onClose: () => {
        setOnline(false);
      },
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages([
            ...messages,
            {
              message: data.message,
              message_type: AI,
              seen: showChatBot,
            },
          ]);
        } else if (data.type === "error") {
          setError(data.message);
        }
        if (showChatBot) {
          sendJsonMessage({
            type: "instruction",
            action: "message_seen",
          });
        }
      },
    },
    !loading && chatProfile.assistant_name !== ""
  );

  useEffect(() => {
    if (chat_window.current) {
      chat_window.current.scrollTop = chat_window.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (showChatBot && unseenCount !== 0) {
      sendJsonMessage({
        type: "instruction",
        action: "message_seen",
      });
      setUnseenCount(0);
    }
  }, [showChatBot]);

  const isAllowed = (allowed_urls: string[]) => {
    return allowed_urls.some((url) => {
      const regexp = new RegExp("^" + url.replace(/\*/g, ".*") + "$");
      return regexp.test(window.location.href);
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_PROTOCOL}://${
            import.meta.env.VITE_BACKEND_DOMAIN
          }/api/v1/rag/chat_bot/${CHAT_ID}/`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Request failed");
        const data = await response.json();
        if (isAllowed(data.allowed_urls)) {
          const msgs = data.messages.map((msg: MessageType) => ({
            message: msg.message,
            message_type: msg.message_type,
            seen: showChatBot,
          }));

          setChatProfile({
            assistant_name: data.assistant_name,
            assistant_role: data.assistant_role,
            assistant_pic: data.assistant_pic,
          });

          setUnseenCount(data.unread_messages_count);
          setMessages(msgs);
          if (data.preference) {
            setPreference(data.preference?.preferences);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sendMessage = () => {
    sendJsonMessage({
      type: "message",
      message: message,
    });
    const d = {
      message: message,
      message_type: HUMAN,
      seen: true,
    };
    setMessages([...messages, d]);
    setMessage("");
  };

  if (!loading && chatProfile.assistant_name != "") {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-y-3 z-[999]">
        <div
          className={`${
            showChatBot
              ? "h-[30rem] w-[22rem] rounded-lg bg-white shadow-lg flex flex-col"
              : "hidden"
          }`}
        >
          <div
            className="flex flex-row items-center justify-between w-full px-4 py-2 rounded-t-lg"
            style={{
              backgroundColor: preference.chatBox.headerBackgroundColor,
            }}
          >
            <div className="flex flex-row items-center gap-x-2 py-1">
              {chatProfile.assistant_pic ? (
                <div className="w-10 h-10 relative">
                  <img
                    src={chatProfile.assistant_pic}
                    width={100}
                    height={100}
                    className="rounded-full h-10 w-10"
                    alt="assistant"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                      online ? "bg-[#22A900]" : "bg-gray-400"
                    }`}
                  ></div>
                </div>
              ) : (
                <div className="h-10 w-10 bg-orange-500 bg-opacity-30">
                  <span>
                    {chatProfile.assistant_name !== ""
                      ? chatProfile.assistant_name.charAt(0)
                      : "X"}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-y-0 justify-center">
                <h3
                  className="text-base font-bold  my-0 py-0 capitalize"
                  style={{ color: preference.chatBox.headerTitleColor }}
                >
                  {chatProfile.assistant_name}
                </h3>
                <span
                  className="text-xs my-0 py-0"
                  style={{ color: preference.chatBox.headerSubTitleColor }}
                >
                  {online ? "online" : "offline"}
                </span>
              </div>
            </div>
          </div>
          <div
            className="bg-[#F8F9FC] px-5 flex-1 overflow-y-scroll"
            ref={chat_window}
          >
            {messages.map((message, idx) => (
              <Message
                key={`message_${idx}`}
                message={message.message}
                message_type={message.message_type}
                textColor={
                  message.message_type == AI
                    ? preference.chatBox.assistantChatTextColor
                    : preference.chatBox.userChatTextColor
                }
                backgroundColor={
                  message.message_type == AI
                    ? preference.chatBox.assistantChatColor
                    : preference.chatBox.userChatColor
                }
              />
            ))}
          </div>
          {error ? (
            <div className="flex w-full py-5 justify-center items-center bg-[#F8F9FC]">
              <div className="py-2 px-4 rounded-xl bg-red-500 text-white flex flex-row items-center justify-center space-x-2">
                <IoMdAlert color="#FFFFFF" size={16} /> <span>{error}</span>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-row items-center  h-12 rounded-b-lg"
              style={{
                backgroundColor: preference.chatBox.inputBackgroundColor,
              }}
            >
              <style>{`.inline-placeholder {color: ${preference.chatBox.inputPlaceholderTextColor}}`}</style>
              <textarea
                className="flex-1 px-3 py-2 resize-none  rounded-bl-lg border-transparent !outline-none focus:border-transparent focus:ring-0 focus:outline-transparent h-full inline-placeholder"
                name="message"
                style={{
                  backgroundColor: preference.chatBox.inputBackgroundColor,
                  color: preference.chatBox.inputTextColor,
                }}
                placeholder={preference.chatBox.inputPlaceholderText}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                aria-multiline
              />
              <button
                onClick={sendMessage}
                className="justify-center items-center mr-2"
              >
                <IoMdSend
                  style={{
                    color: preference.chatBox.inputButtonColor,
                    opacity: message.length > 0 ? 1 : 0.2,
                  }}
                  size={26}
                />
              </button>
            </div>
          )}
        </div>
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => setShowChatBot(!showChatBot)}
          style={
            preference.widget.widgetBackgroundType == "solid"
              ? { backgroundColor: preference.widget.widgetBackground }
              : { background: preference.widget.widgetBackground }
          }
        >
          <div>
            <IoMdChatbubbles
              size={32}
              color={preference.widget.widgetIconColor}
              className={`transition ease-in-out delay-75 ${
                showChatBot ? "scale-0 rotate-90 h-0" : ""
              }`}
            />
            <IoMdClose
              size={32}
              color={preference.widget.widgetIconColor}
              className={`transition-transform ease-in-out delay-75 ${
                showChatBot ? "scale-100 -rotate-90" : "rotate-90 scale-0 h-0"
              }`}
            />
          </div>
          {unseenCount !== 0 ? (
            <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-center text-white flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {unseenCount}
              </span>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default App;
