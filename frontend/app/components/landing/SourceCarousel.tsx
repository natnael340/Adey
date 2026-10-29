"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import Button, { chip } from "../brand/Button";
import { SHOW_SOURCE } from "../brand/SourceChip";
import DocumentSheet from "../brand/DocumentSheet";
import Highlight from "../brand/Highlight";

// The passage an answer came from: lit in Petal only on the centred card, sweeping as it lands.
// The id stays put so the hero's source chips can find it.
function Passage({ id, lit, children }: { id?: string; lit: boolean; children: React.ReactNode }) {
  return lit ? (
    <Highlight id={id} animate className="[animation-delay:450ms]">
      {children}
    </Highlight>
  ) : (
    <span id={id} className="px-0.5">
      {children}
    </span>
  );
}

const panel = "rounded-sheet border border-adey-mist bg-adey-paper text-sm text-adey-seed";

type Source = { name: string; body: string; render: (lit: boolean) => React.ReactNode };

const SOURCES: Source[] = [
  {
    name: "Your documents",
    body: "Upload PDFs, CSV files, web pages or plain text. Every answer links to the passage it came from.",
    render: (lit) => (
      <DocumentSheet fileName="returns-policy.pdf" page={2}>
        <p>Unopened items can be returned within 30 days of delivery for a full refund.</p>
        <p>
          <Passage id="source-documents" lit={lit}>
            Opened items can be exchanged within 14 days of delivery, provided all original
            accessories are included.
          </Passage>
        </p>
        <p>Gift cards and software licences cannot be returned once activated.</p>
      </DocumentSheet>
    ),
  },
  {
    name: "Your systems",
    body: "Connect an API and Adey looks things up mid-conversation: order status, stock, bookings.",
    render: (lit) => (
      <div className={panel}>
        <p className="border-b border-adey-mist px-4 py-3 font-bold">Order 4471</p>
        <dl className="divide-y divide-adey-mist">
          {[
            ["Customer", "Alex M."],
            ["Items", "Phone case, USB-C charger"],
            ["Shipped", "Today, 08:40"],
          ].map(([term, value]) => (
            <div key={term} className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-adey-seed/70">{term}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-adey-seed/70">Status</dt>
            <dd className="text-right">
              <Passage id="source-systems" lit={lit}>
                Out for delivery, by 17:00 today
              </Passage>
            </dd>
          </div>
        </dl>
      </div>
    ),
  },
  {
    name: "Your calendar",
    body: "Adey books appointments into your Google Calendar from an ordinary chat.",
    render: (lit) => (
      <div className={panel}>
        <p className="border-b border-adey-mist px-4 py-3 font-bold">Repairs, Thursday</p>
        <ul className="space-y-1 p-2">
          <li className="rounded-control px-2 py-2">09:00 Screen replacement</li>
          <li className="rounded-control bg-adey-meadow px-2 py-2">
            <Passage id="source-calendar" lit={lit}>
              10:00 Phone repair, booked by Adey
            </Passage>
          </li>
          <li className="rounded-control px-2 py-2 text-adey-seed/70">11:00 Free</li>
          <li className="rounded-control px-2 py-2">12:00 Battery check</li>
        </ul>
      </div>
    ),
  },
  {
    name: "Your team",
    body: "When a customer asks for a person, the chat goes to your team with everything said so far.",
    render: (lit) => (
      <div className={panel}>
        <div className="flex items-center gap-3 border-b border-adey-mist px-4 py-3">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-adey-highland font-bold text-adey-paper"
          >
            M
          </span>
          <p>
            <span className="font-bold">Handed to Maya</span>
            <span className="text-adey-seed/70"> at 14:02</span>
          </p>
        </div>
        <p className="px-4 py-4 leading-relaxed">
          <Passage lit={lit}>The customer would like to talk to a person.</Passage> Earlier they
          booked a phone repair for Thursday at 10:00.
        </p>
      </div>
    ),
  },
];

const N = SOURCES.length;
const DWELL_MS = 4500;
const MOVE_MS = 650;
// Strong ease-in-out: the cards are moving on screen, not entering it
const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";
// Distance between card centres; side cards peek in from the edges on a phone
const GAP = "min(64vw, 30rem)";

const mod = (a: number) => ((a % N) + N) % N;

// Where each slot sits: centre, the two neighbours zoomed out and dimmed, and off-stage on either side
function place(slot: number) {
  const distance = Math.abs(slot);
  return {
    transform: `translateX(calc(${slot} * ${GAP})) scale(${[1, 0.84, 0.7][distance]})`,
    opacity: [1, 0.35, 0][distance],
    zIndex: 3 - distance,
  };
}

// Nearest way round from one card to another, so a neighbour is always one place away
function shortest(delta: number) {
  const d = mod(delta);
  return d > N / 2 ? d - N : d;
}
console.assert(shortest(1) === 1 && shortest(N - 1) === -1 && shortest(-1) === -1, "neighbours are one step away");

export default function SourceCarousel() {
  const stage = useRef<HTMLDivElement>(null);
  // Unbounded, so the row always moves the way it was pushed; the centred card is step mod N
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  // The card that just left waits off-stage, then hops unseen to the side it will enter from next
  const [parked, setParked] = useState(true);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const lastSlots = useRef<number[]>([]);

  const active = mod(step);
  const playing = !paused && !held && onScreen && !reduced;

  const go = (delta: number) => {
    setDirection(Math.sign(delta));
    setParked(false);
    setStep((s) => s + delta);
  };
  // Opposite card: two single slides, the second once the first has parked its leaver
  const goTo = (index: number) => {
    const delta = shortest(index - active);
    if (Math.abs(delta) === 2) {
      go(1);
      setTimeout(() => go(1), MOVE_MS);
    } else if (delta) go(delta);
  };
  const goToRef = useRef(goTo);
  goToRef.current = goTo;

  useEffect(() => {
    const el = stage.current!;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    const observer = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    observer.observe(el);
    // A source chip elsewhere asked for one of these passages: bring its card to the centre
    const show = (e: Event) => {
      const card = (e.target as Element).closest<HTMLElement>("[data-index]");
      if (card) goToRef.current(Number(card.dataset.index));
    };
    el.addEventListener(SHOW_SOURCE, show);
    return () => {
      media.removeEventListener("change", syncMotion);
      observer.disconnect();
      el.removeEventListener(SHOW_SOURCE, show);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setParked(true), MOVE_MS);
    return () => clearTimeout(t);
  }, [step]);

  // A fresh dwell after every move, so a click never gets cut short by the timer
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(1), DWELL_MS);
    return () => clearTimeout(t);
  }, [playing, step]);

  const slots = SOURCES.map((_, i) => {
    const slot = shortest(i - step);
    // Off-stage: on the way out it slides further on; once parked it waits on the side it will enter from
    return Math.abs(slot) > 1 ? (parked ? 2 : -2) * direction : slot;
  });
  useEffect(() => {
    lastSlots.current = slots;
  });

  // A shrunken card is still a target, so the stage stays put while the mouse is on it
  const hold = (on: boolean) => (e: React.PointerEvent) => e.pointerType === "mouse" && setHeld(on);

  return (
    <div>
      {/* Full bleed, so the side cards run off the screen's edges rather than the page margin */}
      <div
        ref={stage}
        onPointerEnter={hold(true)}
        onPointerLeave={hold(false)}
        className="-mx-[var(--gutter)] grid place-items-center overflow-hidden py-6"
      >
        {SOURCES.map((s, i) => {
          const slot = slots[i];
          const last = lastSlots.current[i] ?? slot;
          // Never slide a card across the centre: it jumps unseen or fades where it lands
          const crosses = last * slot < 0;
          const timing = `${MOVE_MS}ms ${EASE}`;
          // Only the two visible neighbours are targets; an off-stage card is invisible but can sit on screen
          const side = Math.abs(slot) === 1;
          return (
            <div
              key={s.name}
              data-ui
              data-index={i}
              aria-hidden={slot !== 0}
              onClick={side ? () => go(slot) : undefined}
              className={cn(
                // Every card as tall as the tallest, so one shape zooms through instead of four
                "w-[min(78vw,27rem)] self-stretch [grid-area:1/1] [&>*]:h-full",
                slot !== 0 && "select-none [&_*]:pointer-events-none",
                side ? "cursor-pointer" : slot !== 0 && "pointer-events-none",
              )}
              style={{
                ...place(slot),
                transition: reduced
                  ? "opacity 200ms ease"
                  : crosses
                    ? `opacity ${timing}`
                    : `transform ${timing}, opacity ${timing}`,
              }}
            >
              {s.render(slot === 0)}
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-[46rem] text-center">
        <div role="group" aria-label="Sources" className="flex flex-wrap items-center justify-center gap-2">
          {SOURCES.map((s, i) => (
            <button
              key={s.name}
              type="button"
              aria-pressed={i === active}
              onClick={() => goTo(i)}
              className={chip(i === active)}
            >
              {s.name}
            </button>
          ))}
          {!reduced && (
            <Button
              variant="secondary"
              aria-label={paused ? "Play" : "Pause"}
              onClick={() => setPaused((p) => !p)}
              className="border-adey-seed/25 px-2.5 py-2"
            >
              {paused ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {/* Announced only when the visitor chose it, not on every automatic turn */}
        <div aria-live={playing ? "off" : "polite"} className="mt-6">
          <h3 className="text-2xl font-bold leading-snug">{SOURCES[active].name}</h3>
          <p className="mx-auto mt-2 max-w-[44ch] text-lg">{SOURCES[active].body}</p>
        </div>
      </div>
    </div>
  );
}
