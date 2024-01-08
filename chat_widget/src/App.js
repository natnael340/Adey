import { useEffect, useRef, useState } from "react";
import { IoMdChatbubbles, IoMdClose, IoMdSend } from "react-icons/io";
import Message from "./components/Message";
import useWebSocket, { ReadyState } from "react-use-websocket";

export const [HUMAN, AI] = ["HUMAN", "AI"];
const CHAT_ID = "f7b9f25f-85d9-49d5-a006-1c48df546d8f";
function App() {
  const [showChatBot, setShowChatBot] = useState(false);
  const chat_window = useRef(null);
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  useEffect(() => {
    if (chat_window.current) {
      chat_window.current.scrollTop = chat_window.current.scrollHeight;
    }
    const count = messages.reduce((sum, msg) => (msg.seen ? sum : sum + 1), 0);
    setUnseenCount(count);
  }, [messages]);
  useEffect(() => {
    if (showChatBot) {
      const msgs = messages.map((msg) => ({ ...msg, seen: true }));
      setMessages(msgs);
    }
  }, [showChatBot]);
  useEffect(() => {
    (async () => {
      const response = await fetch(
        `http://192.168.51.172:8000/api/v1/rag/${CHAT_ID}/messages/`
      );
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const msgs = data.map((msg) => ({
        message: msg.message,
        message_type: msg.message_type,
        seen: showChatBot,
      }));
      setMessages(msgs);
    })();
  }, []);
  const { readyState, sendJsonMessage } = useWebSocket(
    `ws://127.0.0.1:8000/rag/${CHAT_ID}/messages/`,
    {
      onOpen: () => {
        setOnline(true);
      },
      onClose: () => {
        setOnline(false);
      },
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        setMessages([
          ...messages,
          {
            message: data.message,
            message_type: AI,
            seen: showChatBot,
          },
        ]);
      },
    }
  );
  const sendMessage = () => {
    sendJsonMessage({
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
  return (
    <div className="fixed bottom-12 right-12 flex flex-col items-end gap-y-5">
      <div
        className={`${
          showChatBot
            ? "h-96 w-[19rem] rounded-lg bg-white shadow-lg flex flex-col"
            : "hidden"
        }`}
      >
        <div className="flex flex-row items-center justify-between w-full rounded-lg bg-[#FFFF00] bg-opacity-25 px-3 py-2">
          <div className="flex flex-row items-center gap-x-2 py-1">
            <img
              src="http://192.168.51.172:8000/media/Xzh3R6N3.jpg"
              width={100}
              height={100}
              className="rounded-full h-10 w-10"
              alt="assistant"
              quality={100}
            />
            <div className="flex flex-col gap-y-0 justify-center">
              <h3 className="text-base font-semibold  my-0 py-0">Henok</h3>
              <span className="text-xs text-gray-500 my-0 py-0">
                Customer Support
              </span>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              online ? "bg-green-500" : "bg-gray-500"
            }`}
          />
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
            />
          ))}
        </div>
        <div className="flex flex-row items-center bg-white h-12 rounded-b-lg">
          <input
            className="flex-1 px-3 py-2 rounded-bl-lg border-transparent !outline-none focus:border-transparent focus:ring-0 focus:outline-transparent h-full"
            type="text"
            name="message"
            placeholder="your question"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
          />
          <button
            onClick={sendMessage}
            className={`flex justify-center items-center w-8 h-8 rounded-full bg-[#EDD447] mr-2 ${
              message.length > 0 ? "" : "bg-opacity-30"
            }`}
          >
            <IoMdSend className="ml-1 text-white" />
          </button>
        </div>
      </div>
      <div
        className="relative bg-gradient-to-b from-[#FFA751] to-[#FFE259] w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        onClick={() => setShowChatBot(!showChatBot)}
      >
        <div>
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

        <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-center text-white flex items-center justify-center">
          <span className="text-white text-xs font-semibold">
            {unseenCount}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
