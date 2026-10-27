"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import AdeyCharacter from "./AdeyCharacter";
import type { Mood } from "./AdeyScene";
import ChatBubble from "../brand/ChatBubble";
import SourceChip from "../brand/SourceChip";
import { focusRing } from "../brand/Button";

type Exchange = {
  label: string;
  question: string;
  answer: string;
  // targetId points at the matching row in "Where answers come from"
  source?: { fileName: string; page?: number; targetId: string };
};

// One question per thing Adey can do: documents, your API, your calendar, your team
const EXCHANGES: Exchange[] = [
  {
    label: "Return a laptop",
    question: "Can I return a laptop I already opened?",
    answer:
      "Yes, within 14 days of delivery. Opened items are exchanged rather than refunded, so bring the charger and anything else that came in the box.",
    source: {
      fileName: "returns-policy.pdf",
      page: 2,
      targetId: "source-documents",
    },
  },
  {
    label: "Track an order",
    question: "Where is my order? It's 4471.",
    answer:
      "Order 4471 left our warehouse this morning. It should reach you by 17:00 today.",
    source: { fileName: "your order system", targetId: "source-systems" },
  },
  {
    label: "Book a repair",
    question: "Can I bring my phone in for repair on Thursday?",
    answer:
      "Thursday at 10:00 is free at our store. I've booked it and sent the invitation to your email.",
    source: { fileName: "repairs calendar", targetId: "source-calendar" },
  },
  {
    label: "Talk to a person",
    question: "Can I talk to a person, please?",
    answer:
      "Of course. Maya from our support team has this conversation and will reply here, usually within 5 minutes.",
  },
];

// The first question waits for Adey's intro to finish
const INTRO_MS = 1000;
const THINKING_MS = 1000;
const ANSWERING_MS = 1200;
// The old conversation fades out before the next question comes in
const LEAVING_MS = 180;

type Phase = "waiting" | "thinking" | "answering" | "done";

// children: the hero's headline, sentence and action, which sit beside the flower
export default function HeroDemo({ children }: { children: React.ReactNode }) {
  const [turn, setTurn] = useState({ index: 0, count: 0 });
  const [phase, setPhase] = useState<Phase>("waiting");
  // What was on screen when a chip was clicked, shown while it fades out
  const [leaving, setLeaving] = useState<{
    index: number;
    phase: Phase;
  } | null>(null);

  useEffect(() => {
    const wait = turn.count === 0 ? INTRO_MS : LEAVING_MS;
    setPhase("waiting");
    const timers = [
      setTimeout(() => setPhase("thinking"), wait),
      setTimeout(() => setPhase("answering"), wait + THINKING_MS),
      setTimeout(() => setPhase("done"), wait + THINKING_MS + ANSWERING_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [turn]);

  const ask = (index: number) => {
    setLeaving({ index: turn.index, phase });
    setTurn((t) => ({ index, count: t.count + 1 }));
  };

  const exchange = EXCHANGES[turn.index];
  const mood: Mood =
    phase === "thinking" || phase === "answering" ? phase : "idle";

  return (
    <div className="grid items-center gap-x-16 gap-y-12 pb-16 pt-10 lg:min-h-[min(calc(100svh-4.5rem),48rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pb-20 lg:pt-40">
      <div>{children}</div>

      {/* A chat widget as customers see it. Adey stands on its top edge, outside the layout,
          so the card itself lines up with the headline */}
      <div className="relative mx-auto mt-36 w-full max-w-[26rem] sm:mt-44 lg:mt-0">
        <PetalRing className="pointer-events-none absolute left-1/2 top-1/2 w-[220%] max-w-none -translate-x-1/2 -translate-y-1/2 text-adey-paper/[0.06]" />
        <AdeyCharacter
          mood={mood}
          className="absolute bottom-full left-1/2 z-10 w-44 -translate-x-1/2 translate-y-8 sm:w-52"
        />

        <div className="relative rounded-bubble bg-adey-paper text-adey-seed">
          <div className="flex items-center gap-2 px-5 pb-3 pt-10 font-bold">
            <img src="/brand/adey-mark.svg" alt="" className="h-6 w-6" />
            Adey
          </div>

          {/* Fits the longest answer (measured: 272px on a phone, 224px wider), so the card never jumps */}
          <div aria-live="polite" className="min-h-[17rem] px-5 py-3 sm:min-h-[14.5rem]">
            {phase === "waiting" && leaving ? (
              <div
                key={`out-${turn.count}`}
                aria-hidden
                className="motion-safe:animate-bubble-out"
              >
                <Conversation
                  exchange={EXCHANGES[leaving.index]}
                  phase={leaving.phase}
                />
              </div>
            ) : (
              <Conversation
                key={`in-${turn.count}`}
                exchange={exchange}
                phase={phase}
              />
            )}
          </div>

          <div className="border-t border-adey-seed/10 px-5 pb-5 pt-4">
            <p
              id="hero-questions"
              className="text-sm font-medium text-adey-seed/80"
            >
              Ask what your customers ask
            </p>
            <div
              role="group"
              aria-labelledby="hero-questions"
              className="mt-2 grid grid-cols-2 gap-2"
            >
              {EXCHANGES.map((e, i) => (
                <button
                  key={e.label}
                  type="button"
                  aria-pressed={i === turn.index}
                  onClick={() => ask(i)}
                  className={cn(
                    "cursor-pointer rounded-control border-[1.5px] border-adey-seed/25 px-3 py-2 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97]",
                    // Hover only where there is a pointer, so taps don't leave a stuck highlight
                    i === turn.index
                      ? "border-adey-highland bg-adey-highland text-adey-paper"
                      : "[@media(hover:hover)]:hover:border-adey-seed/60 [@media(hover:hover)]:hover:bg-adey-seed/[0.06]",
                    focusRing(),
                  )}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Conversation({
  exchange,
  phase,
}: {
  exchange: Exchange;
  phase: Phase;
}) {
  const answered = phase === "answering" || phase === "done";
  return (
    <div className="space-y-3">
      {phase !== "waiting" && (
        <ChatBubble
          speaker="customer"
          className="motion-safe:animate-bubble-in"
        >
          {exchange.question}
        </ChatBubble>
      )}
      {answered && (
        <div className="motion-safe:animate-bubble-in">
          <ChatBubble
            speaker="bot"
            className="border-transparent bg-adey-seed/[0.06]"
          >
            {exchange.answer}
          </ChatBubble>
          {exchange.source && (
            <SourceChip
              fileName={exchange.source.fileName}
              page={exchange.source.page}
              targetId={exchange.source.targetId}
            />
          )}
        </div>
      )}
    </div>
  );
}

// The Adey Abeba's petals, without the seed, as a quiet backdrop
function PetalRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M136.3 87.06 C137.49 65.9 137.97 41.21 145.63 22.73 A15 15 0 0 1 165 17.77 A13 13 0 0 1 179.78 23.89 A15 15 0 0 1 189.97 41.1 C182.32 59.58 165.2 77.38 151.08 93.18 A41 41 0 0 0 136.3 87.06Z M162.82 104.92 C178.62 90.8 196.42 73.68 214.9 66.03 A15 15 0 0 1 232.11 76.22 A13 13 0 0 1 238.23 91 A15 15 0 0 1 233.27 110.37 C214.79 118.03 190.1 118.51 168.94 119.7 A41 41 0 0 0 162.82 104.92Z M168.94 136.3 C190.1 137.49 214.79 137.97 233.27 145.63 A15 15 0 0 1 238.23 165 A13 13 0 0 1 232.11 179.78 A15 15 0 0 1 214.9 189.97 C196.42 182.32 178.62 165.2 162.82 151.08 A41 41 0 0 0 168.94 136.3Z M151.08 162.82 C165.2 178.62 182.32 196.42 189.97 214.9 A15 15 0 0 1 179.78 232.11 A13 13 0 0 1 165 238.23 A15 15 0 0 1 145.63 233.27 C137.97 214.79 137.49 190.1 136.3 168.94 A41 41 0 0 0 151.08 162.82Z M119.7 168.94 C118.51 190.1 118.03 214.79 110.37 233.27 A15 15 0 0 1 91 238.23 A13 13 0 0 1 76.22 232.11 A15 15 0 0 1 66.03 214.9 C73.68 196.42 90.8 178.62 104.92 162.82 A41 41 0 0 0 119.7 168.94Z M93.18 151.08 C77.38 165.2 59.58 182.32 41.1 189.97 A15 15 0 0 1 23.89 179.78 A13 13 0 0 1 17.77 165 A15 15 0 0 1 22.73 145.63 C41.21 137.97 65.9 137.49 87.06 136.3 A41 41 0 0 0 93.18 151.08Z M87.06 119.7 C65.9 118.51 41.21 118.03 22.73 110.37 A15 15 0 0 1 17.77 91 A13 13 0 0 1 23.89 76.22 A15 15 0 0 1 41.1 66.03 C59.58 73.68 77.38 90.8 93.18 104.92 A41 41 0 0 0 87.06 119.7Z M104.92 93.18 C90.8 77.38 73.68 59.58 66.03 41.1 A15 15 0 0 1 76.22 23.89 A13 13 0 0 1 91 17.77 A15 15 0 0 1 110.37 22.73 C118.03 41.21 118.51 65.9 119.7 87.06 A41 41 0 0 0 104.92 93.18Z"
      />
    </svg>
  );
}
