import React from "react";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  body: React.ReactNode;
};

// Only for content that really is a sequence, like setup
export default function Steps({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={cn("space-y-8", className)}>
      {steps.map((step, i) => (
        <li key={step.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4">
          <span
            aria-hidden
            className="text-4xl font-extrabold leading-none tracking-[-0.02em] text-adey-highland"
          >
            {i + 1}
          </span>
          <div className="space-y-2">
            <h3 className="text-lg font-bold leading-snug">{step.title}</h3>
            <div className="max-w-[60ch] text-adey-seed/85">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
