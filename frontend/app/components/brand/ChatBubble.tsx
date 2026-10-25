import React from "react";
import { cn } from "@/lib/utils";

type ParamType = {
  speaker: "bot" | "customer";
  typing?: boolean;
  className?: string;
  children?: React.ReactNode;
};

function Typing() {
  return (
    <span className="flex items-center gap-1.5 py-2" aria-label="Adey is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-adey-seed animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

export default function ChatBubble({ speaker, typing = false, className, children }: ParamType) {
  const isBot = speaker === "bot";
  return (
    <div className={cn("flex", isBot ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[34ch] rounded-bubble px-4 py-2.5 text-base leading-normal",
          // the corner nearest the speaker is squared off
          isBot
            ? "rounded-bl-[3px] border border-adey-mist bg-adey-paper text-adey-seed"
            : "rounded-br-[3px] bg-adey-highland text-adey-meadow",
          className
        )}
      >
        <span className="sr-only">{isBot ? "Adey: " : "Customer: "}</span>
        {typing ? <Typing /> : children}
      </div>
    </div>
  );
}
