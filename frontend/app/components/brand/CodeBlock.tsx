"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "./Button";

type ParamType = {
  code: string;
  label: string;
  className?: string;
};

export default function CodeBlock({ code, label, className }: ParamType) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div data-ui className={cn("rounded-control bg-adey-highland text-adey-meadow", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-adey-meadow/15 px-4 py-2 text-sm">
        <span className="text-adey-meadow/75">{label}</span>
        <button
          type="button"
          onClick={copy}
          className={cn("rounded-control px-2 py-1 font-medium hover:bg-adey-meadow/10", focusRing(true))}
        >
          <span aria-live="polite">{copied ? "Copied" : "Copy code"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
