import { AI } from "@/app/constants/consts";

type PropType = {
  message: string;
  message_type: string;
  textColor: string;
  backgroundColor: string;
};
const ChatMessage = ({
  message,
  message_type,
  textColor,
  backgroundColor,
}: PropType) => {
  return (
    <div
      className={`flex w-full my-5 ${
        message_type === AI ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className="w-60 min-h-8 rounded-xl text-[#363636] text-left p-3"
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <p style={{ color: textColor }}>{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
