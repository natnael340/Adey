import React from "react";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  body: React.ReactNode;
};

// Only for content that really is a sequence, like setup
export default function Steps({
  steps,
  tone = "light",
  className,
}: {
  steps: Step[];
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <ol className={cn("space-y-8", className)}>
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="reveal grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4"
        >
          <span
            aria-hidden
            className={cn(
              "text-4xl font-extrabold leading-none tracking-[-0.02em]",
              tone === "dark" ? "text-adey-petal" : "text-adey-highland",
            )}
          >
            {i + 1}
          </span>
          <div className="space-y-2">
            <h3 className="text-xl font-bold leading-snug">{step.title}</h3>
            {/* Rich bodies like a code block get the full column */}
            <div
              className={cn(
                "text-lg",
                typeof step.body === "string" && "max-w-[60ch]",
              )}
            >
              {step.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
