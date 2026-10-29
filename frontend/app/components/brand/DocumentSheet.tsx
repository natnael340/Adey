import React from "react";
import { cn } from "@/lib/utils";

type ParamType = {
  fileName: string;
  page?: number;
  className?: string;
  children: React.ReactNode;
};

// A page from the customer's own documents, so it's set in their voice (Newsreader)
export default function DocumentSheet({ fileName, page, className, children }: ParamType) {
  return (
    <figure
      className={cn(
        "rounded-sheet border border-adey-mist bg-adey-paper px-6 pb-8 pt-4 sm:px-10",
        className
      )}
    >
      <figcaption className="mb-6 flex items-baseline justify-between gap-4 border-b border-adey-mist pb-3 font-grotesk text-sm text-adey-seed/70">
        <span className="truncate">{fileName}</span>
        {page !== undefined && <span className="shrink-0">Page {page}</span>}
      </figcaption>
      <div className="max-w-[60ch] space-y-4 font-document text-[1.0625rem] leading-[1.65] text-adey-seed">
        {children}
      </div>
    </figure>
  );
}
