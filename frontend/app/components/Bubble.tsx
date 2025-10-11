import React from "react";
import { Bot, User } from "lucide-react";

const brandYellow = "#F3E37A";

type ParamType = {
  messageType: "user" | "bot";
  children: React.ReactNode;
};

export default function Bubble({ messageType = "bot", children }: ParamType) {
  const isBot = messageType === "bot";
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`flex items-end gap-2 ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar to signal AI vs Human */}
        <div
          className={`h-7 w-7 shrink-0 rounded-full border flex items-center justify-center ${
            isBot
              ? "bg-[var(--brand-yellow)] border-yellow-300"
              : "bg-slate-200 border-slate-300"
          }`}
          style={{ ["--brand-yellow" as any]: brandYellow }}
          aria-label={isBot ? "AI" : "You"}
          title={isBot ? "AI" : "You"}
        >
          {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        {/* Bubble */}
        <div
          className={`max-w-[260px] text-sm leading-6 rounded-2xl shadow-xs border text-slate-900 ${
            isBot
              ? "bg-[var(--brand-yellow)] border-yellow-200"
              : "bg-white border-slate-200"
          } px-4 py-2.5`}
          style={{ ["--brand-yellow" as any]: "rgba(243, 227, 122, 0.8)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
