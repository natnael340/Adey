import { useEffect, useRef, useState } from "react";
import { IoMdChatbubbles, IoMdClose, IoMdSend } from "react-icons/io";
import { MdMicNone } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import Message from "./components/Message";
import useWebSocket from "react-use-websocket";
import "./App.css";

export const [HUMAN, AI] = ["HUMAN", "AI"];
const CHAT_ID = "f7b9f25f-85d9-49d5-a006-1c48df546d8f";
function App() {
  const [showChatBot, setShowChatBot] = useState(true);
  const chat_window = useRef(null);
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chatProfile, setChatProfile] = useState({
    assistant_name: "",
    assistant_role: "",
    assistant_pic: null,
  });
  const [thinking, setThinking] = useState(false);
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
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `https://app.adey-chatbot.website/api/v1/rag/chat_bot/${CHAT_ID}/`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Request failed");
        const data = await response.json();

        const msgs = data.messages.map((msg) => ({
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { readyState, sendJsonMessage } = useWebSocket(
    `ws://app.adey-chatbot.website/rag/${CHAT_ID}/messages/`,
    {
      onOpen: () => {
        setOnline(true);
      },
      onClose: () => {
        setOnline(false);
      },
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        setThinking(false);
        setMessages([
          ...messages,
          {
            message: data.message,
            message_type: AI,
            seen: showChatBot,
          },
        ]);
        if (showChatBot) {
          sendJsonMessage({
            type: "instruction",
            action: "message_seen",
          });
        }
      },
    },
    !loading && chatProfile.assistant_name !== "",
    
  );
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
    setThinking(true);
  };
  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-y-3">
      <div
        className={`${
          showChatBot
            ? "h-[30rem] w-[22rem] rounded-lg bg-white shadow-lg flex flex-col"
            : "hidden"
        }`}
      >
        <div className="flex flex-row items-center justify-between w-full bg-[#EDD447] px-4 py-2 rounded-t-lg">
          <div className="flex flex-row items-center gap-x-2 py-1">
            {chatProfile.assistant_pic ? (
              <div className="w-10 h-10 relative">
                <img
                  src="https://app.adey-chatbot.website/media/Xzh3R6N3.jpg"
                  width={100}
                  height={100}
                  className="rounded-full h-10 w-10"
                  alt="assistant"
                  quality={100}
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
              <h3 className="text-base font-bold  my-0 py-0 capitalize text-[#363636]">
                {chatProfile.assistant_name}
              </h3>
              <span className="text-xs text-gray-500 my-0 py-0">
                {online ? "online" : "offline"}
              </span>
            </div>
          </div>
          <button className="w-5 h-5">
            <FaPhone size={20} color="#363636" />
          </button>
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
              thinking={false}
            />
          ))}
          {thinking ? (
            <Message message="" message_type={AI} thinking={true} />
          ) : (
            <></>
          )}
        </div>
        <div className="flex flex-row items-center bg-white h-12 rounded-b-lg">
          <textarea
            className="flex-1 px-3 py-2 resize-none  rounded-bl-lg border-transparent !outline-none focus:border-transparent focus:ring-0 focus:outline-transparent h-full placeholder:text-[#959595]"
            type="text"
            name="message"
            placeholder="Type your question"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
            multiple
          />
          <button
            onClick={sendMessage}
            className={` justify-center items-center mr-2 ${
              message.length > 0 ? "flex" : "hidden "
            }`}
          >
            <IoMdSend className={`text-[#EDD447]`} size={26} />
          </button>
          <button
            onClick={sendMessage}
            className={`justify-center items-center mr-2 ${
              message.length > 0 ? "hidden" : "flex"
            }`}
          >
            <MdMicNone className="text-[#959595]" size={26} />
          </button>
        </div>
      </div>
      <div
        className="relative bg-gradient-to-b from-[#FFA751] to-[#FFE259] w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        onClick={() => !loading && setShowChatBot(!showChatBot)}
      >
        <div>
          {loading ? (
            <IoMdChatbubbles
              size={30}
              color="#fff"
              className={`animate-ping absolute`}
            />
          ) : (
            <></>
          )}

          <IoMdChatbubbles
            size={30}
            color="#fff"
            className={`transition ease-in-out delay-75 ${
              showChatBot ? "scale-0 rotate-90 h-0" : ""
            }`}
          />
          <IoMdClose
            size={30}
            color="#fff"
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
}

export default App;
