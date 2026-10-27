import React from "react";
import { cn } from "@/lib/utils";

type ParamType = {
  // Plays the sweep on mount; change the parent `key` to replay it
  animate?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
};

// The Petal mark means one thing: "the answer came from here".
// Resting state is fully highlighted, so reduced motion just skips the sweep.
export const highlightClasses =
  "box-decoration-clone bg-adey-petal bg-no-repeat bg-left px-0.5 text-inherit";

export default function Highlight({ animate = false, id, className, children }: ParamType) {
  return (
    <mark
      id={id}
      className={cn(
        highlightClasses,
        animate && "animate-highlight-sweep motion-reduce:animate-none",
        className
      )}
    >
      {children}
    </mark>
  );
}
