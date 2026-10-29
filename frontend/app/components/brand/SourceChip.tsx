"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "./Button";

type ParamType = {
  fileName: string;
  page?: number;
  // id of the <Highlight> this answer came from
  targetId?: string;
  className?: string;
};

// Fired on the passage before scrolling, so a carousel holding it can bring it forward
export const SHOW_SOURCE = "showsource";

export default function SourceChip({ fileName, page, targetId, className }: ParamType) {
  const showSource = () => {
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    el.dispatchEvent(new Event(SHOW_SOURCE, { bubbles: true }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    if (reduced) return;
    // restart the sweep so the passage flashes
    el.classList.remove("animate-highlight-sweep");
    void el.offsetWidth;
    el.classList.add("animate-highlight-sweep");
  };

  return (
    <button
      type="button"
      onClick={showSource}
      className={cn(
        "ml-1 mt-1.5 inline-block rounded-control font-document text-sm text-adey-seed/80 underline decoration-adey-mist decoration-1 underline-offset-[3px] hover:text-adey-seed hover:decoration-adey-petal hover:decoration-2",
        focusRing(),
        className
      )}
    >
      From <em className="italic">{fileName}</em>
      {page !== undefined && `, page ${page}`}
    </button>
  );
}
