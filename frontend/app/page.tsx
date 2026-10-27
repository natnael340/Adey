import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { brandFonts } from "./fonts";
import { cn } from "@/lib/utils";
import { EMBED_CODE } from "./constants/consts";
import HeroDemo from "./components/landing/HeroDemo";
import Button, { focusRing } from "./components/brand/Button";
import CodeBlock from "./components/brand/CodeBlock";
import DocumentSheet from "./components/brand/DocumentSheet";
import Highlight from "./components/brand/Highlight";
import Section from "./components/brand/Section";
import Steps from "./components/brand/Steps";

// Edge to edge with a fluid gutter: no centred max-width column
const shell = "px-[clamp(1rem,5vw,6rem)]";

const navLink = cn(
  "rounded-control font-medium hover:underline hover:underline-offset-[3px]",
  focusRing(true),
);

// Each row's highlight is what a hero answer's source chip scrolls to
const sources = [
  {
    title: "Your documents",
    body: "Upload PDFs, CSV files, web pages or plain text. Every answer links to the passage it came from.",
    artifact: (
      <DocumentSheet fileName="returns-policy.pdf" page={2}>
        <p>
          Unopened items can be returned within 30 days of delivery for a full
          refund.
        </p>
        <p>
          <Highlight id="source-documents">
            Opened items can be exchanged within 14 days of delivery, provided
            all original accessories are included.
          </Highlight>
        </p>
      </DocumentSheet>
    ),
  },
  {
    title: "Your systems",
    body: "Connect an API and Adey looks things up mid-conversation: order status, stock, bookings.",
    artifact: (
      <DocumentSheet fileName="Order 4471, from your order system">
        <p>Customer: Alex M.</p>
        <p>
          <Highlight id="source-systems">
            Status: out for delivery, expected by 17:00 today
          </Highlight>
        </p>
      </DocumentSheet>
    ),
  },
  {
    title: "Your calendar",
    body: "Adey books appointments into your Google Calendar from an ordinary chat.",
    artifact: (
      <DocumentSheet fileName="Repairs calendar, Thursday">
        <p>09:00 Screen replacement</p>
        <p>
          <Highlight id="source-calendar">
            10:00 Phone repair, booked by Adey
          </Highlight>
        </p>
        <p>11:00 Free</p>
      </DocumentSheet>
    ),
  },
  {
    title: "Your team",
    body: "When a customer asks for a person, the chat goes to your team with everything said so far.",
    artifact: (
      <DocumentSheet fileName="Handed to Maya at 14:02">
        <p>
          The customer would like to talk to a person. They asked about a phone
          repair on Thursday, booked for 10:00.
        </p>
      </DocumentSheet>
    ),
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    // Root is <main>, not <div>: the chat widget prepends a <div> to <body> before hydration.
    // Colours are the Adey Abeba's own: yellow petals on the green highlands, with a brown seed
    <main
      data-canvas="highland"
      className={cn(
        brandFonts,
        "min-h-screen bg-adey-paper font-grotesk text-adey-seed antialiased",
      )}
    >
      <header className="sticky top-0 z-40 bg-adey-highland text-adey-paper">
        <div
          className={cn(
            shell,
            "flex h-[4.5rem] items-center justify-between gap-6",
          )}
        >
          <Link href="/" className={cn("rounded-control", focusRing(true))}>
            <img
              src="/brand/adey-lockup-horizontal-reversed.svg"
              alt="Adey"
              className="h-8 w-auto"
            />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-6">
            <Link href="/features" className={cn(navLink, "hidden sm:inline")}>
              Features
            </Link>
            {session ? (
              <Link href="/dashboard" className={navLink}>
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/login" className={navLink}>
                Sign in
              </Link>
            )}
            <Button
              href="/auth/signup"
              onDark
              className="hidden md:inline-flex"
            >
              Create your assistant
            </Button>
          </nav>
        </div>
      </header>

      <section
        aria-label="Adey"
        className={cn(
          shell,
          "overflow-hidden bg-adey-highland text-adey-paper",
        )}
      >
        <HeroDemo>
          <h1 className="max-w-[14ch] text-balance text-[11vw] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-[clamp(3.5rem,6vw,6.5rem)]">
            Answers from your own files
          </h1>
          <p className="mt-8 max-w-[46ch] text-lg sm:text-xl">
            Adey is a chat assistant for your website. It reads your price
            lists, policies and FAQs, answers customers at any hour, checks
            orders, books appointments, and shows where every answer came from.
          </p>
          <Button href="/auth/signup" onDark className="mt-8">
            Create your assistant
          </Button>
        </HeroDemo>
      </section>

      <div className={shell}>
        <Section
          id="sources"
          title="Where answers come from"
          rule={
            <p>
              Adey answers from what you give it. When it can&apos;t help, it
              hands the conversation to your team.
            </p>
          }
        >
          <div className="space-y-16 lg:space-y-24">
            {sources.map((s) => (
              <div
                key={s.title}
                className="reveal grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-16"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold leading-snug tracking-[-0.02em]">
                    {s.title}
                  </h3>
                  <p className="max-w-[40ch] text-lg">{s.body}</p>
                </div>
                {s.artifact}
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className={cn(shell, "bg-adey-highland text-adey-paper")}>
        <Section
          id="setup"
          title="Live on your site in three steps"
          rule={
            <p>No code until the last step, and then it&apos;s two lines.</p>
          }
        >
          <Steps
            tone="dark"
            steps={[
              {
                title: "Upload your documents",
                body: "Price lists, policies, FAQs and product sheets.",
              },
              {
                title: "Choose where Adey can appear",
                body: "Add the websites allowed to load your assistant.",
              },
              {
                title: "Paste the embed code",
                body: (
                  <CodeBlock
                    label="Add to your site's <head>"
                    code={EMBED_CODE}
                    className="mt-3 bg-adey-seed"
                  />
                ),
              },
            ]}
          />
        </Section>
      </div>

      <section
        aria-labelledby="start-title"
        className="overflow-hidden bg-adey-petal"
      >
        <div
          className={cn(
            shell,
            "reveal grid items-center gap-10 py-20 md:grid-cols-[minmax(0,1fr)_auto] lg:py-32",
          )}
        >
          <div>
            <h2
              id="start-title"
              className="text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] lg:text-[clamp(3.5rem,5vw,5.5rem)]"
            >
              Start with one document
            </h2>
            <p className="mt-6 max-w-[48ch] text-lg sm:text-xl">
              Upload your returns policy or price list and ask Adey about it
              before you put it on your site.
            </p>
            <Button
              href="/auth/signup"
              className="mt-8 bg-adey-seed text-adey-paper hover:bg-adey-highland"
            >
              Create your assistant
            </Button>
          </div>
          <img
            src="/brand/adey-mark-mono-3a2614.svg"
            alt=""
            className="hidden h-48 w-48 md:block lg:h-56 lg:w-56"
          />
        </div>
      </section>

      <footer className={cn(shell, "bg-adey-highland py-14 text-adey-paper")}>
        <img
          src="/brand/adey-lockup-horizontal-reversed.svg"
          alt="Adey"
          className="h-10 w-auto"
        />
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/features" className={navLink}>
              Features
            </Link>
            <Link href="/privacy" className={navLink}>
              Privacy
            </Link>
            <Link href="/tos" className={navLink}>
              Terms
            </Link>
            <a href="https://github.com/natnael340/Adey" className={navLink}>
              GitHub
            </a>
          </nav>
          <p>© {new Date().getFullYear()} Adey</p>
        </div>
      </footer>
    </main>
  );
}
