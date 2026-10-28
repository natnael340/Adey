import React from "react";
import { cn } from "@/lib/utils";
import { EMBED_CODE } from "../../constants/consts";
import ChatBubble from "../brand/ChatBubble";
import CodeBlock from "../brand/CodeBlock";
import SourceChip from "../brand/SourceChip";

const fragment = "rounded-sheet border border-adey-mist bg-adey-paper text-sm text-adey-seed";

// Each step reads left to right: what to do, what you enter, what comes back.
// The last step's answer is the finished result, so it gets the full width.
const STEPS = [
  {
    say: "First, add your documents.",
    call: (
      <div data-ui className={cn(fragment, "p-4")}>
        <p className="font-bold">Add resource</p>
        <p className="mt-3 text-adey-seed/70">Upload document</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {["returns-policy.pdf", "price-list.csv"].map((file) => (
            <span key={file} className="rounded-control bg-adey-meadow px-2.5 py-1.5">
              {file}
            </span>
          ))}
        </div>
      </div>
    ),
    response: (
      <ul data-ui className={cn(fragment, "divide-y divide-adey-mist")}>
        {[
          ["returns-policy.pdf", "6 pages"],
          ["price-list.csv", "212 rows"],
        ].map(([file, size]) => (
          <li key={file} className="flex items-center justify-between gap-4 px-4 py-3">
            <span>
              {file} <span className="text-adey-seed/70">· {size}</span>
            </span>
            <span className="font-medium text-adey-highland">Ready</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    say: "Then choose where Adey can appear.",
    call: (
      <div data-ui className={cn(fragment, "p-4")}>
        <p className="text-adey-seed/70">Allowed URLs</p>
        <p className="mt-1.5 rounded-control border border-adey-mist px-3 py-2">
          https://shop.example.com
        </p>
      </div>
    ),
    response: (
      <ul data-ui className={cn(fragment, "divide-y divide-adey-mist")}>
        <li className="flex justify-between gap-4 px-4 py-3">
          shop.example.com <span className="font-medium text-adey-highland">Adey appears</span>
        </li>
        <li className="flex justify-between gap-4 px-4 py-3">
          Any other site <span className="text-adey-seed/70">Stays off</span>
        </li>
      </ul>
    ),
  },
  {
    say: "Last, paste two lines into your site.",
    call: <CodeBlock label="Add to your site's <head>" code={EMBED_CODE} />,
    response: (
      <div data-ui className={cn(fragment, "space-y-3 p-5 text-base")}>
        <ChatBubble speaker="customer">Can I return a laptop I already opened?</ChatBubble>
        <div>
          <ChatBubble speaker="bot" className="border-transparent bg-adey-seed/[0.06]">
            Yes, within 14 days of delivery. Opened items are exchanged rather than refunded, so
            bring the charger and anything else that came in the box.
          </ChatBubble>
          <SourceChip fileName="returns-policy.pdf" page={2} targetId="source-documents" />
        </div>
      </div>
    ),
  },
];

export default function SetupSequence() {
  return (
    <ol className="space-y-16 lg:space-y-24">
      {STEPS.map((step, i) => {
        const last = i === STEPS.length - 1;
        return (
          <li
            key={step.say}
            className="reveal grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1.2fr)] lg:gap-x-10 lg:gap-y-6"
          >
            <p className="text-xl font-medium">{step.say}</p>
            <div className={cn(last && "lg:col-span-2")}>{step.call}</div>
            <div className={cn(last && "lg:col-span-2 lg:col-start-2")}>{step.response}</div>
          </li>
        );
      })}
    </ol>
  );
}
